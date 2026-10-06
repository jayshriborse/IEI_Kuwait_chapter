import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CardTokenService } from './card-token.service';
import { SubscriptionStatus } from '../generated/prisma/client';
import { CheckInDto, BatchSyncDto } from './dto/check-in.dto';
import { RsvpDto } from './dto/rsvp.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cardTokenService: CardTokenService,
  ) {}

  /**
   * Helper to verify raw scan inputs or manual member code.
   * If a JWT is provided (3 segments), verifies Ed25519 signature.
   * If manual code is provided, normalizes code.
   * Throws BadRequestException on invalid or tampered token.
   */
  public verifyAndExtractMemberCode(rawInput: string): { memberCode: string; isToken: boolean } {
    if (!rawInput || typeof rawInput !== 'string') {
      throw new BadRequestException('A valid member code or signed QR token is required');
    }

    const trimmed = rawInput.trim();

    // Check if it's a JWT token (3 base64url segments separated by dots)
    if (trimmed.split('.').length === 3) {
      const result = this.cardTokenService.verifyCardToken(trimmed);
      if (!result.isValid || !result.memberCode) {
        throw new BadRequestException(result.error || 'Invalid or tampered card token signature');
      }
      return { memberCode: result.memberCode, isToken: true };
    }

    // Check if it's a JSON payload
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        const code = parsed.memberCode || parsed.memberId || parsed.id;
        if (code) {
          return { memberCode: String(code).trim().toUpperCase(), isToken: false };
        }
      } catch {
        // Not valid JSON
      }
    }

    // Manual Member ID fallback (e.g. IEI0005)
    const clean = trimmed.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!clean) {
      throw new BadRequestException('Invalid member code format');
    }

    return { memberCode: clean, isToken: false };
  }

  public extractMemberCode(rawInput: string): string {
    try {
      const res = this.verifyAndExtractMemberCode(rawInput);
      return res.memberCode;
    } catch {
      return '';
    }
  }

  async checkIn(dto: CheckInDto, staffVolunteerId?: string) {
    if (!dto.eventId) {
      throw new BadRequestException('Event ID is required');
    }
    const eventId = dto.eventId;

    const { memberCode: cleanCode, isToken } = this.verifyAndExtractMemberCode(dto.memberCode);
    const isManualEntry = Boolean(dto.manual || !isToken);
    const volunteerId = isManualEntry
      ? dto.volunteerMemberId || staffVolunteerId || null
      : dto.volunteerMemberId || null;

    // Validate member exists in database
    const member = await this.prisma.member.findUnique({
      where: { memberCode: cleanCode },
    });

    if (!member) {
      throw new NotFoundException(`Member record not found for code: ${cleanCode}`);
    }

    // Take seats from member's RSVP, and flag if member has no RSVP
    const rsvp = await this.prisma.eventRsvp.findFirst({
      where: {
        eventId,
        OR: [
          { memberCode: member.memberCode },
          { memberId: member.id },
        ],
      },
    });

    const noRsvp = !rsvp;
    const seats = rsvp?.seats && rsvp.seats > 0 ? rsvp.seats : 1;

    // Check member's subscription dues for duesOverdue flag
    const latestSubscription = await this.prisma.memberSubscription.findFirst({
      where: { memberId: member.id },
      orderBy: { period: { endsOn: 'desc' } },
      include: { period: true },
    });
    const duesOverdue = latestSubscription
      ? latestSubscription.status === SubscriptionStatus.DUE
      : false;

    // Check if check-in already recorded
    const existing = await this.prisma.eventCheckIn.findUnique({
      where: {
        eventId_memberCode: {
          eventId,
          memberCode: cleanCode,
        },
      },
    });

    const parsedScannedAt = dto.scannedAt ? new Date(dto.scannedAt) : new Date();
    const validScannedAt = isNaN(parsedScannedAt.getTime()) ? new Date() : parsedScannedAt;

    if (existing) {
      this.logger.warn(`Duplicate check-in detected for ${cleanCode} at event ${eventId}`);
      return {
        success: true,
        isAlreadyCheckedIn: true,
        noRsvp,
        duesOverdue,
        message: 'Member has already checked in',
        data: {
          id: existing.id,
          memberCode: member.memberCode,
          name: member.fullName,
          grade: member.grade,
          discipline: member.discipline,
          seats: `${existing.seats} seat${existing.seats > 1 ? 's' : ''}`,
          checkInTime: this.formatTime(existing.scannedAt),
          scannedAt: existing.scannedAt.toISOString(),
          isOfflineRecorded: existing.deviceOffline,
          manual: existing.manual,
          volunteerMemberId: existing.volunteerMemberId,
          noRsvp,
          duesOverdue,
        },
      };
    }

    const newRecord = await this.prisma.eventCheckIn.create({
      data: {
        eventId,
        memberCode: member.memberCode,
        memberId: member.id,
        scannedAt: validScannedAt,
        syncedAt: new Date(),
        deviceOffline: Boolean(dto.deviceOffline),
        seats,
        manual: isManualEntry,
        volunteerMemberId: volunteerId,
      },
    });

    this.logger.log(
      `Check-in recorded for ${cleanCode} at ${newRecord.scannedAt.toISOString()} (seats: ${seats}, manual: ${isManualEntry}, volunteer: ${volunteerId})`,
    );

    return {
      success: true,
      isAlreadyCheckedIn: false,
      noRsvp,
      duesOverdue,
      message: 'Check-in recorded successfully',
      data: {
        id: newRecord.id,
        memberCode: member.memberCode,
        name: member.fullName,
        grade: member.grade,
        discipline: member.discipline,
        seats: `${seats} seat${seats > 1 ? 's' : ''}`,
        checkInTime: this.formatTime(newRecord.scannedAt),
        scannedAt: newRecord.scannedAt.toISOString(),
        isOfflineRecorded: newRecord.deviceOffline,
        manual: newRecord.manual,
        volunteerMemberId: newRecord.volunteerMemberId,
        noRsvp,
        duesOverdue,
      },
    };
  }

  async batchSync(dto: BatchSyncDto, staffVolunteerId?: string) {
    if (!dto.eventId) {
      throw new BadRequestException('Event ID is required');
    }
    const eventId = dto.eventId;
    const scans = dto.scans || [];

    let syncedCount = 0;
    let duplicateCount = 0;
    const processed: any[] = [];

    for (const scan of scans) {
      let cleanCode = '';
      let isToken = false;
      try {
        const resolved = this.verifyAndExtractMemberCode(scan.memberCode);
        cleanCode = resolved.memberCode;
        isToken = resolved.isToken;
      } catch {
        continue;
      }
      if (!cleanCode) continue;

      const isManualEntry = Boolean(scan.manual || !isToken);
      const volunteerId = isManualEntry
        ? scan.volunteerMemberId || staffVolunteerId || null
        : scan.volunteerMemberId || null;

      // Find member
      const member = await this.prisma.member.findUnique({
        where: { memberCode: cleanCode },
      });

      if (!member) {
        this.logger.warn(`Batch sync ignored unknown member: ${cleanCode}`);
        continue;
      }

      // Check RSVP for seats and warning flag
      const rsvp = await this.prisma.eventRsvp.findFirst({
        where: {
          eventId,
          OR: [
            { memberCode: member.memberCode },
            { memberId: member.id },
          ],
        },
      });
      const noRsvp = !rsvp;
      const seats = rsvp?.seats && rsvp.seats > 0 ? rsvp.seats : 1;

      // Check subscription dues for warning flag
      const latestSubscription = await this.prisma.memberSubscription.findFirst({
        where: { memberId: member.id },
        orderBy: { period: { endsOn: 'desc' } },
      });
      const duesOverdue = latestSubscription
        ? latestSubscription.status === SubscriptionStatus.DUE
        : false;

      // Check if already in DB
      const existing = await this.prisma.eventCheckIn.findUnique({
        where: {
          eventId_memberCode: {
            eventId,
            memberCode: cleanCode,
          },
        },
      });

      if (existing) {
        duplicateCount++;
        processed.push({
          memberCode: cleanCode,
          name: member.fullName,
          status: 'duplicate',
          noRsvp,
          duesOverdue,
          manual: existing.manual,
          volunteerMemberId: existing.volunteerMemberId,
          scannedAt: existing.scannedAt.toISOString(),
        });
        continue;
      }

      const scannedAtDate = scan.scannedAt ? new Date(scan.scannedAt) : new Date();
      const validDate = isNaN(scannedAtDate.getTime()) ? new Date() : scannedAtDate;

      const created = await this.prisma.eventCheckIn.create({
        data: {
          eventId,
          memberCode: cleanCode,
          memberId: member.id,
          scannedAt: validDate,
          syncedAt: new Date(),
          deviceOffline: true,
          seats,
          manual: isManualEntry,
          volunteerMemberId: volunteerId,
        },
      });

      syncedCount++;
      processed.push({
        memberCode: cleanCode,
        name: member.fullName,
        status: 'synced',
        noRsvp,
        duesOverdue,
        manual: isManualEntry,
        volunteerMemberId: volunteerId,
        scannedAt: created.scannedAt.toISOString(),
      });
    }

    const totalCount = await this.prisma.eventCheckIn.count({
      where: { eventId },
    });

    return {
      success: true,
      syncedCount,
      duplicateCount,
      totalCheckedIn: totalCount,
      processed,
    };
  }

  async getStats(eventId: string) {
    if (!eventId) {
      throw new BadRequestException('Event ID is required');
    }

    const dbCount = await this.prisma.eventCheckIn.count({
      where: { eventId },
    });

    const rsvpCount = await this.prisma.eventRsvp.count({
      where: { eventId },
    });

    const recentCheckIns = await this.prisma.eventCheckIn.findMany({
      where: { eventId },
      orderBy: { scannedAt: 'desc' },
      take: 10,
      include: {
        member: {
          select: {
            fullName: true,
            grade: true,
            discipline: true,
          },
        },
      },
    });

    return {
      eventId,
      checkedInCount: dbCount,
      totalRsvp: rsvpCount > 0 ? rsvpCount : 104,
      recentCheckIns: recentCheckIns.map((item) => ({
        id: item.id,
        memberCode: item.memberCode,
        name: item.member?.fullName || item.memberCode,
        seats: `${item.seats} seat${item.seats > 1 ? 's' : ''}`,
        checkInTime: this.formatTime(item.scannedAt),
        scannedAt: item.scannedAt.toISOString(),
        isOfflineRecorded: item.deviceOffline,
        manual: item.manual,
        volunteerMemberId: item.volunteerMemberId,
      })),
    };
  }

  async getAllCheckIns(eventId: string) {
    if (!eventId) {
      throw new BadRequestException('Event ID is required');
    }

    const list = await this.prisma.eventCheckIn.findMany({
      where: { eventId },
      orderBy: { scannedAt: 'desc' },
      include: {
        member: true,
      },
    });

    return list.map((item) => ({
      id: item.id,
      eventId: item.eventId,
      memberCode: item.memberCode,
      name: item.member?.fullName || item.memberCode,
      grade: item.member?.grade,
      discipline: item.member?.discipline,
      seats: item.seats,
      checkInTime: this.formatTime(item.scannedAt),
      scannedAt: item.scannedAt.toISOString(),
      isOfflineRecorded: item.deviceOffline,
      manual: item.manual,
      volunteerMemberId: item.volunteerMemberId,
    }));
  }

  async getOfflinePack(eventId: string) {
    if (!eventId) {
      throw new BadRequestException('Event ID is required');
    }

    const rsvps = await this.prisma.eventRsvp.findMany({
      where: { eventId },
      include: {
        member: {
          include: {
            subscriptions: {
              orderBy: { period: { endsOn: 'desc' } },
              take: 1,
            },
          },
        },
      },
    });

    const rsvpList = rsvps.map((r) => {
      const code = r.memberCode || r.member?.memberCode || '';
      const name = r.member?.fullName || r.guestName || `Member ${code}`;
      const latestSub = r.member?.subscriptions?.[0];
      const duesOverdue = latestSub ? latestSub.status === SubscriptionStatus.DUE : false;
      return {
        memberCode: code,
        name,
        seats: r.seats || 1,
        duesOverdue,
      };
    });

    return {
      eventId,
      publicKey: this.cardTokenService.getPublicKeyBase64(),
      rsvps: rsvpList,
    };
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  async getPublicEvents(statusFilter?: string, authHeader?: string) {
    let memberId: string | null = null;
    let memberCode: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET || 'fallback-dev-secret-key-change-in-production',
        });
        memberId = payload.sub || null;
        memberCode = payload.memberCode || null;
      } catch {
        // Token invalid or expired
      }
    }

    // Query user's RSVPs from PostgreSQL if authenticated
    let userRsvps: any[] = [];
    if (memberId || memberCode) {
      userRsvps = await this.prisma.eventRsvp.findMany({
        where: {
          OR: [
            ...(memberId ? [{ memberId }] : []),
            ...(memberCode ? [{ memberCode }] : []),
          ],
        },
      });
    }

    const now = Date.now();

    const evaluatedEvents = PUBLIC_PROGRAMME_EVENTS.map((event) => {
      const startMs = new Date(event.startsAt).getTime();
      const endMs = new Date(event.endsAt).getTime();

      let status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' = 'UPCOMING';
      if (now > endMs) {
        status = 'COMPLETED';
      } else if (now >= startMs && now <= endMs) {
        status = 'ONGOING';
      } else {
        status = 'UPCOMING';
      }

      const matchingRsvp = userRsvps.find(
        (r) => r.eventId === event.id || String(r.eventId) === String(event.id),
      );

      return {
        ...event,
        status,
        isRsvpd: Boolean(matchingRsvp),
        userRsvp: matchingRsvp
          ? {
              id: matchingRsvp.id,
              seats: matchingRsvp.seats,
              familyCount: matchingRsvp.familyCount,
              createdAt: matchingRsvp.createdAt,
            }
          : null,
      };
    });

    if (statusFilter === 'upcoming') {
      return evaluatedEvents.filter((e) => e.status !== 'COMPLETED');
    }

    if (statusFilter === 'completed' || statusFilter === 'past') {
      return evaluatedEvents.filter((e) => e.status === 'COMPLETED');
    }

    return evaluatedEvents;
  }

  async getPublicEventById(id: string, authHeader?: string) {
    const list = await this.getPublicEvents(undefined, authHeader);
    const event = list.find((e) => e.id === id || String(e.id) === String(id));
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} was not found.`);
    }
    return event;
  }

  async rsvpToEvent(eventId: string, dto: RsvpDto, authHeader?: string) {
    const event = PUBLIC_PROGRAMME_EVENTS.find(
      (e) => e.id === eventId || String(e.id) === String(eventId),
    );
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} was not found.`);
    }

    const endMs = new Date(event.endsAt).getTime();
    if (Date.now() > endMs) {
      throw new BadRequestException(`Event "${event.title}" has already ended.`);
    }

    if (!event.isAcceptingRsvp) {
      throw new BadRequestException(`Event "${event.title}" is not currently accepting RSVPs.`);
    }

    let member = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET || 'fallback-dev-secret-key-change-in-production',
        });
        if (payload.memberCode) {
          member = await this.prisma.member.findUnique({
            where: { memberCode: payload.memberCode },
          });
        }
      } catch {
        // Token invalid or expired
      }
    }

    // Access control check based on event badge
    if (event.badge !== 'Open') {
      if (!member) {
        throw new ForbiddenException(
          `Event "${event.title}" is restricted to verified IEI members (${event.badge}). Please sign in with your member credentials to RSVP.`,
        );
      }
    }

    // Member RSVP
    if (member) {
      const existingRsvp = await this.prisma.eventRsvp.findFirst({
        where: {
          eventId,
          memberId: member.id,
        },
      });

      if (existingRsvp) {
        return {
          success: true,
          isAlreadyRsvpd: true,
          message: 'You have already confirmed your RSVP for this event.',
          rsvp: existingRsvp,
        };
      }

      const seats = dto.seats || 1;
      const familyCountStr =
        dto.familyCount !== undefined && dto.familyCount !== null
          ? typeof dto.familyCount === 'number'
            ? dto.familyCount > 0
              ? `+${dto.familyCount}`
              : '0'
            : String(dto.familyCount)
          : '+1';

      const rsvp = await this.prisma.eventRsvp.create({
        data: {
          eventId,
          memberId: member.id,
          memberCode: member.memberCode,
          seats,
          familyCount: familyCountStr,
          isGuest: false,
        },
      });

      return {
        success: true,
        message: 'RSVP confirmed successfully',
        rsvp,
      };
    }

    // Guest RSVP (Allowed for Open events)
    const guestMobile = (dto.guestMobile || '').trim().replace(/\D/g, '');
    const guestName = (dto.guestName || 'Guest Attendee').trim();
    const guestEmail = (dto.guestEmail || '').trim().toLowerCase();

    if (guestMobile) {
      const existingGuestRsvp = await this.prisma.eventRsvp.findFirst({
        where: {
          eventId,
          guestMobile,
        },
      });
      if (existingGuestRsvp) {
        return {
          success: true,
          isAlreadyRsvpd: true,
          message: 'An RSVP with this mobile number has already been registered.',
          rsvp: existingGuestRsvp,
        };
      }
    }

    const seats = dto.seats || 1;
    const familyCountStr =
      dto.familyCount !== undefined && dto.familyCount !== null
        ? typeof dto.familyCount === 'number'
          ? dto.familyCount > 0
            ? `+${dto.familyCount}`
            : '0'
          : String(dto.familyCount)
        : '+1';

    const rsvp = await this.prisma.eventRsvp.create({
      data: {
        eventId,
        guestName,
        guestMobile: guestMobile || null,
        guestEmail: guestEmail || null,
        seats,
        familyCount: familyCountStr,
        isGuest: true,
      },
    });

    return {
      success: true,
      message: 'Guest RSVP confirmed successfully',
      rsvp,
    };
  }
}

export const PUBLIC_PROGRAMME_EVENTS = [
  {
    id: '1',
    day: '15',
    month: 'OCT',
    year: '2026',
    category: "ENGINEERS' DAY",
    title: "59th Engineers' Day Celebration",
    location: 'Kuwait Society of Engineers · 18:30',
    venue: 'Kuwait Society of Engineers, Bneid Al Qar',
    time: '18:30',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    startTime: '18:30',
    endTime: '22:00',
    timezone: 'Asia/Kuwait',
    startsAt: '2026-10-15T18:30:00+03:00',
    endsAt: '2026-10-15T22:00:00+03:00',
    badge: 'Open',
    isOpenForGuest: true,
    isAcceptingRsvp: true,
    description:
      'Annual celebration honoring engineering excellence in Kuwait. Features technical address, awards, cultural items and fellowship dinner. Open to all engineers and their families.',
  },
  {
    id: '2',
    day: '20',
    month: 'OCT',
    year: '2026',
    category: 'TECHNICAL SEMINAR',
    title: 'Technical Seminar — AI-Based Facilities Management',
    location: 'Copthorne Hotel · Engr. Ershad Mohammed',
    venue: 'Copthorne Hotel, Kuwait City',
    time: '18:30',
    startDate: '2026-10-20',
    endDate: '2026-10-20',
    startTime: '18:30',
    endTime: '21:30',
    timezone: 'Asia/Kuwait',
    startsAt: '2026-10-20T18:30:00+03:00',
    endsAt: '2026-10-20T21:30:00+03:00',
    badge: 'Members',
    isOpenForGuest: false,
    isAcceptingRsvp: true,
    description:
      'Specialized CPD technical lecture on artificial intelligence in modern commercial facility operations. Restricted to registered IEI members.',
  },
  {
    id: '3',
    day: '06',
    month: 'NOV',
    year: '2026',
    category: 'LADIES WING',
    title: 'Ladies Wing — "Let\'s Act" acting workshop',
    location: 'IGNOU Centre, Salmiya · Engr. Shemej Kumar',
    venue: 'IGNOU Centre, Salmiya',
    time: '17:00',
    startDate: '2026-11-06',
    endDate: '2026-11-06',
    startTime: '17:00',
    endTime: '20:00',
    timezone: 'Asia/Kuwait',
    startsAt: '2026-11-06T17:00:00+03:00',
    endsAt: '2026-11-06T20:00:00+03:00',
    badge: 'Family',
    isOpenForGuest: false,
    isAcceptingRsvp: true,
    description:
      'Interactive drama and public speaking workshop organized by the Ladies Wing. Reserved for members and their registered families.',
  },
  {
    id: '4',
    day: '20',
    month: 'NOV',
    year: '2026',
    category: 'CULTURAL NIGHT',
    title: 'UTSAV 2026 — cultural night',
    location: 'Rajdhani Palace Hotel · families welcome',
    venue: 'Rajdhani Palace Hotel, Khaitan',
    time: '18:00',
    startDate: '2026-11-20',
    endDate: '2026-11-20',
    startTime: '18:00',
    endTime: '22:00',
    timezone: 'Asia/Kuwait',
    startsAt: '2026-11-20T18:00:00+03:00',
    endsAt: '2026-11-20T22:00:00+03:00',
    badge: 'Family',
    isOpenForGuest: false,
    isAcceptingRsvp: true,
    description:
      'Annual cultural festival celebration with musical performances, traditional arts and community dinner. Family event for chapter members.',
  },
  {
    id: '5',
    day: '11',
    month: 'DEC',
    year: '2026',
    category: 'STUDENT EXAMS',
    title: 'AMIE examination registration closes',
    location: 'Chapter office, KSE',
    venue: 'Chapter office, KSE',
    time: '20:00',
    startDate: '2026-12-11',
    endDate: '2026-12-11',
    startTime: '20:00',
    endTime: '23:59',
    timezone: 'Asia/Kuwait',
    startsAt: '2026-12-11T20:00:00+03:00',
    endsAt: '2026-12-11T23:59:00+03:00',
    badge: 'Students',
    isOpenForGuest: false,
    isAcceptingRsvp: false,
    description:
      'Deadline for student members submitting Section A and Section B AMIE winter examination forms.',
  },
  {
    id: '6',
    day: '06',
    month: 'FEB',
    year: '2027',
    category: 'ANNUAL GENERAL MEETING',
    title: 'Annual General Meeting & Technical Seminar',
    location: 'Kuwait Society of Engineers · 18:00',
    venue: 'Kuwait Society of Engineers, Bneid Al Qar',
    time: '18:00',
    startDate: '2027-02-06',
    endDate: '2027-02-06',
    startTime: '18:00',
    endTime: '21:00',
    timezone: 'Asia/Kuwait',
    startsAt: '2027-02-06T18:00:00+03:00',
    endsAt: '2027-02-06T21:00:00+03:00',
    badge: 'Members',
    isOpenForGuest: false,
    isAcceptingRsvp: true,
    description:
      'Presentation of annual accounts, committee reports, and biennial elections. Voting restricted to corporate members in good standing.',
  },
  {
    id: '7',
    day: '13',
    month: 'MAR',
    year: '2027',
    category: 'FAMILY DAY',
    title: 'Family Day',
    location: 'To be announced',
    venue: 'Outdoor venue, Kuwait',
    time: '10:00',
    startDate: '2027-03-13',
    endDate: '2027-03-13',
    startTime: '10:00',
    endTime: '16:00',
    timezone: 'Asia/Kuwait',
    startsAt: '2027-03-13T10:00:00+03:00',
    endsAt: '2027-03-13T16:00:00+03:00',
    badge: 'Family',
    isOpenForGuest: false,
    isAcceptingRsvp: true,
    description:
      'Annual family outdoor recreation picnic with sports, children activities, and barbecue.',
  },
];

