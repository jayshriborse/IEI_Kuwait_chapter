import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, OfficePosition, SubscriptionStatus, PaymentMethod, DeclarationStatus } from './src/generated/prisma/client';

const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  console.log(`\n==================================================`);
  console.log(`IEI KUWAIT DATABASE RECONCILIATION SCRIPT`);
  console.log(`MODE: ${isDryRun ? 'DRY-RUN (READ-ONLY, NO WRITES)' : 'EXECUTE (TRANSACTIONAL WRITE)'}`);
  console.log(`==================================================\n`);

  try {
    // 1. Fetch Subscription Periods
    const period2025 = await prisma.subscriptionPeriod.findUnique({ where: { label: '2025-26' } });
    const period2026 = await prisma.subscriptionPeriod.findUnique({ where: { label: '2026-27' } });

    if (!period2025 || !period2026) {
      throw new Error('Subscription periods 2025-26 or 2026-27 missing in database.');
    }

    // 2. Pre-check: Verify none of the 5 Member IDs or mobiles already exist
    const codesToCheck = ['IEI9002', 'IEI9003', 'IEI9004', 'IEI9201', 'IEI9202'];
    const mobilesToCheck = ['00000002', '00000003', '00000004', '00009201', '00009202'];

    const existingCodes = await prisma.member.findMany({
      where: { memberCode: { in: codesToCheck } },
    });
    const existingMobiles = await prisma.member.findMany({
      where: { mobile: { in: mobilesToCheck } },
    });

    if (existingCodes.length > 0) {
      throw new Error(`CONFLICT: Member codes already exist: ${existingCodes.map(m => m.memberCode).join(', ')}`);
    }
    if (existingMobiles.length > 0) {
      throw new Error(`CONFLICT: Mobiles already exist: ${existingMobiles.map(m => m.mobile).join(', ')}`);
    }

    console.log('Pre-check passed: None of the 5 Member IDs or mobiles exist in DB.\n');

    // 3. Define the 5 members to add exactly as per Excel
    const membersToAdd = [
      {
        member: {
          memberCode: 'IEI9002',
          fullName: 'General Secretary (DEV)',
          grade: 'MIE' as const,
          discipline: 'Administration',
          mobile: '00000002',
          bloodGroup: 'B+',
          ieiIndiaNo: 'M-DEV-9002',
          memberSinceYear: 2026,
        },
        officePosition: OfficePosition.GENERAL_SECRETARY,
        term: '2026-27',
        subscription2025: SubscriptionStatus.PAID,
        subscription2026: SubscriptionStatus.PAID,
        needsPendingDeclaration: false,
        summary: 'General Secretary (2026–27) - Chapter Administration, Event Door Check-in & attendee scanning, reviews membership applications. Forbidden from financial receipts.',
      },
      {
        member: {
          memberCode: 'IEI9003',
          fullName: 'Chairman (DEV)',
          grade: 'FIE' as const,
          discipline: 'Executive Administration',
          mobile: '00000003',
          bloodGroup: 'O+',
          ieiIndiaNo: 'F-DEV-9003',
          memberSinceYear: 2026,
        },
        officePosition: OfficePosition.CHAIRMAN,
        term: '2026-27',
        subscription2025: SubscriptionStatus.PAID,
        subscription2026: SubscriptionStatus.PAID,
        needsPendingDeclaration: false,
        summary: 'Chapter Chairman (2026–27) - Executive Head, Event Door Check-in & attendance verification, high-level operations review. Forbidden from financial receipts.',
      },
      {
        member: {
          memberCode: 'IEI9004',
          fullName: 'EC Volunteer (DEV)',
          grade: 'AMIE' as const,
          discipline: 'Event Operations',
          mobile: '00000004',
          bloodGroup: 'A+',
          ieiIndiaNo: 'A-DEV-9004',
          memberSinceYear: 2026,
        },
        officePosition: OfficePosition.EC_VOLUNTEER,
        term: '2026-27',
        subscription2025: SubscriptionStatus.PAID,
        subscription2026: SubscriptionStatus.PAID,
        needsPendingDeclaration: false,
        summary: 'EC Volunteer / Desk Officer - Event Operations, Door QR Check-in scanner, Manual Member ID check-in.',
      },
      {
        member: {
          memberCode: 'IEI9201',
          fullName: 'Demo Member Alpha',
          grade: 'MIE' as const,
          discipline: 'General Engineering',
          mobile: '00009201',
          bloodGroup: 'O+',
          ieiIndiaNo: 'M-DEV-9201',
          memberSinceYear: 2026,
        },
        officePosition: null,
        term: null,
        subscription2025: SubscriptionStatus.PAID,
        subscription2026: SubscriptionStatus.DUE,
        needsPendingDeclaration: false,
        summary: 'Active Member (Alpha Demo) - Status: Dues Due (KD 20 due warning band; can submit payment declaration & upload receipt slip).',
      },
      {
        member: {
          memberCode: 'IEI9202',
          fullName: 'Demo Member Beta',
          grade: 'MIE' as const,
          discipline: 'General Engineering',
          mobile: '00009202',
          bloodGroup: 'B+',
          ieiIndiaNo: 'M-DEV-9202',
          memberSinceYear: 2026,
        },
        officePosition: null,
        term: null,
        subscription2025: SubscriptionStatus.PAID,
        subscription2026: SubscriptionStatus.AWAITING_CONFIRMATION,
        needsPendingDeclaration: true,
        summary: 'Active Member (Beta Demo) - Status: With Treasurer (Submitted bank transfer receipt; in Treasurer confirmation queue; second submit blocked).',
      },
    ];

    console.log(`PLANNED ACTIONS FOR ${membersToAdd.length} MEMBERS:\n`);

    for (const item of membersToAdd) {
      console.log(`----------------------------------------------------------------`);
      console.log(`MEMBER: ${item.member.memberCode} | ${item.member.fullName}`);
      console.log(`Mobile: ${item.member.mobile}`);
      console.log(`Role / Position: ${item.officePosition || 'Standard Member (None)'}`);
      console.log(`Term: ${item.term || 'N/A'}`);
      console.log(`2025-26 Subscription: ${item.subscription2025}`);
      console.log(`2026-27 Subscription: ${item.subscription2026}`);
      console.log(`Pending Receipt Declaration: ${item.needsPendingDeclaration ? 'YES (Bank Transfer, PENDING, awaiting Treasurer)' : 'NO'}`);
      console.log(`Summary: ${item.summary}`);
    }
    console.log(`----------------------------------------------------------------\n`);

    if (isDryRun) {
      console.log('>>> DRY-RUN COMPLETE. ZERO DATABASE WRITES WERE PERFORMED. <<<');
      console.log('>>> WAITING FOR EXPLICIT USER APPROVAL BEFORE PROCEEDING TO STEP 3. <<<\n');
      return;
    }

    // Execute transactional insert (Only reached when --execute is passed after approval)
    await prisma.$transaction(async (tx) => {
      for (const item of membersToAdd) {
        // 1. Insert Member
        const createdMember = await tx.member.create({
          data: item.member,
        });

        // 2. Insert Office Bearer Assignment if applicable
        if (item.officePosition && item.term) {
          await tx.officeBearerAssignment.create({
            data: {
              memberId: createdMember.id,
              position: item.officePosition,
              term: item.term,
              active: true,
            },
          });
        }

        // 3. Insert 2025-26 Subscription
        await tx.memberSubscription.create({
          data: {
            memberId: createdMember.id,
            periodId: period2025.id,
            status: item.subscription2025,
            paidAt: item.subscription2025 === SubscriptionStatus.PAID ? new Date('2025-04-15T00:00:00.000Z') : null,
          },
        });

        // 4. Insert 2026-27 Subscription
        const sub2026 = await tx.memberSubscription.create({
          data: {
            memberId: createdMember.id,
            periodId: period2026.id,
            status: item.subscription2026,
            paidAt: item.subscription2026 === SubscriptionStatus.PAID ? new Date('2026-04-15T00:00:00.000Z') : null,
          },
        });

        // 5. Insert Pending PaymentDeclaration for Demo Member Beta
        if (item.needsPendingDeclaration) {
          await tx.paymentDeclaration.create({
            data: {
              memberSubscriptionId: sub2026.id,
              method: PaymentMethod.BANK_TRANSFER,
              receiptKey: 'receipts/demo-iei9202-bank-transfer.png',
              status: DeclarationStatus.PENDING,
              submittedAt: new Date(),
            },
          });
        }
      }
    });

    console.log('>>> EXECUTION SUCCESSFUL: All 5 members inserted in a single atomic transaction. <<<');
  } catch (error) {
    console.error('Error during execution:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
