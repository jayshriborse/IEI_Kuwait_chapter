/**
 * DEV DATA - Authentication and Member Record Matching
 */

export interface MatchedMember {
  memberId: string;
  name: string;
  grade: string;
  branch: string;
  memberSince: number;
}

const DEV_MEMBERS: Record<string, { memberId: string; name: string; grade: string; branch: string; memberSince: number; mobile: string }> = {
  IEI0005: {
    memberId: 'IEI0005',
    name: 'Eng. Karthikeyan Manickam',
    grade: 'MIE',
    branch: 'Civil',
    memberSince: 2011,
    mobile: '99840191',
  },
  IEI0010: {
    memberId: 'IEI0010',
    name: 'Engr. Anu Kurian',
    grade: 'MIE',
    branch: 'Electrical',
    memberSince: 2015,
    mobile: '00000010',
  },
  IEI0042: {
    memberId: 'IEI0042',
    name: 'Engr. Upendra Kumar Behura',
    grade: 'FIE',
    branch: 'Electrical',
    memberSince: 2008,
    mobile: '98765432',
  },
  IEI9001: {
    memberId: 'IEI9001',
    name: 'Engr. Sudhir Shyam Menghani',
    grade: 'MIE',
    branch: 'Electrical',
    memberSince: 2012,
    mobile: '00000001',
  },
  IEI9002: {
    memberId: 'IEI9002',
    name: 'General Secretary (DEV)',
    grade: 'MIE',
    branch: 'Administration',
    memberSince: 2026,
    mobile: '00000002',
  },
  IEI9003: {
    memberId: 'IEI9003',
    name: 'Chairman (DEV)',
    grade: 'FIE',
    branch: 'Executive Administration',
    memberSince: 2026,
    mobile: '00000003',
  },
  IEI9004: {
    memberId: 'IEI9004',
    name: 'EC Volunteer (DEV)',
    grade: 'AMIE',
    branch: 'Event Operations',
    memberSince: 2026,
    mobile: '00000004',
  },
  IEI9201: {
    memberId: 'IEI9201',
    name: 'Demo Member Alpha',
    grade: 'MIE',
    branch: 'General Engineering',
    memberSince: 2026,
    mobile: '00009201',
  },
  IEI9202: {
    memberId: 'IEI9202',
    name: 'Demo Member Beta',
    grade: 'MIE',
    branch: 'General Engineering',
    memberSince: 2026,
    mobile: '00009202',
  },
  IEI0015: {
    memberId: 'IEI0015',
    name: 'Eng. Rajesh Sharma',
    grade: 'MIE',
    branch: 'Mechanical',
    memberSince: 2016,
    mobile: '99112233',
  },
  IEI0022: {
    memberId: 'IEI0022',
    name: 'Eng. Priya Sundaram',
    grade: 'MIE',
    branch: 'Electronics & Comm',
    memberSince: 2018,
    mobile: '99223344',
  },
  IEI0034: {
    memberId: 'IEI0034',
    name: 'Engr. Subbiah Somasundaram',
    grade: 'FIE',
    branch: 'Civil',
    memberSince: 2005,
    mobile: '99334455',
  },
  IEI9100: {
    memberId: 'IEI9100',
    name: 'Demo Member Three',
    grade: 'AMIE',
    branch: 'Mechanical',
    memberSince: 2020,
    mobile: '00000100',
  },
};

/**
 * Matches member record by Member ID and registered mobile number
 * @param id Member ID (e.g. IEI0005, IEI0010, IEI0042)
 * @param mobile Registered mobile number (e.g. 99840191, 99123456, 98765432)
 */
export function matchMember(id: string, mobile: string): MatchedMember | null {
  const cleanId = (id || '').trim().toUpperCase();
  const cleanMobile = (mobile || '').trim().replace(/\D/g, '');

  const member = DEV_MEMBERS[cleanId];
  if (member && member.mobile.replace(/\D/g, '') === cleanMobile) {
    return {
      memberId: member.memberId,
      name: member.name,
      grade: member.grade,
      branch: member.branch,
      memberSince: member.memberSince,
    };
  }

  return null;
}
