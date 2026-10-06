// DEV DATA ONLY. Sample values taken from the client's prototype review deck (PDF).
// This is NOT real IEI member data. Never run this script in production.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  SubscriptionStatus,
  OfficePosition,
  NotificationType,
  AuthProvider,
} from '../src/generated/prisma/client';

if (process.env.NODE_ENV === 'production') {
  throw new Error('Seed script refused execution: NODE_ENV is set to production.');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding DEV data into PostgreSQL...');

  // DEV Member 1 (Client PDF)
  const member1 = await prisma.member.upsert({
    where: { memberCode: 'IEI0005' },
    update: {
      fullName: 'Eng. Karthikeyan Manickam', // DEV value from client PDF
      grade: 'MIE',                           // DEV value from client PDF
      discipline: 'Civil',                   // DEV value from client PDF
      mobile: '99840191',                     // DEV digits-only mobile from client PDF
      bloodGroup: 'O+',                       // DEV value from client PDF
      ieiIndiaNo: 'M-1483721',               // DEV value from client PDF
      memberSinceYear: 2011,                 // DEV value from client PDF
      company: 'KEO International Consultants',
      designation: 'Senior Civil Engineer',
      governorate: 'Hawalli',
      sector: 'Construction',
      areaLocality: 'Salmiya',
      familyStatus: 'Family here',
      familyMembersCount: 3,
    },
    create: {
      memberCode: 'IEI0005',                 // DEV value
      fullName: 'Eng. Karthikeyan Manickam', // DEV value
      grade: 'MIE',                           // DEV value
      discipline: 'Civil',                   // DEV value
      mobile: '99840191',                     // DEV digits-only mobile
      bloodGroup: 'O+',                       // DEV value
      ieiIndiaNo: 'M-1483721',               // DEV value
      memberSinceYear: 2011,                 // DEV value
      company: 'KEO International Consultants',
      designation: 'Senior Civil Engineer',
      governorate: 'Hawalli',
      sector: 'Construction',
      areaLocality: 'Salmiya',
      familyStatus: 'Family here',
      familyMembersCount: 3,
    },
  });
  console.log(`Seeded DEV Member 1: ${member1.memberCode} (${member1.fullName})`);

  // DEV Member 2 (Client PDF & DEV fallback values)
  const member2 = await prisma.member.upsert({
    where: { memberCode: 'IEI0010' },
    update: {
      fullName: 'Engr. Anu Kurian',          // DEV value from client PDF
      grade: 'MIE',                           // DEV value
      discipline: 'Electrical',              // DEV value from client PDF
      mobile: '00000010',                     // DEV digits-only mobile
      bloodGroup: 'A+',                       // DEV value
      ieiIndiaNo: 'M-DEV-0010',               // DEV value
      memberSinceYear: 2015,                 // DEV value
      company: 'Kuwait Oil Company (KOC)',
      designation: 'Senior Electrical Engineer',
      governorate: 'Farwaniya',
      sector: 'Oil & Gas',
      areaLocality: 'Abbassiya',
      familyStatus: 'Family here',
      familyMembersCount: 3,
    },
    create: {
      memberCode: 'IEI0010',                 // DEV value
      fullName: 'Engr. Anu Kurian',          // DEV value
      grade: 'MIE',                           // DEV value
      discipline: 'Electrical',              // DEV value
      mobile: '00000010',                     // DEV digits-only mobile
      bloodGroup: 'A+',                       // DEV value
      ieiIndiaNo: 'M-DEV-0010',               // DEV value
      memberSinceYear: 2015,                 // DEV value
      company: 'Kuwait Oil Company (KOC)',
      designation: 'Senior Electrical Engineer',
      governorate: 'Farwaniya',
      sector: 'Oil & Gas',
      areaLocality: 'Abbassiya',
      familyStatus: 'Family here',
      familyMembersCount: 3,
    },
  });
  console.log(`Seeded DEV Member 2: ${member2.memberCode} (${member2.fullName})`);

  // DEV Member 3 (Demo Member Three)
  const member3 = await prisma.member.upsert({
    where: { memberCode: 'IEI9100' },
    update: {
      fullName: 'Demo Member Three',          // DEV value
      grade: 'AMIE',                          // DEV value
      discipline: 'Mechanical',              // DEV value
      mobile: '00000100',                     // DEV digits-only mobile
      bloodGroup: 'B+',                       // DEV value
      ieiIndiaNo: 'M-DEV-9100',               // DEV value
      memberSinceYear: 2020,                 // DEV value
      company: 'Gulf Spic General Trading & Contracting',
      designation: 'Project Engineer',
      governorate: 'Capital (Al Asimah)',
      sector: 'Construction',
      areaLocality: 'Kuwait City',
      familyStatus: 'Bachelor status',
      familyMembersCount: 1,
    },
    create: {
      memberCode: 'IEI9100',                 // DEV value
      fullName: 'Demo Member Three',          // DEV value
      grade: 'AMIE',                          // DEV value
      discipline: 'Mechanical',              // DEV value
      mobile: '00000100',                     // DEV digits-only mobile
      bloodGroup: 'B+',                       // DEV value
      ieiIndiaNo: 'M-DEV-9100',               // DEV value
      memberSinceYear: 2020,                 // DEV value
      company: 'Gulf Spic General Trading & Contracting',
      designation: 'Project Engineer',
      governorate: 'Capital (Al Asimah)',
      sector: 'Construction',
      areaLocality: 'Kuwait City',
      familyStatus: 'Bachelor status',
      familyMembersCount: 1,
    },
  });
  console.log(`Seeded DEV Member 3: ${member3.memberCode} (${member3.fullName})`);

  // DEV Member 4: IEI0015
  await prisma.member.upsert({
    where: { memberCode: 'IEI0015' },
    update: {
      fullName: 'Eng. Rajesh Sharma',
      grade: 'MIE',
      discipline: 'Mechanical',
      mobile: '99112233',
      bloodGroup: 'B+',
      ieiIndiaNo: 'M-DEV-0015',
      memberSinceYear: 2016,
      company: 'Combined Group Contracting',
      designation: 'Lead Mechanical Engineer',
      governorate: 'Hawalli',
      sector: 'Construction',
      areaLocality: 'Salmiya',
      familyStatus: 'Family here',
      familyMembersCount: 2,
    },
    create: {
      memberCode: 'IEI0015',
      fullName: 'Eng. Rajesh Sharma',
      grade: 'MIE',
      discipline: 'Mechanical',
      mobile: '99112233',
      bloodGroup: 'B+',
      ieiIndiaNo: 'M-DEV-0015',
      memberSinceYear: 2016,
      company: 'Combined Group Contracting',
      designation: 'Lead Mechanical Engineer',
      governorate: 'Hawalli',
      sector: 'Construction',
      areaLocality: 'Salmiya',
      familyStatus: 'Family here',
      familyMembersCount: 2,
    },
  });

  // DEV Member 5: IEI0022
  const memberPriya = await prisma.member.upsert({
    where: { memberCode: 'IEI0022' },
    update: {
      fullName: 'Eng. Priya Sundaram',
      grade: 'MIE',
      discipline: 'Electronics & Comm',
      mobile: '99223344',
      bloodGroup: 'O+',
      ieiIndiaNo: 'M-DEV-0022',
      memberSinceYear: 2018,
      company: 'Zain Telecom',
      designation: 'Telecom Infrastructure Specialist',
      governorate: 'Hawalli',
      sector: 'IT & Telecom',
      areaLocality: 'Salmiya',
      familyStatus: 'Family here',
      familyMembersCount: 3,
    },
    create: {
      memberCode: 'IEI0022',
      fullName: 'Eng. Priya Sundaram',
      grade: 'MIE',
      discipline: 'Electronics & Comm',
      mobile: '99223344',
      bloodGroup: 'O+',
      ieiIndiaNo: 'M-DEV-0022',
      memberSinceYear: 2018,
      company: 'Zain Telecom',
      designation: 'Telecom Infrastructure Specialist',
      governorate: 'Hawalli',
      sector: 'IT & Telecom',
      areaLocality: 'Salmiya',
      familyStatus: 'Family here',
      familyMembersCount: 3,
    },
  });

  // DEV Member 6: IEI0034
  await prisma.member.upsert({
    where: { memberCode: 'IEI0034' },
    update: {
      fullName: 'Engr. Subbiah Somasundaram',
      grade: 'FIE',
      discipline: 'Civil',
      mobile: '99334455',
      bloodGroup: 'AB+',
      ieiIndiaNo: 'F-DEV-0034',
      memberSinceYear: 2005,
      company: 'Ministry of Public Works',
      designation: 'Consultant Civil Engineer',
      governorate: 'Capital (Al Asimah)',
      sector: 'Public Works',
      areaLocality: 'Kuwait City',
      familyStatus: 'Family here',
      familyMembersCount: 2,
    },
    create: {
      memberCode: 'IEI0034',
      fullName: 'Engr. Subbiah Somasundaram',
      grade: 'FIE',
      discipline: 'Civil',
      mobile: '99334455',
      bloodGroup: 'AB+',
      ieiIndiaNo: 'F-DEV-0034',
      memberSinceYear: 2005,
      company: 'Ministry of Public Works',
      designation: 'Consultant Civil Engineer',
      governorate: 'Capital (Al Asimah)',
      sector: 'Public Works',
      areaLocality: 'Kuwait City',
      familyStatus: 'Family here',
      familyMembersCount: 2,
    },
  });

  // DEV Member 7: IEI0042
  await prisma.member.upsert({
    where: { memberCode: 'IEI0042' },
    update: {
      fullName: 'Engr. Upendra Kumar Behura',
      grade: 'FIE',
      discipline: 'Electrical',
      mobile: '98765432',
      bloodGroup: 'O+',
      ieiIndiaNo: 'F-1204856',
      memberSinceYear: 2008,
      company: 'Equate Petrochemical',
      designation: 'Principal Electrical Engineer',
      governorate: 'Ahmadi',
      sector: 'Oil & Gas',
      areaLocality: 'Fahaheel',
      familyStatus: 'Family here',
      familyMembersCount: 4,
    },
    create: {
      memberCode: 'IEI0042',
      fullName: 'Engr. Upendra Kumar Behura',
      grade: 'FIE',
      discipline: 'Electrical',
      mobile: '98765432',
      bloodGroup: 'O+',
      ieiIndiaNo: 'F-1204856',
      memberSinceYear: 2008,
      company: 'Equate Petrochemical',
      designation: 'Principal Electrical Engineer',
      governorate: 'Ahmadi',
      sector: 'Oil & Gas',
      areaLocality: 'Fahaheel',
      familyStatus: 'Family here',
      familyMembersCount: 4,
    },
  });

  // DEV Member 8: IEI9001 - Treasurer (Client PDF)
  const memberTreasurer = await prisma.member.upsert({
    where: { memberCode: 'IEI9001' },
    update: {
      fullName: 'Engr. Sudhir Shyam Menghani', // DEV value from client PDF
      grade: 'MIE',                            // DEV value
      discipline: 'Electrical',               // DEV value
      mobile: '00000001',                      // DEV digits-only mobile
      bloodGroup: 'B+',                        // DEV value
      ieiIndiaNo: 'M-DEV-9001',                // DEV value
      memberSinceYear: 2012,                  // DEV value
      company: 'Alghanim Industries',
      designation: 'Chief Electrical Engineer',
      governorate: 'Capital (Al Asimah)',
      sector: 'Power & Water',
      areaLocality: 'Kuwait City',
      familyStatus: 'Family here',
      familyMembersCount: 4,
    },
    create: {
      memberCode: 'IEI9001',                  // DEV value
      fullName: 'Engr. Sudhir Shyam Menghani', // DEV value from client PDF
      grade: 'MIE',                            // DEV value
      discipline: 'Electrical',               // DEV value
      mobile: '00000001',                      // DEV digits-only mobile
      bloodGroup: 'B+',                        // DEV value
      ieiIndiaNo: 'M-DEV-9001',                // DEV value
      memberSinceYear: 2012,                  // DEV value
      company: 'Alghanim Industries',
      designation: 'Chief Electrical Engineer',
      governorate: 'Capital (Al Asimah)',
      sector: 'Power & Water',
      areaLocality: 'Kuwait City',
      familyStatus: 'Family here',
      familyMembersCount: 4,
    },
  });
  console.log(`Seeded DEV Member 8 (Treasurer): ${memberTreasurer.memberCode} (${memberTreasurer.fullName})`);

  // Seed Subscription Periods (DEV DATA)
  const period2025 = await prisma.subscriptionPeriod.upsert({
    where: { label: '2025-26' },
    update: {
      startsOn: new Date('2025-04-01T00:00:00.000Z'),
      endsOn: new Date('2026-03-31T00:00:00.000Z'),
      amountFils: 20000, // 20 KD = 20000 fils (DEV)
      currency: 'KWD',
    },
    create: {
      label: '2025-26',
      startsOn: new Date('2025-04-01T00:00:00.000Z'),
      endsOn: new Date('2026-03-31T00:00:00.000Z'),
      amountFils: 20000,
      currency: 'KWD',
    },
  });

  const period2026 = await prisma.subscriptionPeriod.upsert({
    where: { label: '2026-27' },
    update: {
      startsOn: new Date('2026-04-01T00:00:00.000Z'),
      endsOn: new Date('2027-03-31T00:00:00.000Z'),
      amountFils: 20000, // 20 KD = 20000 fils (DEV)
      currency: 'KWD',
    },
    create: {
      label: '2026-27',
      startsOn: new Date('2026-04-01T00:00:00.000Z'),
      endsOn: new Date('2027-03-31T00:00:00.000Z'),
      amountFils: 20000,
      currency: 'KWD',
    },
  });
  console.log(`Seeded Subscription Periods: ${period2025.label}, ${period2026.label}`);

  // Seed Subscriptions for IEI0005, IEI0010, IEI9100, IEI9001 (DEV DATA)
  // 2025-26 = PAID (paidAt 2025-04-15), 2026-27 = DUE
  const subscriptionMembers = ['IEI0005', 'IEI0010', 'IEI9100', 'IEI9001'];
  for (const code of subscriptionMembers) {
    const mem = await prisma.member.findUnique({ where: { memberCode: code } });
    if (!mem) continue;

    // 2025-26 PAID
    await prisma.memberSubscription.upsert({
      where: {
        memberId_periodId: {
          memberId: mem.id,
          periodId: period2025.id,
        },
      },
      update: {
        status: SubscriptionStatus.PAID,
        paidAt: new Date('2025-04-15T00:00:00.000Z'), // DEV paidAt date
      },
      create: {
        memberId: mem.id,
        periodId: period2025.id,
        status: SubscriptionStatus.PAID,
        paidAt: new Date('2025-04-15T00:00:00.000Z'), // DEV paidAt date
      },
    });

    // 2026-27 DUE
    await prisma.memberSubscription.upsert({
      where: {
        memberId_periodId: {
          memberId: mem.id,
          periodId: period2026.id,
        },
      },
      update: {
        status: SubscriptionStatus.DUE,
        paidAt: null,
      },
      create: {
        memberId: mem.id,
        periodId: period2026.id,
        status: SubscriptionStatus.DUE,
        paidAt: null,
      },
    });
  }
  console.log('Seeded member subscriptions: 2025-26 = PAID (paid up to 31 Mar 2026), 2026-27 = DUE');

  // Seed OfficeBearerAssignment: IEI9001 as TREASURER for term "2026-27" (DEV DATA)
  await prisma.officeBearerAssignment.upsert({
    where: {
      memberId_position_term: {
        memberId: memberTreasurer.id,
        position: OfficePosition.TREASURER,
        term: '2026-27',
      },
    },
    update: {
      active: true,
    },
    create: {
      memberId: memberTreasurer.id,
      position: OfficePosition.TREASURER,
      term: '2026-27',
      active: true,
    },
  });
  console.log('Seeded OfficeBearerAssignment: IEI9001 as TREASURER (term 2026-27, active)');

  // Seed DEV Member IEI9004 (EC Volunteer)
  const memberVolunteer = await prisma.member.upsert({
    where: { memberCode: 'IEI9004' },
    update: {
      fullName: 'EC Volunteer (DEV)',
      grade: 'AMIE',
      discipline: 'Event Operations',
      mobile: '00000004',
      bloodGroup: 'A+',
      ieiIndiaNo: 'A-DEV-9004',
      memberSinceYear: 2026,
      company: 'IEI Kuwait Chapter',
      designation: 'EC Volunteer',
      governorate: 'Capital (Al Asimah)',
      sector: 'Operations',
      areaLocality: 'Kuwait City',
      familyStatus: 'Bachelor status',
      familyMembersCount: 1,
    },
    create: {
      memberCode: 'IEI9004',
      fullName: 'EC Volunteer (DEV)',
      grade: 'AMIE',
      discipline: 'Event Operations',
      mobile: '00000004',
      bloodGroup: 'A+',
      ieiIndiaNo: 'A-DEV-9004',
      memberSinceYear: 2026,
      company: 'IEI Kuwait Chapter',
      designation: 'EC Volunteer',
      governorate: 'Capital (Al Asimah)',
      sector: 'Operations',
      areaLocality: 'Kuwait City',
      familyStatus: 'Bachelor status',
      familyMembersCount: 1,
    },
  });
  console.log(`Seeded DEV Member (Volunteer): ${memberVolunteer.memberCode} (${memberVolunteer.fullName})`);

  // Seed OfficeBearerAssignment: IEI9004 as EC_VOLUNTEER for term "2026-27"
  await prisma.officeBearerAssignment.upsert({
    where: {
      memberId_position_term: {
        memberId: memberVolunteer.id,
        position: OfficePosition.EC_VOLUNTEER,
        term: '2026-27',
      },
    },
    update: {
      active: true,
    },
    create: {
      memberId: memberVolunteer.id,
      position: OfficePosition.EC_VOLUNTEER,
      term: '2026-27',
      active: true,
    },
  });
  console.log('Seeded OfficeBearerAssignment: IEI9004 as EC_VOLUNTEER (term 2026-27, active)');

  // Seed DEV Member IEI9002 (Chairman)
  const memberChairman = await prisma.member.upsert({
    where: { memberCode: 'IEI9002' },
    update: {
      fullName: 'Dr. M. Mahendran (Chairman)',
      grade: 'FIE',
      discipline: 'Mechanical',
      mobile: '00000002',
      bloodGroup: 'O+',
      ieiIndiaNo: 'F-DEV-9002',
      memberSinceYear: 2004,
      company: 'IEI Kuwait Chapter',
      designation: 'Chapter Chairman',
      governorate: 'Capital (Al Asimah)',
      sector: 'Executive Committee',
      areaLocality: 'Kuwait City',
      familyStatus: 'Family here',
      familyMembersCount: 2,
    },
    create: {
      memberCode: 'IEI9002',
      fullName: 'Dr. M. Mahendran (Chairman)',
      grade: 'FIE',
      discipline: 'Mechanical',
      mobile: '00000002',
      bloodGroup: 'O+',
      ieiIndiaNo: 'F-DEV-9002',
      memberSinceYear: 2004,
      company: 'IEI Kuwait Chapter',
      designation: 'Chapter Chairman',
      governorate: 'Capital (Al Asimah)',
      sector: 'Executive Committee',
      areaLocality: 'Kuwait City',
      familyStatus: 'Family here',
      familyMembersCount: 2,
    },
  });
  await prisma.officeBearerAssignment.upsert({
    where: {
      memberId_position_term: {
        memberId: memberChairman.id,
        position: OfficePosition.CHAIRMAN,
        term: '2026-27',
      },
    },
    update: { active: true },
    create: {
      memberId: memberChairman.id,
      position: OfficePosition.CHAIRMAN,
      term: '2026-27',
      active: true,
    },
  });
  console.log('Seeded OfficeBearerAssignment: IEI9002 as CHAIRMAN (term 2026-27, active)');

  // Seed DEV Member IEI9003 (General Secretary)
  const memberSecretary = await prisma.member.upsert({
    where: { memberCode: 'IEI9003' },
    update: {
      fullName: 'Engr. General Secretary (DEV)',
      grade: 'MIE',
      discipline: 'Civil',
      mobile: '00000003',
      bloodGroup: 'B+',
      ieiIndiaNo: 'M-DEV-9003',
      memberSinceYear: 2010,
      company: 'IEI Kuwait Chapter',
      designation: 'General Secretary',
      governorate: 'Capital (Al Asimah)',
      sector: 'Executive Committee',
      areaLocality: 'Kuwait City',
      familyStatus: 'Family here',
      familyMembersCount: 3,
    },
    create: {
      memberCode: 'IEI9003',
      fullName: 'Engr. General Secretary (DEV)',
      grade: 'MIE',
      discipline: 'Civil',
      mobile: '00000003',
      bloodGroup: 'B+',
      ieiIndiaNo: 'M-DEV-9003',
      memberSinceYear: 2010,
      company: 'IEI Kuwait Chapter',
      designation: 'General Secretary',
      governorate: 'Capital (Al Asimah)',
      sector: 'Executive Committee',
      areaLocality: 'Kuwait City',
      familyStatus: 'Family here',
      familyMembersCount: 3,
    },
  });
  await prisma.officeBearerAssignment.upsert({
    where: {
      memberId_position_term: {
        memberId: memberSecretary.id,
        position: OfficePosition.GENERAL_SECRETARY,
        term: '2026-27',
      },
    },
    update: { active: true },
    create: {
      memberId: memberSecretary.id,
      position: OfficePosition.GENERAL_SECRETARY,
      term: '2026-27',
      active: true,
    },
  });
  console.log('Seeded OfficeBearerAssignment: IEI9003 as GENERAL_SECRETARY (term 2026-27, active)');

  // Seed DEV Member IEI9000 (System Administrator)
  const memberAdmin = await prisma.member.upsert({
    where: { memberCode: 'IEI9000' },
    update: {
      fullName: 'IEI Kuwait Administrator',
      grade: 'FIE',
      discipline: 'Administration & Systems',
      mobile: '00000000',
      bloodGroup: 'AB+',
      ieiIndiaNo: 'F-DEV-9000',
      memberSinceYear: 2000,
      company: 'IEI Kuwait Chapter Secretariat',
      designation: 'Executive Administrator',
      governorate: 'Capital (Al Asimah)',
      sector: 'Secretariat',
      areaLocality: 'Kuwait City',
      familyStatus: 'Family here',
      familyMembersCount: 2,
    },
    create: {
      memberCode: 'IEI9000',
      fullName: 'IEI Kuwait Administrator',
      grade: 'FIE',
      discipline: 'Administration & Systems',
      mobile: '00000000',
      bloodGroup: 'AB+',
      ieiIndiaNo: 'F-DEV-9000',
      memberSinceYear: 2000,
      company: 'IEI Kuwait Chapter Secretariat',
      designation: 'Executive Administrator',
      governorate: 'Capital (Al Asimah)',
      sector: 'Secretariat',
      areaLocality: 'Kuwait City',
      familyStatus: 'Family here',
      familyMembersCount: 2,
    },
  });
  console.log('Seeded DEV Member IEI9000 (System Administrator)');

  // 1. Seed AuthIdentities for demo accounts so they are linked
  const demoAuthAccounts = [
    { member: member1, providerUserId: 'google-demo-karthik', email: 'karthik.demo@iei-kuwait.org' },
    { member: member2, providerUserId: 'google-demo-anu', email: 'anu.demo@iei-kuwait.org' },
    { member: memberPriya, providerUserId: 'google-demo-priya', email: 'priya.demo@iei-kuwait.org' },
    { member: memberTreasurer, providerUserId: 'google-demo-treasurer', email: 'treasurer.demo@iei-kuwait.org' },
    { member: memberVolunteer, providerUserId: 'google-demo-volunteer', email: 'volunteer.demo@iei-kuwait.org' },
    { member: memberChairman, providerUserId: 'google-demo-chairman', email: 'chairman.demo@iei-kuwait.org' },
    { member: memberSecretary, providerUserId: 'google-demo-secretary', email: 'secretary.demo@iei-kuwait.org' },
    { member: memberAdmin, providerUserId: 'google-demo-admin', email: 'admin.demo@iei-kuwait.org' },
  ];

  for (const acct of demoAuthAccounts) {
    await prisma.authIdentity.upsert({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.GOOGLE,
          providerUserId: acct.providerUserId,
        },
      },
      update: {
        memberId: acct.member.id,
        email: acct.email,
      },
      create: {
        provider: AuthProvider.GOOGLE,
        providerUserId: acct.providerUserId,
        email: acct.email,
        memberId: acct.member.id,
      },
    });
  }
  console.log('Seeded demo AuthIdentities for linked accounts (IEI0005, IEI0010, IEI0022, IEI9001, IEI9004)');

  // 2. Seed Wings: Ladies Wing and Science Club
  const ladiesWing = await prisma.wing.upsert({
    where: { slug: 'ladies-wing' },
    update: { name: 'Ladies Wing' },
    create: {
      slug: 'ladies-wing',
      name: 'Ladies Wing',
    },
  });
  console.log(`Seeded Wing: ${ladiesWing.name} (${ladiesWing.slug})`);

  const scienceClub = await prisma.wing.upsert({
    where: { slug: 'science-club' },
    update: { name: 'Science Club' },
    create: {
      slug: 'science-club',
      name: 'Science Club',
    },
  });
  console.log(`Seeded Wing: ${scienceClub.name} (${scienceClub.slug})`);

  // 3. Seed Wing Convenors (Do NOT add convenors to OfficePosition enum)
  // Priya Sundaram (IEI0022) is convenor of Ladies Wing
  await prisma.wingConvenor.upsert({
    where: {
      memberId_wingId: {
        memberId: memberPriya.id,
        wingId: ladiesWing.id,
      },
    },
    update: { active: true },
    create: {
      memberId: memberPriya.id,
      wingId: ladiesWing.id,
      assignedBy: memberTreasurer.id,
      assignedAt: new Date(),
      active: true,
    },
  });
  console.log(`Assigned convenor for ${ladiesWing.name}: ${memberPriya.memberCode} (${memberPriya.fullName})`);

  // Anu Kurian (IEI0010) is convenor of Science Club
  await prisma.wingConvenor.upsert({
    where: {
      memberId_wingId: {
        memberId: member2.id,
        wingId: scienceClub.id,
      },
    },
    update: { active: true },
    create: {
      memberId: member2.id,
      wingId: scienceClub.id,
      assignedBy: memberTreasurer.id,
      assignedAt: new Date(),
      active: true,
    },
  });
  console.log(`Assigned convenor for ${scienceClub.name}: ${member2.memberCode} (${member2.fullName})`);

  // 4. Seed Sample Posts
  // Ladies Wing Post 1 (with eventDate)
  const existingPost1 = await prisma.wingPost.findFirst({
    where: {
      wingId: ladiesWing.id,
      title: "'Let's Act' Acting Workshop",
      deletedAt: null,
    },
  });
  if (!existingPost1) {
    await prisma.wingPost.create({
      data: {
        wingId: ladiesWing.id,
        authorMemberId: memberPriya.id,
        title: "'Let's Act' Acting Workshop",
        body: "'Let's Act' acting workshop, 6 Nov at IGNOU Salmiya. Family and children session on theatre and confidence.",
        eventDate: new Date('2026-11-06T17:00:00.000Z'),
      },
    });
  }

  // Ladies Wing Post 2
  const existingPost2 = await prisma.wingPost.findFirst({
    where: {
      wingId: ladiesWing.id,
      title: 'Art of Rangoli & Cultural Expressions',
      deletedAt: null,
    },
  });
  if (!existingPost2) {
    await prisma.wingPost.create({
      data: {
        wingId: ladiesWing.id,
        authorMemberId: memberPriya.id,
        title: 'Art of Rangoli & Cultural Expressions',
        body: 'Celebrating traditional folk arts and family creativity. Materials provided at venue. All members and families welcome.',
        eventDate: new Date('2026-11-20T16:00:00.000Z'),
      },
    });
  }

  // Science Club Post 1 (with eventDate)
  const existingPost3 = await prisma.wingPost.findFirst({
    where: {
      wingId: scienceClub.id,
      title: 'Robotics & AI Hands-on Workshop for Youth',
      deletedAt: null,
    },
  });
  if (!existingPost3) {
    await prisma.wingPost.create({
      data: {
        wingId: scienceClub.id,
        authorMemberId: member2.id,
        title: 'Robotics & AI Hands-on Workshop for Youth',
        body: 'Building simple Arduino robots and discovering generative AI concepts. Bring your laptops; kits provided.',
        eventDate: new Date('2026-11-14T10:00:00.000Z'),
      },
    });
  }

  // Science Club Post 2
  const existingPost4 = await prisma.wingPost.findFirst({
    where: {
      wingId: scienceClub.id,
      title: 'Renewable Energy Innovations in Kuwait',
      deletedAt: null,
    },
  });
  if (!existingPost4) {
    await prisma.wingPost.create({
      data: {
        wingId: scienceClub.id,
        authorMemberId: member2.id,
        title: 'Renewable Energy Innovations in Kuwait',
        body: 'A showcase of solar and wind generation pilots by Kuwaiti engineers, featuring student models and interactive demonstrations.',
        eventDate: null,
      },
    });
  }
  console.log('Seeded sample posts for Ladies Wing and Science Club');

  // 5. Seed Notifications: WING_POST for linked members replacing mock seed
  const linkedMembers = await prisma.member.findMany({
    where: {
      authIdentities: { some: {} },
    },
  });

  for (const lm of linkedMembers) {
    // Ladies Wing notification
    const existingNotif1 = await prisma.notification.findFirst({
      where: {
        memberId: lm.id,
        type: NotificationType.WING_POST,
        title: 'Ladies Wing posted an activity',
      },
    });
    if (!existingNotif1) {
      await prisma.notification.create({
        data: {
          memberId: lm.id,
          type: NotificationType.WING_POST,
          title: 'Ladies Wing posted an activity',
          body: "'Let's Act' Acting Workshop",
          createdAt: new Date(Date.now() - 3600 * 1000),
        },
      });
    }

    // Science Club notification
    const existingNotif2 = await prisma.notification.findFirst({
      where: {
        memberId: lm.id,
        type: NotificationType.WING_POST,
        title: 'Science Club posted an activity',
      },
    });
    if (!existingNotif2) {
      await prisma.notification.create({
        data: {
          memberId: lm.id,
          type: NotificationType.WING_POST,
          title: 'Science Club posted an activity',
          body: 'Robotics & AI Hands-on Workshop for Youth',
          createdAt: new Date(Date.now() - 1800 * 1000),
        },
      });
    }
  }
  console.log(`Seeded WING_POST notifications for ${linkedMembers.length} linked members`);

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });