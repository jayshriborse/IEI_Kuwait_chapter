import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '@/utils/api';

export interface MemberRecord {
  id: string;
  memberCode: string;
  ieiIndiaNo: string;
  fullName: string;
  firstName: string;
  mobile: string;
  altMobiles?: string[];
  email: string;
  grade: 'FIE' | 'MIE' | 'AMIE' | 'TIE' | 'SMIE';
  discipline: string;
  bloodGroup: string;
  memberSinceYear: number;
  location: string;
  duesStatus: string;
  duesDetail: string;
  photoUri?: string | null;
  role: 'MEMBER' | 'EC_OFFICER' | 'ADMIN' | 'VOLUNTEER';

  // Optional profile fields (Round 1)
  company?: string | null;
  designation?: string | null;
  governorate?: string | null;
  sector?: string | null;
  areaLocality?: string | null;
  familyStatus?: string | null;
  familyMembersCount?: number | null;
}

export const CANONICAL_MEMBERS: MemberRecord[] = [
  {
    id: '1',
    memberCode: 'IEI0005',
    ieiIndiaNo: 'M-1483721',
    fullName: 'Eng. Karthikeyan Manickam',
    firstName: 'Karthikeyan',
    mobile: '99840191',
    email: 'karthi4civil@gmail.com',
    grade: 'MIE',
    discipline: 'Civil',
    bloodGroup: 'O+',
    memberSinceYear: 2011,
    location: 'Salmiya · Hawalli',
    duesStatus: 'Subscription due',
    duesDetail: 'KD 20 · paid up to 31 Mar 2026',
    photoUri: null,
    role: 'MEMBER',
    company: 'KEO International Consultants',
    designation: 'Senior Civil Engineer',
    governorate: 'Hawalli',
    sector: 'Construction',
    areaLocality: 'Salmiya',
    familyStatus: 'Family here',
    familyMembersCount: 3,
  },
  {
    id: '2',
    memberCode: 'IEI0010',
    ieiIndiaNo: 'M-DEV-0010',
    fullName: 'Engr. Anu Kurian',
    firstName: 'Anu',
    mobile: '00000010',
    altMobiles: ['99123456'],
    email: 'anu.kurian@iei-kuwait.org',
    grade: 'MIE',
    discipline: 'Electrical',
    bloodGroup: 'A+',
    memberSinceYear: 2015,
    location: 'Abbassiya · Farwaniya',
    duesStatus: 'Active',
    duesDetail: 'Subscription active up to 31 Mar 2027',
    photoUri: null,
    role: 'MEMBER',
    company: 'Kuwait Oil Company (KOC)',
    designation: 'Senior Electrical Engineer',
    governorate: 'Farwaniya',
    sector: 'Oil & Gas',
    areaLocality: 'Abbassiya',
    familyStatus: 'Family here',
    familyMembersCount: 3,
  },
  {
    id: '3',
    memberCode: 'IEI9100',
    ieiIndiaNo: 'M-DEV-9100',
    fullName: 'Demo Member Three',
    firstName: 'Demo',
    mobile: '00000100',
    email: 'demo.member@iei-kuwait.org',
    grade: 'AMIE',
    discipline: 'Mechanical',
    bloodGroup: 'B+',
    memberSinceYear: 2020,
    location: 'Kuwait City',
    duesStatus: 'Active',
    duesDetail: 'Subscription active up to 31 Mar 2027',
    photoUri: null,
    role: 'MEMBER',
    company: 'Gulf Spic General Trading & Contracting',
    designation: 'Project Engineer',
    governorate: 'Capital (Al Asimah)',
    sector: 'Construction',
    areaLocality: 'Kuwait City',
    familyStatus: 'Bachelor status',
    familyMembersCount: 1,
  },
  {
    id: '4',
    memberCode: 'IEI0042',
    ieiIndiaNo: 'F-1204856',
    fullName: 'Engr. Upendra Kumar Behura',
    firstName: 'Upendra',
    mobile: '98765432',
    email: 'upendra.behura@iei-kuwait.org',
    grade: 'FIE',
    discipline: 'Electrical',
    bloodGroup: 'O+',
    memberSinceYear: 2008,
    location: 'Fahaheel · Ahmadi',
    duesStatus: 'Active',
    duesDetail: 'Life Member · Up to date',
    photoUri: null,
    role: 'EC_OFFICER',
    company: 'Equate Petrochemical',
    designation: 'Principal Electrical Engineer',
    governorate: 'Ahmadi',
    sector: 'Oil & Gas',
    areaLocality: 'Fahaheel',
    familyStatus: 'Family here',
    familyMembersCount: 4,
  },
  {
    id: '5',
    memberCode: 'IEI9001',
    ieiIndiaNo: 'M-DEV-9001',
    fullName: 'Engr. Sudhir Shyam Menghani',
    firstName: 'Sudhir',
    mobile: '00000001',
    email: 'sudhir.menghani@iei-kuwait.org',
    grade: 'MIE',
    discipline: 'Electrical',
    bloodGroup: 'B+',
    memberSinceYear: 2012,
    location: 'Kuwait City',
    duesStatus: 'Active',
    duesDetail: 'Treasurer · 2026–27',
    photoUri: null,
    role: 'EC_OFFICER',
    company: 'Alghanim Industries',
    designation: 'Chief Electrical Engineer',
    governorate: 'Capital (Al Asimah)',
    sector: 'Power & Water',
    areaLocality: 'Kuwait City',
    familyStatus: 'Family here',
    familyMembersCount: 4,
  },
  {
    id: '6',
    memberCode: 'IEI0015',
    ieiIndiaNo: 'M-DEV-0015',
    fullName: 'Eng. Rajesh Sharma',
    firstName: 'Rajesh',
    mobile: '99112233',
    email: 'rajesh.sharma@iei-kuwait.org',
    grade: 'MIE',
    discipline: 'Mechanical',
    bloodGroup: 'B+',
    memberSinceYear: 2016,
    location: 'Salmiya · Hawalli',
    duesStatus: 'Active',
    duesDetail: 'Member · Up to date',
    photoUri: null,
    role: 'MEMBER',
    company: 'Combined Group Contracting',
    designation: 'Lead Mechanical Engineer',
    governorate: 'Hawalli',
    sector: 'Construction',
    areaLocality: 'Salmiya',
    familyStatus: 'Family here',
    familyMembersCount: 2,
  },
  {
    id: '7',
    memberCode: 'IEI0022',
    ieiIndiaNo: 'M-DEV-0022',
    fullName: 'Eng. Priya Sundaram',
    firstName: 'Priya',
    mobile: '99223344',
    email: 'priya.sundaram@iei-kuwait.org',
    grade: 'MIE',
    discipline: 'Electronics & Comm',
    bloodGroup: 'O+',
    memberSinceYear: 2018,
    location: 'Salmiya · Hawalli',
    duesStatus: 'Active',
    duesDetail: 'Member · Up to date',
    photoUri: null,
    role: 'MEMBER',
    company: 'Zain Telecom',
    designation: 'Telecom Infrastructure Specialist',
    governorate: 'Hawalli',
    sector: 'IT & Telecom',
    areaLocality: 'Salmiya',
    familyStatus: 'Family here',
    familyMembersCount: 3,
  },
  {
    id: '8',
    memberCode: 'IEI0034',
    ieiIndiaNo: 'F-DEV-0034',
    fullName: 'Engr. Subbiah Somasundaram',
    firstName: 'Subbiah',
    mobile: '99334455',
    email: 'subbiah.somasundaram@iei-kuwait.org',
    grade: 'FIE',
    discipline: 'Civil',
    bloodGroup: 'AB+',
    memberSinceYear: 2005,
    location: 'Salmiya · Hawalli',
    duesStatus: 'Active',
    duesDetail: 'Life Member · Up to date',
    photoUri: null,
    role: 'MEMBER',
    company: 'Ministry of Public Works',
    designation: 'Consultant Civil Engineer',
    governorate: 'Capital (Al Asimah)',
    sector: 'Public Works',
    areaLocality: 'Kuwait City',
    familyStatus: 'Family here',
    familyMembersCount: 2,
  },
  {
    id: '9',
    memberCode: 'IEI9202',
    ieiIndiaNo: 'M-DEV-9202',
    fullName: 'Demo Member Beta',
    firstName: 'Beta',
    mobile: '00009202',
    email: 'beta.demo@iei-kuwait.org',
    grade: 'MIE',
    discipline: 'General Engineering',
    bloodGroup: 'B+',
    memberSinceYear: 2026,
    location: 'Kuwait City',
    duesStatus: 'With the treasurer',
    duesDetail: 'Subscription renewal with Treasurer (Awaiting confirmation)',
    photoUri: null,
    role: 'MEMBER',
    company: 'Engineering Consultancy',
    designation: 'Engineer',
    governorate: 'Capital (Al Asimah)',
    sector: 'Consulting',
    areaLocality: 'Kuwait City',
    familyStatus: 'Family here',
    familyMembersCount: 2,
  },
  {
    id: '10',
    memberCode: 'IEI9201',
    ieiIndiaNo: 'M-DEV-9201',
    fullName: 'Demo Member Alpha',
    firstName: 'Alpha',
    mobile: '00009201',
    email: 'alpha.demo@iei-kuwait.org',
    grade: 'MIE',
    discipline: 'General Engineering',
    bloodGroup: 'O+',
    memberSinceYear: 2026,
    location: 'Salmiya · Hawalli',
    duesStatus: 'Subscription due',
    duesDetail: 'KD 20 · 2026–27 Annual Dues Due',
    photoUri: null,
    role: 'MEMBER',
    company: 'Engineering Contracting',
    designation: 'Project Engineer',
    governorate: 'Hawalli',
    sector: 'Construction',
    areaLocality: 'Salmiya',
    familyStatus: 'Bachelor status',
    familyMembersCount: 1,
  },
  {
    id: '11',
    memberCode: 'IEI9002',
    ieiIndiaNo: 'M-DEV-9002',
    fullName: 'General Secretary (DEV)',
    firstName: 'Secretary',
    mobile: '00000002',
    email: 'secretary.dev@iei-kuwait.org',
    grade: 'MIE',
    discipline: 'Administration',
    bloodGroup: 'B+',
    memberSinceYear: 2026,
    location: 'Kuwait City',
    duesStatus: 'Active',
    duesDetail: 'General Secretary · 2026–27',
    photoUri: null,
    role: 'EC_OFFICER',
    company: 'IEI Kuwait Chapter',
    designation: 'General Secretary',
    governorate: 'Capital (Al Asimah)',
    sector: 'Executive Office',
    areaLocality: 'Kuwait City',
    familyStatus: 'Family here',
    familyMembersCount: 3,
  },
  {
    id: '12',
    memberCode: 'IEI9003',
    ieiIndiaNo: 'F-DEV-9003',
    fullName: 'Chairman (DEV)',
    firstName: 'Chairman',
    mobile: '00000003',
    email: 'chairman.dev@iei-kuwait.org',
    grade: 'FIE',
    discipline: 'Executive Administration',
    bloodGroup: 'O+',
    memberSinceYear: 2026,
    location: 'Kuwait City',
    duesStatus: 'Active',
    duesDetail: 'Chapter Chairman · 2026–27',
    photoUri: null,
    role: 'EC_OFFICER',
    company: 'IEI Kuwait Chapter',
    designation: 'Chapter Chairman',
    governorate: 'Capital (Al Asimah)',
    sector: 'Executive Office',
    areaLocality: 'Kuwait City',
    familyStatus: 'Family here',
    familyMembersCount: 4,
  },
  {
    id: '13',
    memberCode: 'IEI9004',
    ieiIndiaNo: 'A-DEV-9004',
    fullName: 'EC Volunteer (DEV)',
    firstName: 'Volunteer',
    mobile: '00000004',
    email: 'volunteer.dev@iei-kuwait.org',
    grade: 'AMIE',
    discipline: 'Event Operations',
    bloodGroup: 'A+',
    memberSinceYear: 2026,
    location: 'Kuwait City',
    duesStatus: 'Active',
    duesDetail: 'EC Volunteer / Desk Officer · 2026–27',
    photoUri: null,
    role: 'VOLUNTEER',
    company: 'IEI Kuwait Chapter',
    designation: 'EC Volunteer',
    governorate: 'Capital (Al Asimah)',
    sector: 'Operations',
    areaLocality: 'Kuwait City',
    familyStatus: 'Bachelor status',
    familyMembersCount: 1,
  },
];

export interface AuthUser {
  id: string;
  email?: string;
  provider: 'GOOGLE' | 'APPLE';
  isLinked: boolean;
  name?: string;
  picture?: string;
}

export type AuthLevel = 'GUEST' | 'SIGNED_IN_UNLINKED' | 'MEMBER' | 'EC';

const PROFILES_STORAGE_KEY = '@iei_member_profiles_v1';
const PHOTOS_STORAGE_KEY = '@iei_member_photos_v1';
const AUTH_TOKEN_KEY = '@iei_auth_token_v1';
const AUTH_USER_KEY = '@iei_auth_user_v1';
const GUEST_SESSION_KEY = '@iei_guest_session_v1';

// Persistent state storage for member session, profile fields, and photos
const memberPhotosMap: Record<string, string> = {};
const memberProfilesMap: Record<string, Partial<MemberRecord>> = {};
let currentVerifiedMember: MemberRecord | null = null;
let currentAuthToken: string | null = null;
let currentAuthUser: AuthUser | null = null;
let isGuestActive = false;
let isStoreInitialized = false;

const sessionListeners = new Set<() => void>();

function notifySessionListeners() {
  sessionListeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.warn('Session listener error:', e);
    }
  });
}

export function subscribeMemberSession(listener: () => void): () => void {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

export async function initMemberSessionStore(): Promise<void> {
  if (isStoreInitialized) return;
  try {
    const [profilesJson, photosJson, authToken, authUserJson, guestFlag] = await Promise.all([
      AsyncStorage.getItem(PROFILES_STORAGE_KEY),
      AsyncStorage.getItem(PHOTOS_STORAGE_KEY),
      AsyncStorage.getItem(AUTH_TOKEN_KEY),
      AsyncStorage.getItem(AUTH_USER_KEY),
      AsyncStorage.getItem(GUEST_SESSION_KEY),
    ]);

    if (profilesJson) {
      const parsed = JSON.parse(profilesJson);
      Object.assign(memberProfilesMap, parsed);
    }

    if (photosJson) {
      const parsed = JSON.parse(photosJson);
      Object.assign(memberPhotosMap, parsed);
    }

    if (authToken) {
      currentAuthToken = authToken;
    }

    if (guestFlag === 'true') {
      isGuestActive = true;
    }

    if (authUserJson) {
      try {
        currentAuthUser = JSON.parse(authUserJson);
      } catch {}
    }
  } catch (err) {
    console.warn('Error reading member session store:', err);
  } finally {
    isStoreInitialized = true;
    notifySessionListeners();
  }
}

export function isGuestSession(): boolean {
  return isGuestActive && !currentVerifiedMember;
}

export async function setGuestSession(active: boolean): Promise<void> {
  isGuestActive = active;
  if (active) {
    currentVerifiedMember = null;
    await AsyncStorage.setItem(GUEST_SESSION_KEY, 'true').catch(() => {});
  } else {
    await AsyncStorage.removeItem(GUEST_SESSION_KEY).catch(() => {});
  }
  notifySessionListeners();
}

export function getAuthLevel(): AuthLevel {
  if (currentVerifiedMember) {
    if (
      currentVerifiedMember.role === 'EC_OFFICER' ||
      currentVerifiedMember.role === 'ADMIN' ||
      currentVerifiedMember.role === 'VOLUNTEER'
    ) {
      return 'EC';
    }
    return 'MEMBER';
  }
  if (currentAuthUser && !currentAuthUser.isLinked) {
    return 'SIGNED_IN_UNLINKED';
  }
  return 'GUEST';
}

export function getAuthToken(): string | null {
  return currentAuthToken;
}

export function getAuthUser(): AuthUser | null {
  return currentAuthUser;
}

export function getMemberByCode(memberCode: string): MemberRecord | null {
  const code = (memberCode || '').toUpperCase();
  const canonical = CANONICAL_MEMBERS.find((m) => m.memberCode.toUpperCase() === code);
  if (!canonical) return null;

  const storedPhoto = memberPhotosMap[code];
  const storedProfile = memberProfilesMap[code] || {};

  return {
    ...canonical,
    ...storedProfile,
    photoUri: storedPhoto || canonical.photoUri || null,
  };
}

export function getVerifiedMember(): MemberRecord | null {
  if (!currentVerifiedMember) {
    return null;
  }

  const code = currentVerifiedMember.memberCode.toUpperCase();
  const storedPhoto = memberPhotosMap[code];
  const storedProfile = memberProfilesMap[code] || {};

  return {
    ...currentVerifiedMember,
    ...storedProfile,
    photoUri: storedPhoto || currentVerifiedMember.photoUri || null,
  };
}

export function matchesMobile(inputMobile: string, targetMobile: string): boolean {
  const a = (inputMobile || '').replace(/\D/g, '');
  const b = (targetMobile || '').replace(/\D/g, '');
  if (!a || !b) return false;
  if (a === b) return true;
  // Strip Kuwait country codes if present (e.g. 00965, 965)
  const stripA = a.replace(/^(?:00965|965)/, '');
  const stripB = b.replace(/^(?:00965|965)/, '');
  if (stripA && stripB && stripA === stripB) return true;
  // Match suffix (e.g. last 8 digits)
  if (a.length >= 8 && b.length >= 8 && a.slice(-8) === b.slice(-8)) return true;
  return false;
}

export function setVerifiedMemberRecord(member: MemberRecord): void {
  const code = member.memberCode.toUpperCase();
  const existingIdx = CANONICAL_MEMBERS.findIndex((m) => m.memberCode.toUpperCase() === code);
  if (existingIdx >= 0) {
    CANONICAL_MEMBERS[existingIdx] = { ...CANONICAL_MEMBERS[existingIdx], ...member };
  } else {
    CANONICAL_MEMBERS.push(member);
  }
  currentVerifiedMember = member;
  notifySessionListeners();
}

export function verifyMemberCredentials(
  memberId: string,
  mobileNumber: string
): { success: boolean; member?: MemberRecord; error?: string } {
  const cleanId = (memberId || '').trim().toUpperCase();
  const cleanMobile = (mobileNumber || '').trim().replace(/\D/g, '');

  if (!cleanId || !cleanMobile) {
    return {
      success: false,
      error: 'Please enter both Member ID and Mobile Number.',
    };
  }

  const matched = CANONICAL_MEMBERS.find((m) => {
    const mCode = m.memberCode.toUpperCase();
    const primaryMatch = matchesMobile(cleanMobile, m.mobile);
    const altMatch = m.altMobiles?.some((alt) => matchesMobile(cleanMobile, alt));
    return mCode === cleanId && (primaryMatch || altMatch);
  });

  if (!matched) {
    return {
      success: false,
      error: 'Member ID and mobile number do not match. Please check your credentials and try again.',
    };
  }

  const code = matched.memberCode.toUpperCase();
  const storedPhoto = memberPhotosMap[code];
  const storedProfile = memberProfilesMap[code] || {};

  currentVerifiedMember = {
    ...matched,
    ...storedProfile,
    photoUri: storedPhoto || matched.photoUri || null,
  };

  notifySessionListeners();

  return {
    success: true,
    member: currentVerifiedMember,
  };
}

export async function updateMemberProfileField(
  memberCode: string,
  field: keyof MemberRecord,
  value: any
): Promise<MemberRecord | null> {
  const code = memberCode.toUpperCase();
  if (!memberProfilesMap[code]) {
    memberProfilesMap[code] = {};
  }

  memberProfilesMap[code][field] = value;

  if (currentVerifiedMember && currentVerifiedMember.memberCode.toUpperCase() === code) {
    currentVerifiedMember = {
      ...currentVerifiedMember,
      [field]: value,
    };
  }

  // Persist to AsyncStorage
  try {
    await AsyncStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(memberProfilesMap));
  } catch (err) {
    console.warn('Error saving profile map:', err);
  }

  notifySessionListeners();

  // Asynchronously sync with backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    await fetch(`${getApiBaseUrl()}/members/${code}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (backendErr) {
    // If backend fails/offline, local persistent change is preserved
  }

  return getMemberByCode(code);
}

export function updateMemberPhoto(memberCode: string, photoUri: string): MemberRecord | null {
  const code = memberCode.toUpperCase();
  memberPhotosMap[code] = photoUri;
  if (currentVerifiedMember && currentVerifiedMember.memberCode.toUpperCase() === code) {
    currentVerifiedMember = {
      ...currentVerifiedMember,
      photoUri,
    };
  }

  AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(memberPhotosMap)).catch(() => {});
  notifySessionListeners();
  return getMemberByCode(code);
}

export function logoutMemberSession(): void {
  currentVerifiedMember = null;
  currentAuthToken = null;
  currentAuthUser = null;
  isGuestActive = false;
  AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY, GUEST_SESSION_KEY]).catch(() => {});
  notifySessionListeners();
}

/**
 * Sends verified Google ID Token to backend to establish session and link member
 */
export async function authenticateWithGoogle(idToken: string): Promise<{
  success: boolean;
  isLinked: boolean;
  user?: AuthUser;
  member?: MemberRecord;
  error?: string;
}> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        isLinked: false,
        error: errData.message || 'Google authentication failed',
      };
    }

    const data = await res.json();
    currentAuthToken = data.accessToken;
    currentAuthUser = {
      id: data.authIdentityId,
      email: data.email,
      provider: 'GOOGLE',
      isLinked: Boolean(data.isLinked),
      name: data.user?.name,
      picture: data.user?.picture,
    };

    await Promise.all([
      AsyncStorage.setItem(AUTH_TOKEN_KEY, data.accessToken),
      AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentAuthUser)),
    ]);

    if (data.isLinked && data.member) {
      const member = getMemberByCode(data.member.memberCode) || {
        id: data.member.id,
        memberCode: data.member.memberCode,
        ieiIndiaNo: `M-${data.member.memberCode}`,
        fullName: data.member.fullName,
        firstName: data.member.displayName,
        mobile: data.member.mobile,
        email: data.email || `${data.member.memberCode.toLowerCase()}@iei-kuwait.org`,
        grade: data.member.grade,
        discipline: data.member.discipline,
        bloodGroup: 'O+',
        memberSinceYear: data.member.memberSinceYear,
        location: 'Kuwait City',
        duesStatus: 'Active',
        duesDetail: 'Member record verified',
        photoUri: null,
        role: (data.member.positions && data.member.positions.length > 0) ? 'EC_OFFICER' : 'MEMBER',
      };
      setVerifiedMemberRecord(member);
    }

    notifySessionListeners();

    return {
      success: true,
      isLinked: Boolean(data.isLinked),
      user: currentAuthUser,
      member: currentVerifiedMember || undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      isLinked: false,
      error: err.message || 'Network error communicating with server',
    };
  }
}

/**
 * Sends verified Apple credentials to backend to establish session and link member
 */
export async function authenticateWithApple(params: {
  identityToken: string;
  user: string;
  email?: string;
  fullName?: string;
}): Promise<{
  success: boolean;
  isLinked: boolean;
  user?: AuthUser;
  member?: MemberRecord;
  error?: string;
}> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/apple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        isLinked: false,
        error: errData.message || 'Apple authentication failed',
      };
    }

    const data = await res.json();
    currentAuthToken = data.accessToken;
    currentAuthUser = {
      id: data.authIdentityId,
      email: data.email,
      provider: 'APPLE',
      isLinked: Boolean(data.isLinked),
      name: data.user?.name,
    };

    await Promise.all([
      AsyncStorage.setItem(AUTH_TOKEN_KEY, data.accessToken),
      AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentAuthUser)),
    ]);

    if (data.isLinked && data.member) {
      const member = getMemberByCode(data.member.memberCode) || {
        id: data.member.id,
        memberCode: data.member.memberCode,
        ieiIndiaNo: `M-${data.member.memberCode}`,
        fullName: data.member.fullName,
        firstName: data.member.displayName,
        mobile: data.member.mobile,
        email: data.email || `${data.member.memberCode.toLowerCase()}@iei-kuwait.org`,
        grade: data.member.grade,
        discipline: data.member.discipline,
        bloodGroup: 'O+',
        memberSinceYear: data.member.memberSinceYear,
        location: 'Kuwait City',
        duesStatus: 'Active',
        duesDetail: 'Member record verified',
        photoUri: null,
        role: (data.member.positions && data.member.positions.length > 0) ? 'EC_OFFICER' : 'MEMBER',
      };
      setVerifiedMemberRecord(member);
    }

    notifySessionListeners();

    return {
      success: true,
      isLinked: Boolean(data.isLinked),
      user: currentAuthUser,
      member: currentVerifiedMember || undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      isLinked: false,
      error: err.message || 'Network error communicating with server',
    };
  }
}

/**
 * Links verified member credentials to current AuthIdentity
 */
export async function linkMemberWithBackend(
  memberCode: string,
  mobile: string,
): Promise<{
  success: boolean;
  member?: MemberRecord;
  error?: string;
}> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (currentAuthToken) {
      headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/auth/link-member`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        memberCode,
        mobile,
        authIdentityId: currentAuthUser?.id,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || 'Verification failed' };
    }

    const data = await res.json();
    if (data.accessToken) {
      currentAuthToken = data.accessToken;
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
    }

    if (currentAuthUser) {
      currentAuthUser.isLinked = true;
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentAuthUser));
    }

    notifySessionListeners();
    return { success: true, member: currentVerifiedMember || undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to link account' };
  }
}

/**
 * Calculates profile completion percentage based on the 7 optional Round 1 fields.
 * Base profile = 58%.
 * Each added field increments completion towards 100%.
 */
export function calculateProfileProgress(member: MemberRecord | null): {
  percentage: number;
  addedCount: number;
  totalOptional: number;
} {
  if (!member) return { percentage: 58, addedCount: 0, totalOptional: 7 };

  const optionalFields: (keyof MemberRecord)[] = [
    'company',
    'designation',
    'governorate',
    'sector',
    'areaLocality',
    'familyStatus',
    'familyMembersCount',
  ];

  let addedCount = 0;
  optionalFields.forEach((field) => {
    const val = member[field];
    if (val !== null && val !== undefined && val !== '') {
      addedCount++;
    }
  });

  // Base 58% + 6% per added field up to 100%
  const percentage = Math.min(100, Math.round(58 + (addedCount / optionalFields.length) * 42));

  return {
    percentage,
    addedCount,
    totalOptional: optionalFields.length,
  };
}

const GUEST_RSVPS_KEY = '@iei_guest_rsvps';

/**
 * Fetches events list from backend with lifecycle status and user RSVP status
 */
export async function fetchPublicEvents(
  statusFilter?: 'upcoming' | 'completed' | 'all',
): Promise<{ success: boolean; data: any[]; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (currentAuthToken) {
      headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }

    const query = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : '';
    const res = await fetch(`${getApiBaseUrl()}/events${query}`, { headers });
    if (!res.ok) {
      return { success: false, data: [], error: `Failed to load events (${res.status})` };
    }
    const data = await res.json();
    let events: any[] = Array.isArray(data) ? data : [];

    // If guest session, merge locally stored guest RSVPs
    if (isGuestSession() || !currentAuthToken) {
      try {
        const stored = await AsyncStorage.getItem(GUEST_RSVPS_KEY);
        if (stored) {
          const guestRsvps = JSON.parse(stored);
          events = events.map((e) => {
            if (guestRsvps[e.id] || guestRsvps[String(e.id)]) {
              return { ...e, isRsvpd: true, userRsvp: guestRsvps[e.id] || guestRsvps[String(e.id)] };
            }
            return e;
          });
        }
      } catch {}
    }

    return { success: true, data: events };
  } catch (err: any) {
    return { success: false, data: [], error: err.message || 'Network error' };
  }
}

/**
 * Fetches a single event by ID with computed status and RSVP info
 */
export async function fetchPublicEventById(
  id: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (currentAuthToken) {
      headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }
    const res = await fetch(`${getApiBaseUrl()}/events/${id}`, { headers });
    if (!res.ok) {
      return { success: false, error: `Event not found (${res.status})` };
    }
    const data = await res.json();
    let event = data;
    if (isGuestSession() || !currentAuthToken) {
      try {
        const stored = await AsyncStorage.getItem(GUEST_RSVPS_KEY);
        if (stored) {
          const guestRsvps = JSON.parse(stored);
          if (guestRsvps[event.id] || guestRsvps[String(event.id)]) {
            event = {
              ...event,
              isRsvpd: true,
              userRsvp: guestRsvps[event.id] || guestRsvps[String(event.id)],
            };
          }
        }
      } catch {}
    }
    return { success: true, data: event };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Submits an RSVP to an event (Guest or Member).
 * Backend enforces whether the event is Open or restricted to members.
 */
export async function submitEventRsvp(
  eventId: number | string,
  payload: {
    seats?: number;
    familyCount?: number | string;
    guestName?: string;
    guestMobile?: string;
    guestEmail?: string;
  },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (currentAuthToken) {
      headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/events/${eventId}/rsvp`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.message || `Failed to RSVP (${res.status})` };
    }

    // Persist guest RSVP in storage if unauthenticated / guest
    if (isGuestSession() || !currentAuthToken) {
      try {
        const stored = await AsyncStorage.getItem(GUEST_RSVPS_KEY);
        const guestMap = stored ? JSON.parse(stored) : {};
        guestMap[String(eventId)] = data.rsvp || {
          eventId: String(eventId),
          createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(GUEST_RSVPS_KEY, JSON.stringify(guestMap));
      } catch {}
    }

    notifySessionListeners();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error while submitting RSVP' };
  }
}

/**
 * Submits a new Membership Application to backend
 */
export async function submitMembershipApplication(payload: {
  discipline: string;
  employer: string;
  designation: string;
  experienceYears?: number;
  qualification: string;
  applicantName: string;
  applicantMobile: string;
  applicantEmail: string;
  degreeCertRef?: string;
  passportRef?: string;
  civilIdRef?: string;
  photoRef?: string;
  referredBy?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (currentAuthToken) {
      headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/membership/application`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.message || `Failed to submit application (${res.status})` };
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error while submitting application' };
  }
}

