/**
 * Granular permissions derived from documented IEI Kuwait Office Bearer roles.
 * Backend remains the final authority; these guard frontend navigation and views.
 */

export type AdminPermission =
  | 'ACCESS_TREASURER_WORKBENCH'      // Sole authority to confirm subscription receipts
  | 'CONFIRM_SUBSCRIPTION_RECEIPTS'   // POST /ec/receipts/:id/confirm
  | 'ACCESS_SECRETARY_WORKBENCH'      // Review applications & chapter records
  | 'REVIEW_MEMBERSHIP_APPLICATIONS'  // Recommend to Chairman
  | 'ACCESS_CHAIRMAN_DESK'            // Executive sign-off & dispatch to HQ
  | 'APPROVE_MEMBERSHIP_APPLICATIONS' // Final approval
  | 'ACCESS_DOOR_CHECKIN'             // Event door scanner & attendee lookups
  | 'MANAGE_EVENT_ATTENDANCE'         // Live attendance monitor
  | 'VIEW_EXECUTIVE_DASHBOARD';       // Overview of chapter metrics
