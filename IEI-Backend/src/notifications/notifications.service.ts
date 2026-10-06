import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, DevicePlatform } from '../generated/prisma/client';
import { NotificationQueryDto } from './dto/notification-query.dto';

/**
 * FUTURE MODULE INTEGRATIONS FOR NOTIFICATIONS:
 * ----------------------------------------------------
 * - EVENT_REMINDER: Called by EventsModule / Background Scheduler when an event is 24h away.
 * - RECEIPT_CONFIRMED: Called by ReceiptsModule / EC Tools when Treasurer enters receipt book & number and confirms payment.
 * - DUES_DUE: Called by MembershipModule / Annual Renewal Cron when member renewal window opens.
 * - URGENT_BLOOD: Called by BloodDonorsModule / EC Officer when an emergency hospital blood request is broadcast.
 * - WING_POST: Called by WingsModule (Ladies Wing / Science Club) when convenor publishes an activity.
 * - CHAPTER_NOTICE: Who sends the AGM notice is REQUIREMENT CLARIFICATION NEEDED (e.g., General Secretary or Chapter Office broadcast).
 */

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upsert device push token for the caller.
   * If the token already belongs to another member, move it to the caller (one phone, one signed-in member at a time).
   */
  async saveDeviceToken(memberId: string, token: string, platform: 'IOS' | 'ANDROID') {
    const devPlatform = platform === 'IOS' ? DevicePlatform.IOS : DevicePlatform.ANDROID;

    const saved = await this.prisma.deviceToken.upsert({
      where: { token },
      update: {
        memberId,
        platform: devPlatform,
        lastSeenAt: new Date(),
      },
      create: {
        memberId,
        token,
        platform: devPlatform,
        lastSeenAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Device token saved successfully',
      id: saved.id,
      platform: saved.platform,
    };
  }

  /**
   * Delete device token on sign out.
   */
  async deleteDeviceToken(memberId: string, token?: string) {
    if (token) {
      await this.prisma.deviceToken.deleteMany({
        where: {
          memberId,
          token,
        },
      });
    } else {
      await this.prisma.deviceToken.deleteMany({
        where: { memberId },
      });
    }

    return { success: true, message: 'Device token removed' };
  }

  /**
   * Retrieve member's notifications, newest first, with pagination cursor support.
   */
  async getNotifications(memberId: string, query: NotificationQueryDto) {
    const limit = query.limit || 20;

    const whereClause: any = { memberId };

    if (query.before) {
      // If cursor is a valid ISO date
      const cursorDate = new Date(query.before);
      if (!isNaN(cursorDate.getTime())) {
        whereClause.createdAt = { lt: cursorDate };
      } else {
        // If cursor is a notification UUID
        const cursorItem = await this.prisma.notification.findUnique({
          where: { id: query.before },
        });
        if (cursorItem) {
          whereClause.createdAt = { lt: cursorItem.createdAt };
        }
      }
    }

    const items = await this.prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      notifications: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        createdAt: n.createdAt.toISOString(),
        isRead: Boolean(n.readAt),
      })),
    };
  }

  /**
   * Get unread notification count for caller.
   */
  async getUnreadCount(memberId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: {
        memberId,
        readAt: null,
      },
    });
    return { count };
  }

  /**
   * Mark all unread notifications as read for caller.
   */
  async markAllAsRead(memberId: string): Promise<{ count: number }> {
    await this.prisma.notification.updateMany({
      where: {
        memberId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
    return { count: 0 };
  }

  /**
   * Mark a single notification as read (only if it belongs to caller, else 404).
   */
  async markSingleAsRead(memberId: string, notificationId: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif || notif.memberId !== memberId) {
      throw new NotFoundException('Notification not found');
    }

    if (!notif.readAt) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
      });
    }

    return {
      success: true,
      id: notificationId,
      isRead: true,
    };
  }

  /**
   * Create a notification row and send push notification to all device tokens of that member.
   */
  async create(
    memberId: string,
    type: NotificationType,
    title: string,
    body: string,
    customCreatedAt?: Date,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        memberId,
        type,
        title,
        body,
        createdAt: customCreatedAt || new Date(),
      },
    });

    // Send push notification in background without blocking
    this.sendPushToMember(memberId, notification.id, type, title, body).catch((err) => {
      this.logger.error(`Push dispatch failed for member ${memberId}: ${err?.message || err}`);
    });

    return notification;
  }

  /**
   * Dispatch push notifications via Expo Push API.
   * Chunks requests up to 100 messages. Handles DeviceNotRegistered token pruning.
   */
  private async sendPushToMember(
    memberId: string,
    notificationId: string,
    type: NotificationType,
    title: string,
    body: string,
  ) {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { memberId },
    });

    if (!tokens || tokens.length === 0) {
      return;
    }

    const { count: unreadCount } = await this.getUnreadCount(memberId);

    const messages = tokens.map((t) => ({
      to: t.token,
      sound: 'default',
      title,
      body,
      data: { notificationId, type },
      badge: unreadCount,
      channelId: 'default',
      priority: type === 'URGENT_BLOOD' ? 'high' : 'default',
    }));

    // Send in chunks of 100 messages
    for (let i = 0; i < messages.length; i += 100) {
      const chunk = messages.slice(i, i + 100);
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };

        if (process.env.EXPO_ACCESS_TOKEN) {
          headers['Authorization'] = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
        }

        const res = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers,
          body: JSON.stringify(chunk),
        });

        if (res.ok) {
          const result = await res.json();
          const tickets = result.data || [];

          for (let j = 0; j < tickets.length; j++) {
            const ticket = tickets[j];
            if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
              const invalidToken = chunk[j].to;
              this.logger.warn(`Removing unregistered Expo push token: ${invalidToken}`);
              await this.prisma.deviceToken.deleteMany({
                where: { token: invalidToken },
              });
            }
          }
        } else {
          this.logger.warn(`Expo push API returned status ${res.status}`);
        }
      } catch (err: any) {
        // Never fail the request, log without secrets
        this.logger.warn(`Failed sending Expo push batch: ${err?.message || 'Network error'}`);
      }
    }
  }

  /**
   * DEV ONLY: Seed the six sample PDF notices for caller or given memberCode.
   * Deduplicates by (type + title) so calling multiple times does not produce duplicates.
   */
  async seedSample(memberIdOrCode: string, isMemberCode: boolean = false) {
    let member = null;

    if (isMemberCode) {
      member = await this.prisma.member.findUnique({
        where: { memberCode: memberIdOrCode.toUpperCase() },
      });
    } else {
      member = await this.prisma.member.findUnique({
        where: { id: memberIdOrCode },
      });
    }

    if (!member) {
      throw new NotFoundException(`Member not found for: ${memberIdOrCode}`);
    }

    const now = Date.now();

    // The exact 6 PDF sample notices
    const samples = [
      {
        type: NotificationType.EVENT_REMINDER,
        title: "59th Engineers' Day is tomorrow",
        body: '18:30 at Kuwait Society of Engineers. Bring your card.',
        createdAt: new Date(now - 1 * 3600 * 1000), // 1 hour ago
      },
      {
        type: NotificationType.RECEIPT_CONFIRMED,
        title: 'Receipt confirmed',
        body: 'Treasurer entered receipt no. 480, Book 4. KD 20 received.',
        createdAt: new Date(now - 2 * 24 * 3600 * 1000), // 2 days ago
      },
      {
        type: NotificationType.DUES_DUE,
        title: 'Subscription 2026-27 is due',
        body: 'KD 20 · renew before the AGM to keep voting rights.',
        createdAt: new Date(now - 3 * 24 * 3600 * 1000), // 3 days ago
      },
      {
        type: NotificationType.URGENT_BLOOD,
        title: 'Urgent: O+ blood needed',
        body: 'Al Amiri Hospital',
        createdAt: new Date(now - 7 * 24 * 3600 * 1000), // 1 week ago
      },
      {
        type: NotificationType.WING_POST,
        title: 'Ladies Wing posted an activity',
        body: "'Let's Act' acting workshop, 6 Nov at IGNOU Salmiya.",
        createdAt: new Date(now - 7 * 24 * 3600 * 1000), // 1 week ago
      },
      {
        type: NotificationType.CHAPTER_NOTICE,
        title: 'AGM notice',
        body: 'Annual General Meeting, 6 Feb 2027. Agenda attached.',
        createdAt: new Date(now - 14 * 24 * 3600 * 1000), // 2 weeks ago
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const s of samples) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          memberId: member.id,
          type: s.type,
          title: s.title,
        },
      });

      if (existing) {
        skippedCount++;
      } else {
        await this.create(member.id, s.type, s.title, s.body, s.createdAt);
        createdCount++;
      }
    }

    const { count: totalUnread } = await this.getUnreadCount(member.id);

    return {
      success: true,
      message: 'Sample notifications seeded',
      memberCode: member.memberCode,
      createdCount,
      skippedCount,
      totalUnread,
    };
  }
}
