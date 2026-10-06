import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function check() {
  const m3 = await prisma.member.findUnique({
    where: { memberCode: 'IEI9003' },
    include: { officeBearerAssignments: true },
  });
  console.log('IEI9003:', JSON.stringify(m3, null, 2));

  const allAssignments = await prisma.officeBearerAssignment.findMany();
  console.log('All assignments:', JSON.stringify(allAssignments, null, 2));
}

check().finally(() => prisma.$disconnect());
