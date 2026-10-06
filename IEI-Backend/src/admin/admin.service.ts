import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FILE_STORAGE_SERVICE,
  FileStorageService,
} from '../storage/file-storage.interface';
import {
  OfficePosition,
  ApplicationStatus,
  SubscriptionStatus,
} from '../generated/prisma/client';
import { PUBLIC_PROGRAMME_EVENTS } from '../events/events.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(FILE_STORAGE_SERVICE)
    private readonly fileStorage: any,
  ) {}

  /**
   * Real dashboard stats and KPIs
   */
  async getDashboardStats() {
    const [
      totalMembers,
      pendingApps,
      underReviewApps,
      approvedApps,
      rejectedApps,
      pendingReceipts,
      confirmedReceipts,
      totalRsvps,
      unpaidDues,
      recentApps,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.membershipApplication.count({
        where: { status: ApplicationStatus.AWAITING_REVIEW },
      }),
      this.prisma.membershipApplication.count({
        where: { status: ApplicationStatus.UNDER_SCRUTINY },
      }),
      this.prisma.membershipApplication.count({
        where: { status: ApplicationStatus.APPROVED },
      }),
      this.prisma.membershipApplication.count({
        where: { status: ApplicationStatus.REJECTED },
      }),
      this.prisma.paymentDeclaration.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.paymentDeclaration.count({
        where: { status: 'CONFIRMED' },
      }),
      this.prisma.eventRsvp.count(),
      this.prisma.memberSubscription.count({
        where: { status: SubscriptionStatus.DUE },
      }),
      this.prisma.membershipApplication.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          actorMember: {
            select: {
              fullName: true,
              memberCode: true,
            },
          },
        },
      }),
    ]);

    // Compute upcoming events and RSVPs
    const now = new Date();
    const upcomingEvents = PUBLIC_PROGRAMME_EVENTS.map((e) => {
      const startsAt = new Date(e.startsAt);
      const isPast = startsAt.getTime() < now.getTime();
      return {
        id: e.id,
        title: e.title,
        date: `${e.day} ${e.month} ${e.year}`,
        time: e.time,
        location: e.location,
        badge: e.badge,
        category: e.category,
        status: isPast ? 'COMPLETED' : 'UPCOMING',
      };
    });

    // Top members to call first (renewal risk)
    const renewalRisk = await this.prisma.memberSubscription.findMany({
      where: { status: SubscriptionStatus.DUE },
      take: 5,
      include: {
        member: {
          select: {
            id: true,
            memberCode: true,
            fullName: true,
            mobile: true,
            grade: true,
            memberSinceYear: true,
          },
        },
        period: true,
      },
      orderBy: { member: { memberSinceYear: 'asc' } },
    });

    return {
      kpis: {
        totalMembers,
        pendingApplications: pendingApps + underReviewApps,
        receiptsAwaitingConfirmation: pendingReceipts,
        upcomingEvents: upcomingEvents.filter((e) => e.status === 'UPCOMING').length,
        totalRsvps,
        duesUnpaid: unpaidDues,
      },
      applicationCounts: {
        pending: pendingApps,
        underReview: underReviewApps,
        approved: approvedApps,
        rejected: rejectedApps,
        total: pendingApps + underReviewApps + approvedApps + rejectedApps,
      },
      upcomingEvents,
      recentApplications: recentApps.map((a) => ({
        id: a.id,
        applicationNumber: a.applicationNumber,
        applicant: a.fullName,
        discipline: a.discipline,
        date: a.createdAt,
        status: a.status,
      })),
      renewalRisk: renewalRisk.map((r) => ({
        id: r.id,
        memberCode: r.member.memberCode,
        fullName: r.member.fullName,
        mobile: r.member.mobile,
        grade: r.member.grade,
        memberSinceYear: r.member.memberSinceYear,
        periodLabel: r.period.label,
        riskLevel: (r.member.memberSinceYear && r.member.memberSinceYear < 2015) ? 'High value' : 'Medium',
      })),
      recentActivity: recentAuditLogs.map((log) => ({
        id: log.id,
        actor: log.actorMember?.fullName || 'System',
        actorCode: log.actorMember?.memberCode || 'SYS',
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        details: log.details,
        time: log.createdAt,
      })),
    };
  }

  /**
   * Real member list with filters
   */
  async getMembers(params: {
    search?: string;
    grade?: string;
    discipline?: string;
    status?: string;
    area?: string;
  }) {
    const where: any = {};

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { memberCode: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q } },
        { ieiIndiaNo: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (params.grade) {
      where.grade = params.grade;
    }

    if (params.discipline) {
      where.discipline = { contains: params.discipline, mode: 'insensitive' };
    }

    if (params.area) {
      where.areaLocality = { contains: params.area, mode: 'insensitive' };
    }

    const members = await this.prisma.member.findMany({
      where,
      orderBy: { memberCode: 'asc' },
      include: {
        officeBearerAssignments: { where: { active: true } },
        subscriptions: {
          orderBy: { period: { endsOn: 'desc' } },
          take: 1,
          include: { period: true },
        },
        authIdentities: {
          select: { provider: true, email: true },
        },
      },
    });

    return members.map((m) => {
      const latestSub = m.subscriptions[0];
      const positions = m.officeBearerAssignments.map((a) => a.position);
      const isDue = latestSub?.status === SubscriptionStatus.DUE;

      return {
        id: m.id,
        memberCode: m.memberCode,
        fullName: m.fullName,
        grade: m.grade,
        discipline: m.discipline,
        mobile: m.mobile,
        email: m.authIdentities[0]?.email || null,
        bloodGroup: m.bloodGroup,
        ieiIndiaNo: m.ieiIndiaNo,
        memberSinceYear: m.memberSinceYear,
        hasPhoto: Boolean(m.photoKey),
        company: m.company,
        designation: m.designation,
        governorate: m.governorate,
        areaLocality: m.areaLocality,
        status: isDue ? 'Dues Pending' : 'Good Standing',
        subscriptionStatus: latestSub?.status || 'UNKNOWN',
        latestPeriod: latestSub?.period?.label || 'N/A',
        positions,
        joinedAt: m.createdAt,
      };
    });
  }

  /**
   * Real member detail with all associated records
   */
  async getMemberById(idOrCode: string) {
    const member = await this.prisma.member.findFirst({
      where: {
        OR: [
          { id: idOrCode },
          { memberCode: idOrCode.toUpperCase() },
        ],
      },
      include: {
        officeBearerAssignments: true,
        subscriptions: {
          orderBy: { period: { endsOn: 'desc' } },
          include: {
            period: true,
            declarations: true,
          },
        },
        eventRsvps: {
          orderBy: { createdAt: 'desc' },
        },
        eventCheckIns: {
          orderBy: { scannedAt: 'desc' },
        },
        authIdentities: true,
        auditLogs: {
          take: 15,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member record not found for: ${idOrCode}`);
    }

    return member;
  }

  /**
   * Export members CSV with audit log
   */
  async exportMembersCsv(actorUserId: string) {
    const members = await this.prisma.member.findMany({
      orderBy: { memberCode: 'asc' },
      include: {
        officeBearerAssignments: { where: { active: true } },
      },
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        actorMemberId: actorUserId,
        action: 'EXPORT_MEMBERS_CSV',
        entity: 'Member',
        entityId: 'ALL',
        details: { count: members.length },
      },
    });

    const headers = [
      'Member ID',
      'Name',
      'Grade',
      'Discipline',
      'Mobile',
      'Blood Group',
      'IEI India No',
      'Company',
      'Designation',
      'Area',
      'Member Since',
      'Positions',
    ];

    const rows = members.map((m) => [
      `"${m.memberCode}"`,
      `"${m.fullName.replace(/"/g, '""')}"`,
      `"${m.grade}"`,
      `"${m.discipline}"`,
      `"${m.mobile}"`,
      `"${m.bloodGroup || ''}"`,
      `"${m.ieiIndiaNo || ''}"`,
      `"${(m.company || '').replace(/"/g, '""')}"`,
      `"${(m.designation || '').replace(/"/g, '""')}"`,
      `"${(m.areaLocality || '').replace(/"/g, '""')}"`,
      `"${m.memberSinceYear || ''}"`,
      `"${m.officeBearerAssignments.map((a) => a.position).join(', ')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Real applications list with status filter
   */
  async getApplications(params: { status?: string; search?: string }) {
    const where: any = {};

    if (params.status && params.status !== 'ALL') {
      where.status = params.status as ApplicationStatus;
    }

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { applicationNumber: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q } },
        { employer: { contains: q, mode: 'insensitive' } },
      ];
    }

    const applications = await this.prisma.membershipApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        documents: {
          select: {
            id: true,
            documentType: true,
            originalFileName: true,
            fileSize: true,
            uploadedAt: true,
          },
        },
      },
    });

    return applications.map((a) => {
      let reviewer = 'General Secretary';
      if (a.status === ApplicationStatus.UNDER_SCRUTINY) {
        reviewer = 'Chapter Chairman';
      } else if (a.status === ApplicationStatus.APPROVED) {
        reviewer = 'IEI Headquarters Kolkata';
      } else if (a.status === ApplicationStatus.REJECTED) {
        reviewer = 'Completed / Refused';
      }

      return {
        id: a.id,
        applicationNumber: a.applicationNumber,
        fullName: a.fullName,
        mobile: a.mobile,
        email: a.email,
        discipline: a.discipline,
        employer: a.employer,
        designation: a.designation,
        qualification: a.qualification,
        status: a.status,
        submittedAt: a.createdAt,
        reviewer,
        documentsCount: a.documents.length,
        documents: a.documents,
      };
    });
  }

  /**
   * Real application detail
   */
  async getApplicationById(id: string) {
    const app = await this.prisma.membershipApplication.findFirst({
      where: {
        OR: [{ id }, { applicationNumber: id }],
      },
      include: {
        documents: true,
      },
    });

    if (!app) {
      throw new NotFoundException(`Application not found for ID: ${id}`);
    }

    // Get audit logs for this application
    const logs = await this.prisma.auditLog.findMany({
      where: {
        entity: 'MembershipApplication',
        entityId: app.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        actorMember: {
          select: { fullName: true, memberCode: true },
        },
      },
    });

    return {
      ...app,
      auditTimeline: logs.map((l) => ({
        id: l.id,
        action: l.action,
        actor: l.actorMember?.fullName || 'System Officer',
        time: l.createdAt,
        details: l.details,
      })),
    };
  }

  /**
   * Recommend application to Chairman (General Secretary)
   */
  async recommendApplication(actorUserId: string, id: string, notes?: string) {
    const app = await this.prisma.membershipApplication.findFirst({
      where: { OR: [{ id }, { applicationNumber: id }] },
    });

    if (!app) {
      throw new NotFoundException(`Application not found: ${id}`);
    }

    if (app.status !== ApplicationStatus.AWAITING_REVIEW) {
      throw new BadRequestException(
        `Application is in ${app.status} status; only AWAITING_REVIEW can be recommended to Chairman`,
      );
    }

    const updated = await this.prisma.membershipApplication.update({
      where: { id: app.id },
      data: { status: ApplicationStatus.UNDER_SCRUTINY },
    });

    await this.prisma.auditLog.create({
      data: {
        actorMemberId: actorUserId,
        action: 'RECOMMEND_APPLICATION_TO_CHAIRMAN',
        entity: 'MembershipApplication',
        entityId: app.id,
        details: { applicationNumber: app.applicationNumber, notes: notes || '' },
      },
    });

    return {
      success: true,
      message: `Application ${app.applicationNumber} recommended to Chairman for final endorsement.`,
      status: updated.status,
    };
  }

  /**
   * Approve application (Chairman)
   */
  async approveApplication(actorUserId: string, id: string, notes?: string) {
    const app = await this.prisma.membershipApplication.findFirst({
      where: { OR: [{ id }, { applicationNumber: id }] },
    });

    if (!app) {
      throw new NotFoundException(`Application not found: ${id}`);
    }

    if (app.status !== ApplicationStatus.UNDER_SCRUTINY && app.status !== ApplicationStatus.AWAITING_REVIEW) {
      throw new BadRequestException(
        `Application is in ${app.status} status and cannot be approved directly`,
      );
    }

    const updated = await this.prisma.membershipApplication.update({
      where: { id: app.id },
      data: { status: ApplicationStatus.APPROVED },
    });

    await this.prisma.auditLog.create({
      data: {
        actorMemberId: actorUserId,
        action: 'APPROVE_APPLICATION',
        entity: 'MembershipApplication',
        entityId: app.id,
        details: { applicationNumber: app.applicationNumber, notes: notes || '' },
      },
    });

    return {
      success: true,
      message: `Application ${app.applicationNumber} approved and forwarded to IEI Headquarters Kolkata for charter ratification.`,
      status: updated.status,
    };
  }

  /**
   * Reject application (with required reason)
   */
  async rejectApplication(actorUserId: string, id: string, reason: string) {
    if (!reason || !reason.trim()) {
      throw new BadRequestException('A rejection reason is strictly required');
    }

    const app = await this.prisma.membershipApplication.findFirst({
      where: { OR: [{ id }, { applicationNumber: id }] },
    });

    if (!app) {
      throw new NotFoundException(`Application not found: ${id}`);
    }

    const updated = await this.prisma.membershipApplication.update({
      where: { id: app.id },
      data: { status: ApplicationStatus.REJECTED },
    });

    await this.prisma.auditLog.create({
      data: {
        actorMemberId: actorUserId,
        action: 'REJECT_APPLICATION',
        entity: 'MembershipApplication',
        entityId: app.id,
        details: { applicationNumber: app.applicationNumber, reason: reason.trim() },
      },
    });

    return {
      success: true,
      message: `Application ${app.applicationNumber} returned/rejected. Reason recorded in chapter audit ledger.`,
      status: updated.status,
    };
  }

  /**
   * Secure document file stream with audit log
   */
  async getApplicationDocumentFile(actorUserId: string, applicationId: string, documentId: string) {
    const doc = await this.prisma.membershipDocument.findFirst({
      where: {
        id: documentId,
        applicationId,
      },
      include: { application: true },
    });

    if (!doc) {
      throw new NotFoundException('Document file record not found');
    }

    const result = await this.fileStorage.getMembershipDocumentBuffer(doc.storageKey);
    if (!result || !result.buffer) {
      throw new NotFoundException('Document file content not found in secure storage');
    }

    // Write audit log for every view and download
    await this.prisma.auditLog.create({
      data: {
        actorMemberId: actorUserId,
        action: 'DOWNLOAD_DOCUMENT',
        entity: 'MembershipDocument',
        entityId: doc.id,
        details: {
          applicationNumber: doc.application.applicationNumber,
          documentType: doc.documentType,
          originalFileName: doc.originalFileName,
        },
      },
    });

    return {
      buffer: result.buffer,
      mimeType: doc.mimeType || result.mimeType || 'application/octet-stream',
      fileName: doc.originalFileName,
    };
  }

  /**
   * Real audit logs list
   */
  async getAuditLogs(params?: { action?: string; limit?: number }) {
    const where: any = {};
    if (params?.action) {
      where.action = params.action;
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      take: params?.limit || 50,
      orderBy: { createdAt: 'desc' },
      include: {
        actorMember: {
          select: { fullName: true, memberCode: true, grade: true },
        },
      },
    });

    return logs.map((l) => ({
      id: l.id,
      actor: l.actorMember?.fullName || 'System Process',
      actorCode: l.actorMember?.memberCode || 'SYS',
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      details: l.details,
      createdAt: l.createdAt,
    }));
  }

  /**
   * List admin users and active office bearers
   */
  async getAdminUsers() {
    const assignments = await this.prisma.officeBearerAssignment.findMany({
      where: { active: true },
      include: {
        member: {
          select: {
            id: true,
            memberCode: true,
            fullName: true,
            email: false,
            grade: true,
            mobile: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });

    return assignments.map((a) => ({
      id: a.id,
      memberId: a.memberId,
      memberCode: a.member.memberCode,
      fullName: a.member.fullName,
      position: a.position,
      term: a.term,
      active: a.active,
      mobile: a.member.mobile,
      grade: a.member.grade,
    }));
  }

  /**
   * Assign or update admin role with audit log
   */
  async assignAdminRole(
    actorUserId: string,
    memberCode: string,
    position: OfficePosition,
    term: string = '2026-27',
  ) {
    const member = await this.prisma.member.findUnique({
      where: { memberCode: memberCode.toUpperCase() },
    });

    if (!member) {
      throw new NotFoundException(`Member with code ${memberCode} does not exist`);
    }

    const assignment = await this.prisma.officeBearerAssignment.upsert({
      where: {
        memberId_position_term: {
          memberId: member.id,
          position,
          term,
        },
      },
      update: { active: true },
      create: {
        memberId: member.id,
        position,
        term,
        active: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorMemberId: actorUserId,
        action: 'ASSIGN_OFFICE_BEARER',
        entity: 'OfficeBearerAssignment',
        entityId: assignment.id,
        details: { memberCode: member.memberCode, position, term },
      },
    });

    return {
      success: true,
      message: `Assigned ${position} to ${member.fullName} (${member.memberCode}) for term ${term}`,
      assignment,
    };
  }

  /**
   * System settings metadata
   */
  async getSystemSettings() {
    const periods = await this.prisma.subscriptionPeriod.findMany({
      orderBy: { endsOn: 'desc' },
    });

    const isDev = process.env.NODE_ENV !== 'production';
    const isDevLoginEnabled = process.env.ENABLE_DEV_LOGIN === 'true';

    return {
      chapterName: 'The Institution of Engineers (India) — Kuwait Chapter',
      foundedYear: 1995,
      activeTerm: '2026-27',
      annualDuesKd: 20,
      annualDuesFils: 20000,
      currency: 'KWD',
      bankDetails: {
        beneficiary: 'The Institution of Engineers India - Kuwait Chapter',
        bankName: 'Gulf Bank Kuwait',
        iban: 'KW12GBKU0000000000000000000000',
        cashOffice: 'Secretariat, Kuwait Society of Engineers, Bneid Al Qar',
      },
      subscriptionPeriods: periods,
      demoMode: {
        enabled: isDevLoginEnabled,
        isProduction: !isDev,
        demoAccountsNotice: isDevLoginEnabled
          ? 'DEV Demo Accounts Enabled (IEI9001, IEI9002, IEI9003, IEI9004)'
          : 'Disabled in Production Environment',
      },
      featureFlags: {
        whatsappIntegration: true,
        twoFactorAuthFeasible: false,
        qrScanningDoorSync: true,
      },
    };
  }

  /**
   * Real Blood Donors register data
   */
  async getBloodDonors(bloodGroup?: string) {
    const where: any = {
      bloodGroup: bloodGroup ? bloodGroup : { not: null },
    };

    const donors = await this.prisma.member.findMany({
      where,
      select: {
        id: true,
        memberCode: true,
        fullName: true,
        bloodGroup: true,
        discipline: true,
        areaLocality: true,
        governorate: true,
        mobile: true,
        grade: true,
      },
      orderBy: { memberCode: 'asc' },
    });

    return donors.map((d) => ({
      id: d.id,
      memberCode: d.memberCode,
      fullName: d.fullName,
      bloodGroup: d.bloodGroup,
      discipline: d.discipline,
      area: d.areaLocality || d.governorate || 'Kuwait',
      mobile: d.mobile,
      consentStatus: 'CONSENT_GRANTED',
    }));
  }

  /**
   * Real Aggregated Reports
   */
  async getReportsSummary() {
    const [
      totalMembers,
      membersByGrade,
      membersByDiscipline,
      subscriptionsByStatus,
      checkInsCount,
      rsvpsCount,
    ] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.groupBy({
        by: ['grade'],
        _count: { _all: true },
      }),
      this.prisma.member.groupBy({
        by: ['discipline'],
        _count: { _all: true },
      }),
      this.prisma.memberSubscription.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.eventCheckIn.count(),
      this.prisma.eventRsvp.count(),
    ]);

    return {
      totalMembers,
      membersByGrade: membersByGrade.map((g) => ({ grade: g.grade, count: g._count._all })),
      membersByDiscipline: membersByDiscipline.map((d) => ({
        discipline: d.discipline,
        count: d._count._all,
      })),
      subscriptions: subscriptionsByStatus.map((s) => ({
        status: s.status,
        count: s._count._all,
      })),
      events: {
        totalCheckIns: checkInsCount,
        totalRsvps: rsvpsCount,
      },
    };
  }
}
