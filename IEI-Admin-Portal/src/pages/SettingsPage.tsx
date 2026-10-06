import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Server,
  FileText,
  Plus,
  RefreshCw,
  Building2,
  CreditCard,
  Flag,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { apiClient } from '../services/api-client';
import { Tabs } from '../components/Tabs';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { RoleBadge } from '../components/RoleBadge';
import { FormField } from '../components/FormField';
import { BackendMissingBadge } from '../components/BackendMissingBadge';
import { useToast } from '../components/Toast';

interface AdminUser {
  id: string;
  memberId: string;
  memberCode: string;
  fullName: string;
  position: string;
  term: string;
  isActive: boolean;
}

interface SystemSettingsData {
  chapter: {
    name: string;
    centerCode: string;
    operatingCurrency: string;
    registrationNumber: string;
    address: string;
  };
  dues: {
    annualFee: number;
    currency: string;
  };
  bankDetails: {
    beneficiary: string;
    bankName: string;
    iban: string;
    cashOffice: string;
  };
  subscriptionPeriods: { id: string; name: string; startDate: string; endDate: string }[];
  demoMode: {
    enabled: boolean;
    isProduction: boolean;
    demoAccountsNotice: string;
  };
  featureFlags: {
    whatsappIntegration: boolean;
    twoFactorAuthFeasible: boolean;
    qrScanningDoorSync: boolean;
  };
}

interface AuditLogItem {
  id: string;
  actorMemberId: string | null;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  details: any;
}

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('admin-users');

  // Admin users state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [assignMemberCode, setAssignMemberCode] = useState('');
  const [assignPosition, setAssignPosition] = useState('EC_VOLUNTEER');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // System settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettingsData | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Audit log state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [auditActionFilter, setAuditActionFilter] = useState('');

  // Fetch admin users
  const fetchAdminUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await apiClient<AdminUser[]>('/admin/users');
      setAdminUsers(data);
    } catch (err: any) {
      showToast(err?.message || 'Failed to load executive admin users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch system settings
  const fetchSystemSettings = async () => {
    setLoadingSettings(true);
    try {
      const data = await apiClient<SystemSettingsData>('/admin/system-settings');
      setSystemSettings(data);
    } catch (err: any) {
      showToast(err?.message || 'Failed to load chapter system settings', 'error');
    } finally {
      setLoadingSettings(false);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const url = auditActionFilter
        ? `/admin/audit-logs?action=${encodeURIComponent(auditActionFilter)}`
        : '/admin/audit-logs';
      const data = await apiClient<AuditLogItem[]>(url);
      setAuditLogs(data);
    } catch (err: any) {
      showToast(err?.message || 'Failed to load audit logs', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin-users') {
      fetchAdminUsers();
    } else if (activeTab === 'system') {
      fetchSystemSettings();
    } else if (activeTab === 'audit-log') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignMemberCode.trim()) {
      showToast('Please enter a valid member ID', 'warning');
      return;
    }

    setSubmittingAssign(true);
    try {
      await apiClient('/admin/users/assign-role', {
        method: 'POST',
        body: JSON.stringify({
          memberCode: assignMemberCode.trim().toUpperCase(),
          position: assignPosition,
        }),
      });
      showToast(`Role ${assignPosition} successfully assigned to ${assignMemberCode.toUpperCase()}`, 'success');
      setAddAdminModalOpen(false);
      setAssignMemberCode('');
      fetchAdminUsers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to assign executive role', 'error');
    } finally {
      setSubmittingAssign(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#201E1D]">Administration & Chapter Settings</h1>
        <p className="text-sm text-[#686055]">
          Manage executive permissions, chapter operational parameters, security policies, and official audit ledgers.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'admin-users', label: 'Executive Users', icon: <Users size={15} /> },
          { id: 'roles-permissions', label: 'Roles & Security Matrix', icon: <Shield size={15} /> },
          { id: 'system', label: 'Chapter Parameters & Flags', icon: <Server size={15} /> },
          { id: 'audit-log', label: 'Official Audit Log', icon: <FileText size={15} /> },
        ]}
      />

      {/* TAB 1: ADMIN USERS */}
      {activeTab === 'admin-users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-[#201E1D]">Executive Committee Officers</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddAdminModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#273318] text-[#F9F4ED] hover:bg-[#344420] transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>Assign Officer Role</span>
              </button>
              <button
                onClick={fetchAdminUsers}
                className="p-1.5 text-[#686055] hover:text-[#201E1D] hover:bg-[#EFE4D0] rounded-xl transition-colors"
                title="Refresh users"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <SkeletonLoader type="table" count={5} />
          ) : (
            <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5EAD8]/70 border-b border-[#E2D5C0] text-[#686055] uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Member ID</th>
                      <th className="px-4 py-3">Officer Name</th>
                      <th className="px-4 py-3">Executive Position</th>
                      <th className="px-4 py-3">Active Term</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE4D0]">
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#F5EAD8]/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-[#201E1D]">{u.memberCode}</td>
                        <td className="px-4 py-3.5 font-medium text-[#201E1D]">{u.fullName}</td>
                        <td className="px-4 py-3.5">
                          <RoleBadge position={u.position} size="sm" />
                        </td>
                        <td className="px-4 py-3.5 text-[#686055]">{u.term}</td>
                        <td className="px-4 py-3.5">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E7D32]">
                              <CheckCircle2 size={13} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C62828]">
                              <XCircle size={13} /> Deactivated
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="relative inline-flex items-center">
                            <button
                              disabled
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-[#EFE4D0] text-[#8A7F73] cursor-not-allowed border border-[#D5C7B0]"
                              title="Officer deactivation endpoint requires chapter resolution"
                            >
                              Deactivate
                            </button>
                            <div className="absolute -top-2.5 -right-2">
                              <BackendMissingBadge />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {adminUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#8A7F73]">
                          No executive assignments recorded in chapter ledger.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal for Assigning Officer Role */}
          {addAdminModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="font-serif font-bold text-lg text-[#201E1D] mb-2">
                  Assign Executive Committee Role
                </h3>
                <p className="text-xs text-[#686055] mb-4">
                  Select an existing registered IEI member and grant executive office permissions.
                </p>

                <form onSubmit={handleAssignRole} className="space-y-4">
                  <FormField label="Member Code (e.g., IEI0005)" required>
                    <input
                      type="text"
                      value={assignMemberCode}
                      onChange={(e) => setAssignMemberCode(e.target.value)}
                      placeholder="IEI..."
                      className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl px-3 py-2 text-xs uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[#273318]"
                      required
                    />
                  </FormField>

                  <FormField label="Executive Role" required>
                    <select
                      value={assignPosition}
                      onChange={(e) => setAssignPosition(e.target.value)}
                      className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#273318]"
                    >
                      <option value="EC_VOLUNTEER">EC Volunteer (Door Check-In Desk)</option>
                      <option value="TREASURER">Treasurer (Subscriptions & Receipts)</option>
                      <option value="GENERAL_SECRETARY">General Secretary (Scrutiny & Secretariat)</option>
                      <option value="CHAIRMAN">Chairman (Executive Final Approval)</option>
                      <option value="ADMIN">System Administrator (Full Authority)</option>
                    </select>
                  </FormField>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAddAdminModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#686055] hover:bg-[#EFE4D0] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAssign}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#273318] text-[#F9F4ED] hover:bg-[#344420] transition-colors disabled:opacity-50"
                    >
                      {submittingAssign ? 'Assigning...' : 'Assign Role'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles-permissions' && (
        <div className="space-y-4">
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
            <h2 className="font-serif font-bold text-base text-[#201E1D] mb-2">
              Real Backend Enforced Role & Permission Matrix
            </h2>
            <p className="text-xs text-[#686055] mb-4">
              This matrix documents exactly what <code className="bg-[#EFE4D0] px-1 rounded">@RequireAdminRoles</code> and <code className="bg-[#EFE4D0] px-1 rounded">JwtAuthGuard</code> enforce on every HTTP request in the NestJS backend. Non-authorized roles receive an HTTP 403 Forbidden.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5EAD8]/80 border-b border-[#E2D5C0] text-[#686055] uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Portal Module & Endpoint</th>
                    <th className="px-3 py-3 text-center">ADMIN</th>
                    <th className="px-3 py-3 text-center">CHAIRMAN</th>
                    <th className="px-3 py-3 text-center">GEN. SECRETARY</th>
                    <th className="px-3 py-3 text-center">TREASURER</th>
                    <th className="px-3 py-3 text-center">EC VOLUNTEER</th>
                    <th className="px-3 py-3 text-center">MEMBER / GUEST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE4D0]">
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#201E1D]">Members Registry View & Export</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#201E1D]">Application 1st Scrutiny (Recommend)</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#201E1D]">Application Final Approval (Kolkata)</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#201E1D]">Subscription Receipt Confirmation</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#201E1D]">Door Check-In Verification & Attendance</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#201E1D]">Executive Settings & Officer Assignment</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#201E1D]">Audit Logs Ledger Access</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#2E7D32] font-bold">✓ 200</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                    <td className="px-3 py-3 text-center text-[#C62828] font-bold">✗ 403</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM SETTINGS & FLAGS */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {loadingSettings || !systemSettings ? (
            <SkeletonLoader type="cards" count={3} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chapter Information */}
              <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={18} className="text-[#273318]" />
                  <h3 className="font-serif font-bold text-base text-[#201E1D]">Chapter Registry Details</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#686055] block">Institution Chapter</span>
                    <span className="font-medium text-[#201E1D]">{systemSettings.chapter.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#686055] block">Center Code</span>
                      <span className="font-mono font-medium text-[#201E1D]">{systemSettings.chapter.centerCode}</span>
                    </div>
                    <div>
                      <span className="text-[#686055] block">Registration No.</span>
                      <span className="font-mono font-medium text-[#201E1D]">{systemSettings.chapter.registrationNumber}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#686055] block">Registered Address</span>
                    <span className="font-medium text-[#201E1D]">{systemSettings.chapter.address}</span>
                  </div>
                </div>
              </div>

              {/* Financial & Banking Parameters */}
              <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={18} className="text-[#273318]" />
                  <h3 className="font-serif font-bold text-base text-[#201E1D]">Banking & Cash Office</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#686055] block">Annual Subscription</span>
                      <span className="font-bold text-[#201E1D]">{systemSettings.dues.annualFee} {systemSettings.dues.currency}</span>
                    </div>
                    <div>
                      <span className="text-[#686055] block">Bank Name</span>
                      <span className="font-medium text-[#201E1D]">{systemSettings.bankDetails.bankName}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#686055] block">Beneficiary Account Name</span>
                    <span className="font-medium text-[#201E1D]">{systemSettings.bankDetails.beneficiary}</span>
                  </div>
                  <div>
                    <span className="text-[#686055] block">IBAN Number</span>
                    <span className="font-mono font-medium text-[#201E1D]">{systemSettings.bankDetails.iban}</span>
                  </div>
                  <div>
                    <span className="text-[#686055] block">Physical Cash Office</span>
                    <span className="font-medium text-[#201E1D]">{systemSettings.bankDetails.cashOffice}</span>
                  </div>
                </div>
              </div>

              {/* Demo Mode & Environment Flag */}
              <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Flag size={18} className="text-[#C67139]" />
                  <h3 className="font-serif font-bold text-base text-[#201E1D]">Environment & Demo Mode Guard</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5EAD8]/70 border border-[#E2D5C0]">
                    <div>
                      <span className="font-semibold text-[#201E1D] block">Demo Accounts State</span>
                      <span className="text-[#686055]">{systemSettings.demoMode.demoAccountsNotice}</span>
                    </div>
                    {systemSettings.demoMode.enabled ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFE0B2] text-[#E65100]">
                        DEMO ENABLED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C8E6C9] text-[#2E7D32]">
                        SECURE PROD
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#686055]">
                    In production deployments, demo accounts IEI9001, IEI9002, IEI9003, and IEI9004 with mobile 0000000x are strictly disabled by backend configuration flags.
                  </p>
                </div>
              </div>

              {/* Feature Flags & Feasibility */}
              <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Server size={18} className="text-[#273318]" />
                  <h3 className="font-serif font-bold text-base text-[#201E1D]">Feature Flags & Feasibility</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-[#201E1D] block">Two-Factor Authentication (2FA)</span>
                      <span className="text-[11px] text-[#686055]">Feasibility report: SMS gateway requires Kuwait PACI or KSE integration</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFE4D0] text-[#686055]">
                      {systemSettings.featureFlags.twoFactorAuthFeasible ? 'ENABLED' : 'PLANNED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-[#201E1D] block">WhatsApp Broadcast Integration</span>
                      <span className="text-[11px] text-[#686055]">Direct link generator and channel routing</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C8E6C9] text-[#2E7D32]">
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-[#201E1D] block">QR Attendance Door Sync</span>
                      <span className="text-[11px] text-[#686055]">Live check-in sync with duplicate suppression</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C8E6C9] text-[#2E7D32]">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOG */}
      {activeTab === 'audit-log' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-[#201E1D]">Chapter Official Audit Ledger</h2>
            <div className="flex items-center gap-2">
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl px-3 py-1.5 text-xs text-[#201E1D]"
              >
                <option value="">All Audit Actions</option>
                <option value="RECOMMEND_APPLICATION">Recommend Application</option>
                <option value="APPROVE_APPLICATION">Approve Application</option>
                <option value="REJECT_APPLICATION">Reject Application</option>
                <option value="CONFIRM_SUBSCRIPTION_RECEIPT">Confirm Receipt</option>
                <option value="DOWNLOAD_DOCUMENT">Document Download</option>
                <option value="EXPORT_MEMBERS_REGISTRY">Registry Export</option>
                <option value="ASSIGN_ADMIN_ROLE">Assign Admin Role</option>
              </select>
              <button
                onClick={fetchAuditLogs}
                className="p-1.5 text-[#686055] hover:text-[#201E1D] hover:bg-[#EFE4D0] rounded-xl transition-colors"
                title="Refresh audit logs"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {loadingLogs ? (
            <SkeletonLoader type="table" count={5} />
          ) : (
            <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5EAD8]/70 border-b border-[#E2D5C0] text-[#686055] uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Acting Officer</th>
                      <th className="px-4 py-3">Action Type</th>
                      <th className="px-4 py-3">Entity Target</th>
                      <th className="px-4 py-3">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE4D0]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F5EAD8]/40 transition-colors">
                        <td className="px-4 py-3 text-[#686055] font-mono text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#201E1D]">
                          {log.actorName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#273318]/10 text-[#273318]">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[#686055]">
                          {log.entity}:{log.entityId.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 text-[#686055] max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[#8A7F73]">
                          No audit log records found matching query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
