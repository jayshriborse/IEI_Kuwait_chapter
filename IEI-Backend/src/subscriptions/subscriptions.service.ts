import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  SubscriptionStatus,
  PaymentMethod,
  DeclarationStatus,
  OfficePosition,
  NotificationType,
} from '../generated/prisma/client';
import {
  FILE_STORAGE_SERVICE,
  FileStorageService,
} from '../storage/file-storage.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { detectReceiptExtensionFromMagicBytes } from './utils/magic-bytes.util';
import { ConfirmReceiptDto } from './dto/confirm-receipt.dto';
import { getChapterPaymentInstructions } from '../config/chapter-payment.config';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(FILE_STORAGE_SERVICE)
    private readonly fileStorage: any,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

  /**
   * Helper to find the current active subscription period containing today.
   */
  async getCurrentPeriod() {
    const today = new Date();
    const period = await this.prisma.subscriptionPeriod.findFirst({
      where: {
        startsOn: { lte: today },
        endsOn: { gte: today },
      },
    });

    if (!period) {
      throw new NotFoundException(
        'No active subscription period found for current date',
      );
    }

    return period;
  }

  /**
   * GET /me/subscription
   */
  async getCurrentSubscription(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: userId },
    });
    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    const currentPeriod = await this.getCurrentPeriod();

    // Find or create member subscription for current period
    let subscription = await this.prisma.memberSubscription.findUnique({
      where: {
        memberId_periodId: {
          memberId: member.id,
          periodId: currentPeriod.id,
        },
      },
    });

    if (!subscription) {
      subscription = await this.prisma.memberSubscription.create({
        data: {
          memberId: member.id,
          periodId: currentPeriod.id,
          status: SubscriptionStatus.DUE,
        },
      });
    }

    // Latest declaration for current period
    const latestDeclaration = await this.prisma.paymentDeclaration.findFirst({
      where: { memberSubscriptionId: subscription.id },
      orderBy: { submittedAt: 'desc' },
    });

    // EndsOn of member's latest PAID period, or null
    const latestPaid = await this.prisma.memberSubscription.findFirst({
      where: {
        memberId: member.id,
        status: SubscriptionStatus.PAID,
      },
      include: { period: true },
      orderBy: {
        period: {
          endsOn: 'desc',
        },
      },
    });

    const paidUpTo = latestPaid
      ? latestPaid.period.endsOn.toISOString().split('T')[0]
      : null;

    // Active Treasurer's fullName or null
    const treasurerAssignment =
      await this.prisma.officeBearerAssignment.findFirst({
        where: {
          position: OfficePosition.TREASURER,
          active: true,
        },
        include: { member: true },
      });
    const treasurerName = treasurerAssignment?.member?.fullName || null;

    const amountKd = (currentPeriod.amountFils / 1000).toString();
    const showDuesBand =
      subscription.status === SubscriptionStatus.DUE ||
      subscription.status === SubscriptionStatus.AWAITING_CONFIRMATION;

    return {
      status: subscription.status,
      period: {
        label: currentPeriod.label,
        startsOn: currentPeriod.startsOn.toISOString().split('T')[0],
        endsOn: currentPeriod.endsOn.toISOString().split('T')[0],
      },
      amountKd,
      currency: currentPeriod.currency,
      paidUpTo,
      showDuesBand,
      treasurerName,
      paymentInstructions: getChapterPaymentInstructions(),
      declaration: latestDeclaration
        ? {
            id: latestDeclaration.id,
            method: latestDeclaration.method,
            submittedAt: latestDeclaration.submittedAt.toISOString(),
            status: latestDeclaration.status,
          }
        : null,
    };
  }

  /**
   * POST /me/subscription/declarations
   */
  async createDeclaration(
    userId: string,
    method: PaymentMethod,
    file?: { buffer: Buffer; [key: string]: any },
  ) {
    // Throttle 5 per hour per member
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSubmissionsCount =
      await this.prisma.paymentDeclaration.count({
        where: {
          memberSubscription: { memberId: userId },
          submittedAt: { gte: oneHourAgo },
        },
      });

    if (recentSubmissionsCount >= 5) {
      throw new HttpException(
        'Rate limit exceeded: maximum 5 declaration submissions per hour.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const currentPeriod = await this.getCurrentPeriod();

    let subscription = await this.prisma.memberSubscription.findUnique({
      where: {
        memberId_periodId: {
          memberId: userId,
          periodId: currentPeriod.id,
        },
      },
    });

    if (!subscription) {
      subscription = await this.prisma.memberSubscription.create({
        data: {
          memberId: userId,
          periodId: currentPeriod.id,
          status: SubscriptionStatus.DUE,
        },
      });
    }

    // Allowed ONLY when current status is DUE
    if (subscription.status !== SubscriptionStatus.DUE) {
      throw new ConflictException(
        `Declaration cannot be submitted: current subscription status is ${subscription.status}`,
      );
    }

    // BANK_TRANSFER requires a receipt. CASH: receipt is optional.
    // REQUIREMENT CLARIFICATION NEEDED: The client PDF does not describe how CASH is verified.
    if (method === PaymentMethod.BANK_TRANSFER && (!file || !file.buffer)) {
      throw new BadRequestException(
        'Receipt file is required for bank transfer payments',
      );
    }

    const declarationId = randomUUID();
    let receiptKey: string | null = null;

    if (file && file.buffer) {
      if (file.buffer.length > 5 * 1024 * 1024) {
        throw new BadRequestException(
          'Receipt file size exceeds maximum limit of 5 MB',
        );
      }

      const detected = detectReceiptExtensionFromMagicBytes(file.buffer);
      if (!detected) {
        throw new BadRequestException(
          'Invalid receipt file format signature. Only JPEG, PNG, WEBP, or PDF files are allowed.',
        );
      }

      // Store privately through existing storage interface
      receiptKey = await this.fileStorage.saveReceipt({
        declarationId,
        buffer: file.buffer,
        extension: detected.ext,
        mimeType: detected.mimeType,
      });
    }

    // In ONE transaction: create PENDING declaration, set AWAITING_CONFIRMATION, audit log
    await this.prisma.$transaction(async (tx) => {
      await tx.paymentDeclaration.create({
        data: {
          id: declarationId,
          memberSubscriptionId: subscription.id,
          method,
          receiptKey,
          status: DeclarationStatus.PENDING,
          submittedAt: new Date(),
        },
      });

      await tx.memberSubscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.AWAITING_CONFIRMATION,
        },
      });

      await tx.auditLog.create({
        data: {
          actorMemberId: userId,
          action: 'PAYMENT_DECLARATION_SUBMITTED',
          entity: 'PaymentDeclaration',
          entityId: declarationId,
          details: {
            method,
            hasReceipt: Boolean(receiptKey),
          },
        },
      });
    });

    return this.getCurrentSubscription(userId);
  }

  /**
   * GET /me/receipts
   */
  async getMyReceipts(userId: string) {
    const declarations = await this.prisma.paymentDeclaration.findMany({
      where: {
        memberSubscription: {
          memberId: userId,
        },
      },
      include: {
        memberSubscription: {
          include: { period: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const pendingCount = declarations.filter(
      (d) => d.status === DeclarationStatus.PENDING,
    ).length;

    return {
      pendingCount,
      items: declarations.map((d) => ({
        id: d.id,
        method: d.method,
        submittedAt: d.submittedAt.toISOString(),
        status: d.status,
        receiptNo: d.receiptNo,
        bookNo: d.bookNo,
        periodLabel: d.memberSubscription.period.label,
      })),
    };
  }

  /**
   * GET /me/receipts/:id/file
   */
  async getMyReceiptFile(userId: string, declarationId: string) {
    const dec = await this.prisma.paymentDeclaration.findUnique({
      where: { id: declarationId },
      include: {
        memberSubscription: true,
      },
    });

    if (!dec || dec.memberSubscription.memberId !== userId) {
      throw new NotFoundException('Receipt not found');
    }

    if (!dec.receiptKey) {
      throw new NotFoundException('No receipt file attached to this declaration');
    }

    const file = await this.fileStorage.getReceiptBuffer(dec.receiptKey);
    if (!file) {
      throw new NotFoundException('Receipt file not found in storage');
    }

    return file;
  }

  /**
   * GET /ec/receipts?status=PENDING
   */
  async getEcReceipts(status: DeclarationStatus = DeclarationStatus.PENDING) {
    const currentPeriod = await this.getCurrentPeriod();

    const unpaid = await this.prisma.memberSubscription.count({
      where: {
        periodId: currentPeriod.id,
        status: SubscriptionStatus.DUE,
      },
    });

    const receiptsToConfirm = await this.prisma.paymentDeclaration.count({
      where: { status: DeclarationStatus.PENDING },
    });

    const items = await this.prisma.paymentDeclaration.findMany({
      where: { status },
      include: {
        memberSubscription: {
          include: {
            member: true,
            period: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return {
      counts: {
        unpaid,
        receiptsToConfirm,
      },
      items: items.map((dec) => ({
        id: dec.id,
        memberCode: dec.memberSubscription.member.memberCode,
        memberName: dec.memberSubscription.member.fullName,
        method: dec.method,
        amountKd: (dec.memberSubscription.period.amountFils / 1000).toString(),
        submittedAt: dec.submittedAt.toISOString(),
        hasFile: Boolean(dec.receiptKey),
      })),
    };
  }

  /**
   * GET /ec/receipts/:id/file
   */
  async getEcReceiptFile(declarationId: string) {
    const dec = await this.prisma.paymentDeclaration.findUnique({
      where: { id: declarationId },
    });

    if (!dec || !dec.receiptKey) {
      throw new NotFoundException('Receipt file not found');
    }

    const file = await this.fileStorage.getReceiptBuffer(dec.receiptKey);
    if (!file) {
      throw new NotFoundException('Receipt file not found in storage');
    }

    return file;
  }

  /**
   * POST /ec/receipts/:id/confirm
   */
  async confirmReceipt(
    treasurerUserId: string,
    declarationId: string,
    dto: ConfirmReceiptDto,
  ) {
    const now = new Date();
    let memberIdToNotify: string | null = null;
    let amountKdToNotify = '20';

    // In ONE transaction with row lock
    await this.prisma.$transaction(async (tx) => {
      const lockedRows = await tx.$queryRaw<
        Array<{
          id: string;
          memberSubscriptionId: string;
          status: string;
        }>
      >`SELECT id, "memberSubscriptionId", status FROM payment_declarations WHERE id = ${declarationId} FOR UPDATE`;

      if (!lockedRows || lockedRows.length === 0) {
        throw new NotFoundException('Declaration not found');
      }

      const dec = lockedRows[0];
      if (dec.status !== DeclarationStatus.PENDING) {
        throw new ConflictException(
          `Declaration cannot be confirmed: current status is ${dec.status}`,
        );
      }

      // Update declaration
      await tx.paymentDeclaration.update({
        where: { id: declarationId },
        data: {
          status: DeclarationStatus.CONFIRMED,
          confirmedByMemberId: treasurerUserId,
          confirmedAt: now,
          receiptNo: dto.receiptNo,
          bookNo: dto.bookNo,
        },
      });

      // Update subscription to PAID
      const updatedSub = await tx.memberSubscription.update({
        where: { id: dec.memberSubscriptionId },
        data: {
          status: SubscriptionStatus.PAID,
          paidAt: now,
        },
        include: {
          period: true,
        },
      });

      memberIdToNotify = updatedSub.memberId;
      amountKdToNotify = (updatedSub.period.amountFils / 1000).toString();

      // REQUIREMENT CLARIFICATION NEEDED: Whether the Treasurer may confirm their own receipt is not specified in the PDF. Allowed without blocking.
      await tx.auditLog.create({
        data: {
          actorMemberId: treasurerUserId,
          action: 'RECEIPT_CONFIRMED',
          entity: 'PaymentDeclaration',
          entityId: declarationId,
          details: {
            receiptNo: dto.receiptNo,
            bookNo: dto.bookNo,
            memberSubscriptionId: dec.memberSubscriptionId,
            confirmedAt: now.toISOString(),
          },
        },
      });
    });

    // After commit: send notification if service exists (never rollback on failure)
    if (this.notificationsService && memberIdToNotify) {
      try {
        await this.notificationsService.create(
          memberIdToNotify,
          NotificationType.RECEIPT_CONFIRMED,
          'Receipt confirmed',
          `Treasurer entered receipt no. ${dto.receiptNo}, Book ${dto.bookNo}. KD ${amountKdToNotify} received.`,
        );
      } catch (err: any) {
        this.logger.error(
          `Failed to dispatch confirmation notification: ${err?.message || err}`,
        );
      }
    }

    return {
      success: true,
      message: 'Receipt confirmed successfully',
    };
  }

  /**
   * POST /dev/subscriptions/reset
   */
  async resetSubscription(memberCode: string) {
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.ENABLE_DEV_ENDPOINTS !== 'true'
    ) {
      throw new NotFoundException();
    }

    const member = await this.prisma.member.findUnique({
      where: { memberCode: memberCode.toUpperCase() },
    });

    if (!member) {
      throw new NotFoundException(`Member not found for code ${memberCode}`);
    }

    const currentPeriod = await this.getCurrentPeriod();

    const subscription = await this.prisma.memberSubscription.findUnique({
      where: {
        memberId_periodId: {
          memberId: member.id,
          periodId: currentPeriod.id,
        },
      },
    });

    if (subscription) {
      const declarations = await this.prisma.paymentDeclaration.findMany({
        where: { memberSubscriptionId: subscription.id },
      });

      for (const dec of declarations) {
        if (dec.receiptKey) {
          await this.fileStorage.deleteReceipt(dec.receiptKey);
        }
      }

      await this.prisma.paymentDeclaration.deleteMany({
        where: { memberSubscriptionId: subscription.id },
      });

      await this.prisma.memberSubscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.DUE,
          paidAt: null,
        },
      });
    }

    return {
      success: true,
      message: `Reset subscription to DUE for member ${memberCode}`,
    };
  }
}
