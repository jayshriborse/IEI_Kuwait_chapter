import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma/client';

async function backup() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const backupDir = path.resolve('d:/IEI-Kuwait-Engineering/IEI-Docs/backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `iei_database_backup_${timestamp}.json`);

    console.log(`Starting database backup to: ${backupFile}`);

    const [
      members,
      officeBearerAssignments,
      subscriptionPeriods,
      memberSubscriptions,
      paymentDeclarations,
      notifications,
      deviceTokens,
      eventCheckIns,
      authIdentities,
      auditLogs,
    ] = await Promise.all([
      prisma.member.findMany(),
      prisma.officeBearerAssignment.findMany(),
      prisma.subscriptionPeriod.findMany(),
      prisma.memberSubscription.findMany(),
      prisma.paymentDeclaration.findMany(),
      prisma.notification.findMany(),
      prisma.deviceToken.findMany(),
      prisma.eventCheckIn.findMany(),
      prisma.authIdentity.findMany(),
      prisma.auditLog.findMany(),
    ]);

    const backupPayload = {
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'),
      tableCounts: {
        members: members.length,
        officeBearerAssignments: officeBearerAssignments.length,
        subscriptionPeriods: subscriptionPeriods.length,
        memberSubscriptions: memberSubscriptions.length,
        paymentDeclarations: paymentDeclarations.length,
        notifications: notifications.length,
        deviceTokens: deviceTokens.length,
        eventCheckIns: eventCheckIns.length,
        authIdentities: authIdentities.length,
        auditLogs: auditLogs.length,
      },
      data: {
        members,
        officeBearerAssignments,
        subscriptionPeriods,
        memberSubscriptions,
        paymentDeclarations,
        notifications,
        deviceTokens,
        eventCheckIns,
        authIdentities,
        auditLogs,
      },
    };

    fs.writeFileSync(backupFile, JSON.stringify(backupPayload, null, 2), 'utf8');

    console.log('--- DATABASE BACKUP COMPLETE ---');
    console.log(`Backup Location: ${backupFile}`);
    console.log('Record Counts:', backupPayload.tableCounts);
  } catch (err) {
    console.error('Backup failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
