import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma/client';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const members = await prisma.member.findMany({
      include: {
        officeBearerAssignments: true,
        subscriptions: {
          include: {
            period: true,
            declarations: true,
          },
        },
      },
      orderBy: { memberCode: 'asc' },
    });

    console.log(`Total Members in DB: ${members.length}`);
    for (const m of members) {
      console.log(`\n--- Member: ${m.memberCode} (${m.fullName}) ---`);
      console.log(`ID: ${m.id}`);
      console.log(`Mobile: ${m.mobile}`);
      console.log(`Grade: ${m.grade}, Discipline: ${m.discipline}`);
      console.log(`IEI India No: ${m.ieiIndiaNo}`);
      console.log(`Office Bearer:`, m.officeBearerAssignments.map(o => `${o.position} (term: ${o.term}, active: ${o.active})`));
      console.log(`Subscriptions:`, m.subscriptions.map(s => `${s.period.label}: ${s.status} (paidAt: ${s.paidAt})`));
    }
  } catch (e) {
    console.error('Database query error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
