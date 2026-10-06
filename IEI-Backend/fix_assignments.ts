import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, OfficePosition } from './src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function fix() {
  console.log('Resetting and assigning exact roles to each demo officer...');
  await prisma.officeBearerAssignment.deleteMany({});

  const mTreasurer = await prisma.member.findUnique({ where: { memberCode: 'IEI9001' } });
  const mChairman = await prisma.member.findUnique({ where: { memberCode: 'IEI9002' } });
  const mSecretary = await prisma.member.findUnique({ where: { memberCode: 'IEI9003' } });
  const mVolunteer = await prisma.member.findUnique({ where: { memberCode: 'IEI9004' } });

  if (mTreasurer) {
    await prisma.officeBearerAssignment.create({
      data: { memberId: mTreasurer.id, position: OfficePosition.TREASURER, term: '2026-27', active: true },
    });
  }
  if (mChairman) {
    await prisma.officeBearerAssignment.create({
      data: { memberId: mChairman.id, position: OfficePosition.CHAIRMAN, term: '2026-27', active: true },
    });
  }
  if (mSecretary) {
    await prisma.officeBearerAssignment.create({
      data: { memberId: mSecretary.id, position: OfficePosition.GENERAL_SECRETARY, term: '2026-27', active: true },
    });
  }
  if (mVolunteer) {
    await prisma.officeBearerAssignment.create({
      data: { memberId: mVolunteer.id, position: OfficePosition.EC_VOLUNTEER, term: '2026-27', active: true },
    });
  }

  console.log('Roles cleanly assigned: 9001=TREASURER, 9002=CHAIRMAN, 9003=GENERAL_SECRETARY, 9004=EC_VOLUNTEER');
}

fix().finally(() => prisma.$disconnect());
