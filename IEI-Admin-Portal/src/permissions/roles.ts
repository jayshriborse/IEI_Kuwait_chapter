import type { AdminPermission } from '../types/permissions.types';
import type { AdminUser, OfficePosition } from '../types/auth.types';

/**
 * Strict role-to-permission mapping based on documented IEI Kuwait Chapter roles.
 *
 * Rules:
 * - Treasurer: Sole role with financial/receipt confirmation authority.
 * - General Secretary: Membership application review (forwards to Chairman).
 * - Chairman: Final application approval & chapter executive oversight.
 * - EC Volunteer: Event check-in operations.
 * - EC Officer: General committee operations & check-in verification.
 */
export const ROLE_PERMISSIONS_MAP: Record<OfficePosition, AdminPermission[]> = {
  TREASURER: [
    'ACCESS_TREASURER_WORKBENCH',
    'CONFIRM_SUBSCRIPTION_RECEIPTS',
    'ACCESS_DOOR_CHECKIN',
    'MANAGE_EVENT_ATTENDANCE',
    'VIEW_EXECUTIVE_DASHBOARD',
  ],
  GENERAL_SECRETARY: [
    'ACCESS_SECRETARY_WORKBENCH',
    'REVIEW_MEMBERSHIP_APPLICATIONS',
    'ACCESS_DOOR_CHECKIN',
    'MANAGE_EVENT_ATTENDANCE',
    'VIEW_EXECUTIVE_DASHBOARD',
  ],
  CHAIRMAN: [
    'ACCESS_CHAIRMAN_DESK',
    'APPROVE_MEMBERSHIP_APPLICATIONS',
    'ACCESS_DOOR_CHECKIN',
    'MANAGE_EVENT_ATTENDANCE',
    'VIEW_EXECUTIVE_DASHBOARD',
  ],
  EC_VOLUNTEER: [
    'ACCESS_DOOR_CHECKIN',
    'MANAGE_EVENT_ATTENDANCE',
  ],
};

/**
 * Checks whether an admin user holds a specific permission.
 */
export function hasPermission(
  user: AdminUser | null,
  permission: AdminPermission
): boolean {
  if (!user || !user.positions || user.positions.length === 0) {
    // If user has EC_OFFICER role tag, grant standard event check-in permission
    if (user?.role === 'EC_OFFICER') {
      return permission === 'ACCESS_DOOR_CHECKIN' || permission === 'MANAGE_EVENT_ATTENDANCE';
    }
    return false;
  }

  return user.positions.some((pos) => {
    const perms = ROLE_PERMISSIONS_MAP[pos] || [];
    return perms.includes(permission);
  });
}

/**
 * Checks if a user has any of the listed positions.
 */
export function hasAnyPosition(
  user: AdminUser | null,
  positions: OfficePosition[]
): boolean {
  if (!user || !user.positions) return false;
  return user.positions.some((p) => positions.includes(p));
}

/**
 * Formats official position title for display with gold/green badge styling.
 */
export function formatPositionTitle(pos: OfficePosition): string {
  switch (pos) {
    case 'TREASURER':
      return 'Chapter Treasurer';
    case 'GENERAL_SECRETARY':
      return 'General Secretary';
    case 'CHAIRMAN':
      return 'Chapter Chairman';
    case 'EC_VOLUNTEER':
      return 'EC Volunteer / Desk';
    default:
      return pos;
  }
}
