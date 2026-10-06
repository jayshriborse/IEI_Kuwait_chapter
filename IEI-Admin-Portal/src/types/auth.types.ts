/**
 * Core authentication and member types matching IEI-Backend schema
 */

export type MembershipGrade = 'FIE' | 'MIE' | 'AMIE' | 'TIE' | 'SMIE';

export type OfficePosition =
  | 'TREASURER'
  | 'GENERAL_SECRETARY'
  | 'CHAIRMAN'
  | 'EC_VOLUNTEER';

export interface AdminUser {
  id?: string;
  memberCode: string;
  fullName: string;
  displayName: string;
  grade: MembershipGrade;
  discipline: string;
  mobile: string;
  bloodGroup?: string | null;
  ieiIndiaNo?: string | null;
  memberSinceYear?: number | null;
  hasPhoto?: boolean;
  company?: string | null;
  designation?: string | null;
  governorate?: string | null;
  sector?: string | null;
  areaLocality?: string | null;
  familyStatus?: string | null;
  familyMembersCount?: number | null;
  positions: OfficePosition[];
  role?: 'MEMBER' | 'EC_OFFICER';
  accessToken: string;
}

export interface LoginCredentials {
  memberCode: string;
  mobile: string;
}

export interface DevLoginResponse {
  accessToken: string;
  member: {
    memberCode: string;
    displayName: string;
    grade: MembershipGrade;
    discipline: string;
    memberSinceYear?: number | null;
  };
}
