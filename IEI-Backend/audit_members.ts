import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/prisma/client';
const xlsx = require('C:/Users/DELL/.gemini/antigravity-ide/brain/a1ef1478-9573-4611-ac0c-82a3befb0304/scratch/node_modules/xlsx');

const EXCEL_PATH = 'd:/IEI-Kuwait-Engineering/IEI-Docs/Master-Members-Permissions-Table.xlsx';
const CSV_REPORT_PATH = 'd:/IEI-Kuwait-Engineering/IEI-Docs/Reconciliation-Audit-Report.csv';

// Normalization function
function normalizeMemberCode(code: any): string {
  return String(code || '').trim().toUpperCase();
}

function normalizeMobile(mobile: any): string {
  let digits = String(mobile || '').trim().replace(/\D/g, '');
  // If Kuwait country code 965 is prefixed to an 8-digit number (total 11 digits), strip 965
  if (digits.length === 11 && digits.startsWith('965')) {
    digits = digits.slice(3);
  }
  // If length < 8 and starts with zeros (like '1', '2' in numerical excel parse), pad start to 8 digits
  if (digits.length > 0 && digits.length < 8 && String(mobile).includes('0')) {
    digits = digits.padStart(8, '0');
  }
  return digits;
}

async function runAudit() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Read Excel
    const wb = xlsx.readFile(EXCEL_PATH);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const excelRows: any[] = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    console.log(`Loaded ${excelRows.length} rows from Excel Sheet "${sheetName}"`);

    // 2. Read DB
    const dbMembers = await prisma.member.findMany({
      include: {
        officeBearerAssignments: true,
        subscriptions: {
          include: { period: true }
        }
      }
    });

    console.log(`Loaded ${dbMembers.length} members from Database`);

    // Build DB Lookup Map by normalized Member Code
    const dbMapByCode = new Map<string, typeof dbMembers[0]>();
    const dbMapByMobile = new Map<string, typeof dbMembers[0]>();

    for (const m of dbMembers) {
      const normCode = normalizeMemberCode(m.memberCode);
      const normMob = normalizeMobile(m.mobile);
      dbMapByCode.set(normCode, m);
      dbMapByMobile.set(normMob, m);
    }

    const reportRows: Array<{
      category: 'MATCHED' | 'MISSING' | 'ROLE/PERMISSION MISMATCH' | 'IN DATABASE BUT NOT IN EXCEL' | 'DATA CONFLICTS';
      memberId: string;
      memberName: string;
      mobileExcel: string;
      mobileDb: string;
      excelPosition: string;
      dbPosition: string;
      excelRoleAuthority: string;
      dbRoleAuthority: string;
      details: string;
    }> = [];

    const excelSeenCodes = new Set<string>();
    const excelSeenMobiles = new Set<string>();

    // 3. Audit each Excel row
    for (const row of excelRows) {
      const rawCode = row['Member ID'];
      const rawName = row['Member Name'];
      const rawMobile = row['Mobile Number'];
      const postPosition = row['Post / Office Position'];
      const roleAuthority = row['Role & Authority in App (Permissions)'];

      const normCode = normalizeMemberCode(rawCode);
      const normMobile = normalizeMobile(rawMobile);

      // Check for Excel duplicates
      if (excelSeenCodes.has(normCode)) {
        reportRows.push({
          category: 'DATA CONFLICTS',
          memberId: normCode,
          memberName: rawName,
          mobileExcel: normMobile,
          mobileDb: '',
          excelPosition: postPosition,
          dbPosition: '',
          excelRoleAuthority: roleAuthority,
          dbRoleAuthority: '',
          details: `Duplicate Member ID in Excel: ${normCode}`
        });
      }
      excelSeenCodes.add(normCode);

      if (excelSeenMobiles.has(normMobile)) {
        reportRows.push({
          category: 'DATA CONFLICTS',
          memberId: normCode,
          memberName: rawName,
          mobileExcel: normMobile,
          mobileDb: '',
          excelPosition: postPosition,
          dbPosition: '',
          excelRoleAuthority: roleAuthority,
          dbRoleAuthority: '',
          details: `Duplicate Mobile number in Excel: ${normMobile}`
        });
      }
      excelSeenMobiles.add(normMobile);

      const dbMem = dbMapByCode.get(normCode);

      if (!dbMem) {
        reportRows.push({
          category: 'MISSING',
          memberId: normCode,
          memberName: rawName,
          mobileExcel: normMobile,
          mobileDb: 'NOT IN DB',
          excelPosition: postPosition,
          dbPosition: 'NONE',
          excelRoleAuthority: roleAuthority,
          dbRoleAuthority: 'NONE',
          details: `Record present in Excel (${rawName}) but missing from database`
        });
        continue;
      }

      // Check mobile match
      const dbNormMobile = normalizeMobile(dbMem.mobile);
      if (normMobile !== dbNormMobile) {
        reportRows.push({
          category: 'DATA CONFLICTS',
          memberId: normCode,
          memberName: rawName,
          mobileExcel: normMobile,
          mobileDb: dbNormMobile,
          excelPosition: postPosition,
          dbPosition: dbMem.officeBearerAssignments.map(o => o.position).join(', ') || 'NONE',
          excelRoleAuthority: roleAuthority,
          dbRoleAuthority: dbMem.officeBearerAssignments.map(o => o.position).join(', ') || 'MEMBER',
          details: `Mobile number mismatch for ${normCode}: Excel has ${normMobile}, DB has ${dbNormMobile}`
        });
        continue;
      }

      // Check Roles / Permissions
      const activePositions = dbMem.officeBearerAssignments.filter(o => o.active).map(o => o.position);
      const dbPositionsStr = activePositions.join(', ') || 'NONE (Standard Member)';

      // Determine expected DB position based on Excel
      let expectedPosition = 'NONE';
      if (postPosition.includes('Treasurer')) {
        expectedPosition = 'TREASURER';
      } else if (postPosition.includes('General Secretary')) {
        expectedPosition = 'GENERAL_SECRETARY';
      } else if (postPosition.includes('Chairman')) {
        expectedPosition = 'CHAIRMAN';
      } else if (postPosition.includes('Volunteer')) {
        expectedPosition = 'EC_VOLUNTEER';
      } else if (postPosition.includes('Executive Committee Officer') || postPosition.includes('EC Officer')) {
        expectedPosition = 'EC_OFFICER / EC_VOLUNTEER';
      }

      const hasMismatch = (expectedPosition !== 'NONE' && !activePositions.includes(expectedPosition as any)) ||
                          (expectedPosition === 'NONE' && activePositions.length > 0);

      if (hasMismatch) {
        reportRows.push({
          category: 'ROLE/PERMISSION MISMATCH',
          memberId: normCode,
          memberName: rawName,
          mobileExcel: normMobile,
          mobileDb: dbNormMobile,
          excelPosition: postPosition,
          dbPosition: dbPositionsStr,
          excelRoleAuthority: roleAuthority,
          dbRoleAuthority: activePositions.length > 0 ? activePositions.join(', ') : 'Standard Member',
          details: `Role mismatch: Expected ${expectedPosition}, but DB has ${dbPositionsStr}`
        });
      } else {
        reportRows.push({
          category: 'MATCHED',
          memberId: normCode,
          memberName: rawName,
          mobileExcel: normMobile,
          mobileDb: dbNormMobile,
          excelPosition: postPosition,
          dbPosition: dbPositionsStr,
          excelRoleAuthority: roleAuthority,
          dbRoleAuthority: activePositions.length > 0 ? activePositions.join(', ') : 'Standard Member',
          details: `Member verified and active roles match`
        });
      }
    }

    // 4. Check for IN DATABASE BUT NOT IN EXCEL
    for (const dbMem of dbMembers) {
      const normCode = normalizeMemberCode(dbMem.memberCode);
      if (!excelSeenCodes.has(normCode)) {
        reportRows.push({
          category: 'IN DATABASE BUT NOT IN EXCEL',
          memberId: normCode,
          memberName: dbMem.fullName,
          mobileExcel: 'NOT IN EXCEL',
          mobileDb: normalizeMobile(dbMem.mobile),
          excelPosition: 'NOT IN EXCEL',
          dbPosition: dbMem.officeBearerAssignments.map(o => o.position).join(', ') || 'NONE',
          excelRoleAuthority: 'NOT IN EXCEL',
          dbRoleAuthority: dbMem.officeBearerAssignments.map(o => o.position).join(', ') || 'Standard Member',
          details: `Member exists in database but is not listed in Master Excel spreadsheet`
        });
      }
    }

    // 5. Generate CSV output
    const csvHeaders = [
      'Category',
      'Member ID',
      'Member Name',
      'Mobile (Excel)',
      'Mobile (DB)',
      'Position (Excel)',
      'Position (DB)',
      'Role & Authority (Excel)',
      'Role & Authority (DB)',
      'Audit Details'
    ];

    const csvLines = [
      csvHeaders.join(','),
      ...reportRows.map(r => [
        `"${r.category}"`,
        `"${r.memberId}"`,
        `"${r.memberName}"`,
        `"${r.mobileExcel}"`,
        `"${r.mobileDb}"`,
        `"${r.excelPosition}"`,
        `"${r.dbPosition}"`,
        `"${(r.excelRoleAuthority || '').replace(/"/g, '""')}"`,
        `"${(r.dbRoleAuthority || '').replace(/"/g, '""')}"`,
        `"${(r.details || '').replace(/"/g, '""')}"`
      ].join(','))
    ];

    fs.writeFileSync(CSV_REPORT_PATH, csvLines.join('\n'), 'utf8');
    console.log(`\nAudit Report successfully saved to: ${CSV_REPORT_PATH}`);
    console.log(`Total Audit Rows: ${reportRows.length}`);

    // Summary count
    const summary = reportRows.reduce((acc: any, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});
    console.log('\n--- AUDIT SUMMARY BY CATEGORY ---');
    console.log(summary);

  } catch (err) {
    console.error('Audit execution error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runAudit();
