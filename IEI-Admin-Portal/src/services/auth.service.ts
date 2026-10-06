import { apiClient, SESSION_STORAGE_KEY } from './api-client';
import type { AdminUser, DevLoginResponse, LoginCredentials } from '../types/auth.types';

export const authService = {
  /**
   * Logs in using the existing IEI-Backend dev-login endpoint.
   * Then retrieves full member profile including assigned office positions.
   */
  async login(credentials: LoginCredentials): Promise<AdminUser> {
    const cleanCode = (credentials.memberCode || '').trim().toUpperCase();
    const cleanMobile = (credentials.mobile || '').trim().replace(/\D/g, '');

    // Step 1: Call existing POST /auth/dev-login
    const loginResult = await apiClient<DevLoginResponse>('/auth/dev-login', {
      method: 'POST',
      body: JSON.stringify({
        memberCode: cleanCode,
        mobile: cleanMobile,
      }),
    });

    const accessToken = loginResult.accessToken;

    // Step 2: Fetch full member profile to verify assigned office bearer positions
    // We use the accessToken in the request headers
    const profileResult = await apiClient<any>(`/members/${cleanCode}/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const positions = (profileResult.positions || []) as AdminUser['positions'];

    // Construct authenticated AdminUser
    const user: AdminUser = {
      id: profileResult.id,
      memberCode: cleanCode,
      fullName: profileResult.fullName || loginResult.member.displayName,
      displayName: profileResult.displayName || loginResult.member.displayName,
      grade: profileResult.grade || loginResult.member.grade,
      discipline: profileResult.discipline || loginResult.member.discipline,
      mobile: cleanMobile,
      bloodGroup: profileResult.bloodGroup,
      ieiIndiaNo: profileResult.ieiIndiaNo,
      memberSinceYear: profileResult.memberSinceYear,
      company: profileResult.company,
      designation: profileResult.designation,
      governorate: profileResult.governorate,
      sector: profileResult.sector,
      areaLocality: profileResult.areaLocality,
      familyStatus: profileResult.familyStatus,
      familyMembersCount: profileResult.familyMembersCount,
      positions,
      role: positions.length > 0 ? 'EC_OFFICER' : 'MEMBER',
      accessToken,
    };

    // Store in localStorage
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));

    return user;
  },

  /**
   * Reads stored session from browser storage.
   */
  getStoredSession(): AdminUser | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AdminUser;
    } catch {
      return null;
    }
  },

  /**
   * Clears the current admin session.
   */
  logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },
};
