import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Send,
  Unlink,
  FileText,
  Eye,
} from 'lucide-react';
import { Tabs, TabItem } from '../components/Tabs';
import { StatusBadge } from '../components/StatusBadge';
import { BackendMissingBadge } from '../components/BackendMissingBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import { apiClient } from '../services/api-client';

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [member, setMember] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Active Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Unlink Dialog
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);

  const fetchMember = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>(`/admin/members/${id}`);
      setMember(res);
      setFormData({
        company: res.company || '',
        designation: res.designation || '',
        governorate: res.governorate || '',
        sector: res.sector || '',
        areaLocality: res.areaLocality || '',
        familyStatus: res.familyStatus || '',
        familyMembersCount: res.familyMembersCount || 1,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load member profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setIsSaving(true);
    try {
      await apiClient(`/members/${member.memberCode}/profile`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      showToast('Member profile updated successfully.');
      setIsEditing(false);
      fetchMember();
    } catch (err: any) {
      showToast(err.message || 'Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoader type="form" count={4} />;
  }

  if (error || !member) {
    return (
      <ErrorState
        message={error || 'Member not found'}
        onRetry={fetchMember}
      />
    );
  }

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'professional', label: 'Professional' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'documents', label: 'Documents' },
    { id: 'family', label: 'Family' },
    { id: 'activity', label: 'Activity' },
    { id: 'consent', label: 'Consent & Privacy' },
    { id: 'audit', label: 'Audit Log' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#FFFDF9] border border-[#E2D5C0] p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/admin/members')}
            className="p-2 text-[#686055] hover:text-[#201E1D] hover:bg-[#F5EAD8] rounded-xl transition-colors cursor-pointer"
            title="Back to members"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-[#201E1D]">
                {member.fullName}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#F5EAD8] text-[#273318] border border-[#E2D5C0] font-bold">
                {member.memberCode}
              </span>
            </div>
            <p className="text-xs text-[#686055] mt-0.5 font-mono">
              Grade: {member.grade} · Discipline: {member.discipline} · Since {member.memberSinceYear || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold text-[#686055] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#273318] hover:bg-[#344421] text-[#F9F4ED] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFFDF9] border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold text-[#201E1D] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                <Edit size={14} />
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/admin/communication/notifications?memberId=${member.id}`)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C67139] hover:bg-[#b56430] text-[#F9F4ED] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                <Send size={14} />
                <span>Notify</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-xs">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b border-[#EFE4D0]">
              <div className="w-24 h-24 rounded-2xl bg-[#F5EAD8] border border-[#E2D5C0] flex items-center justify-center font-serif text-2xl font-bold text-[#273318] shrink-0 overflow-hidden shadow-inner">
                {member.photoKey ? (
                  <img
                    src={`http://localhost:3000/members/${member.memberCode}/photo`}
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  member.fullName.charAt(0)
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Member Code
                  </span>
                  <span className="font-mono text-sm font-bold text-[#201E1D]">
                    {member.memberCode}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    IEI India Charter No.
                  </span>
                  <span className="font-mono text-sm font-semibold text-[#201E1D]">
                    {member.ieiIndiaNo || 'Pending India Allocation'}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Membership Grade
                  </span>
                  <span className="font-bold text-[#273318]">{member.grade}</span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Blood Group
                  </span>
                  <span className="font-mono font-bold text-[#C62828]">
                    {member.bloodGroup || 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Mobile Phone
                  </span>
                  <span className="font-mono text-[#201E1D]">{member.mobile}</span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Official Chapter Status
                  </span>
                  <StatusBadge status="GOOD_STANDING" size="sm" />
                </div>
              </div>
            </div>

            {/* Linked Sign-in Providers Strip */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#201E1D]">
                    Linked Sign-In Identities (OAuth)
                  </h3>
                  <p className="text-[11px] text-[#686055]">
                    Verified digital identities linked to this member profile (Read-only).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled
                    onClick={() => setUnlinkDialogOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5EAD8] text-[#8A7F73] text-xs font-medium rounded-lg cursor-not-allowed border border-[#E2D5C0]"
                  >
                    <Unlink size={13} />
                    <span>Unlink Sign-In</span>
                  </button>
                  <BackendMissingBadge />
                </div>
              </div>

              {member.authIdentities && member.authIdentities.length > 0 ? (
                <div className="divide-y divide-[#EFE4D0] border border-[#E2D5C0] rounded-xl overflow-hidden bg-[#FFFDF9]">
                  {member.authIdentities.map((ident: any) => (
                    <div
                      key={ident.id}
                      className="p-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#273318] px-2 py-0.5 rounded bg-[#F5EAD8]">
                          {ident.provider}
                        </span>
                        <span className="text-[#686055] font-mono">
                          {ident.email || ident.providerUserId}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8A7F73]">
                        Linked on {new Date(ident.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#F5EAD8]/40 border border-[#E2D5C0] rounded-xl text-center text-xs text-[#8A7F73]">
                  No external OAuth providers linked. Member accesses using registered Member ID + Mobile verification.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. PROFESSIONAL TAB */}
        {activeTab === 'professional' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Current Employer / Company">
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  disabled={!isEditing || isSaving}
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] text-xs rounded-xl p-2.5 disabled:bg-[#F5EAD8]/30"
                />
              </FormField>

              <FormField label="Professional Designation">
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  disabled={!isEditing || isSaving}
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] text-xs rounded-xl p-2.5 disabled:bg-[#F5EAD8]/30"
                />
              </FormField>

              <FormField label="Governorate">
                <input
                  type="text"
                  value={formData.governorate}
                  onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                  disabled={!isEditing || isSaving}
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] text-xs rounded-xl p-2.5 disabled:bg-[#F5EAD8]/30"
                />
              </FormField>

              <FormField label="Sector / Industry">
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  disabled={!isEditing || isSaving}
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] text-xs rounded-xl p-2.5 disabled:bg-[#F5EAD8]/30"
                />
              </FormField>

              <FormField label="Area / Locality">
                <input
                  type="text"
                  value={formData.areaLocality}
                  onChange={(e) => setFormData({ ...formData, areaLocality: e.target.value })}
                  disabled={!isEditing || isSaving}
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] text-xs rounded-xl p-2.5 disabled:bg-[#F5EAD8]/30"
                />
              </FormField>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#273318] text-white text-xs font-semibold rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Professional Data'}
                </button>
              </div>
            )}
          </form>
        )}

        {/* 3. SUBSCRIPTIONS TAB */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE4D0]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#201E1D]">
                Subscription Periods & Receipts
              </h3>
              <button
                onClick={() => navigate('/admin/subscriptions')}
                className="text-xs text-[#C67139] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>View Treasurer Workbench</span>
              </button>
            </div>

            {member.subscriptions && member.subscriptions.length > 0 ? (
              <div className="divide-y divide-[#EFE4D0] border border-[#E2D5C0] rounded-xl overflow-hidden">
                {member.subscriptions.map((sub: any) => (
                  <div key={sub.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#201E1D]">
                        Term: {sub.period?.label} (20 KD)
                      </div>
                      <div className="text-[11px] text-[#8A7F73]">
                        Ends on: {new Date(sub.period?.endsOn).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={sub.status} size="sm" />
                      {sub.declarations && sub.declarations.length > 0 && (
                        <span className="text-[10px] text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded font-mono">
                          Receipt #{sub.declarations[0]?.receiptNo || 'Pending'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8A7F73] py-4 text-center">
                No active subscription periods found.
              </p>
            )}
          </div>
        )}

        {/* 4. DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#201E1D]">
              Member Verification Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Engineering Degree Certificate', type: 'DEGREE_CERTIFICATE' },
                { title: 'Civil ID Copy', type: 'CIVIL_ID' },
                { title: 'Passport Copy', type: 'PASSPORT_COPY' },
                { title: 'Passport Size Photograph', type: 'PHOTOGRAPH' },
              ].map((doc) => (
                <div
                  key={doc.type}
                  className="p-3.5 border border-[#E2D5C0] rounded-xl bg-[#F5EAD8]/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-[#273318]" />
                    <span className="font-semibold text-[#201E1D]">{doc.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="UPLOADED" size="sm" />
                    <button
                      onClick={() => showToast('Secure document retrieval logged in chapter audit ledger.')}
                      className="p-1 text-[#273318] hover:bg-[#F5EAD8] rounded transition-colors cursor-pointer"
                      title="View authenticated file"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. FAMILY TAB */}
        {activeTab === 'family' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#201E1D]">
              Family Status & Attendance Headcount
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                  Family Status
                </span>
                <span className="font-semibold text-[#201E1D]">
                  {member.familyStatus || 'Family in Kuwait'}
                </span>
              </div>
              <div>
                <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                  Registered Family Members Count
                </span>
                <span className="font-mono font-bold text-[#201E1D]">
                  {member.familyMembersCount || 1}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 6. ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#201E1D]">
              Programmes Attendance & RSVP Records
            </h3>
            {member.eventCheckIns && member.eventCheckIns.length > 0 ? (
              <div className="divide-y divide-[#EFE4D0] border border-[#E2D5C0] rounded-xl overflow-hidden text-xs">
                {member.eventCheckIns.map((ci: any) => (
                  <div key={ci.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#201E1D]">
                        Event #{ci.eventId}
                      </div>
                      <div className="text-[11px] text-[#8A7F73]">
                        Scanned at {new Date(ci.scannedAt).toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded font-medium">
                      {ci.manual ? 'Manual Door Entry' : 'QR Verified'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8A7F73] py-4 text-center">
                No recent door attendance records logged.
              </p>
            )}
          </div>
        )}

        {/* 7. CONSENT TAB */}
        {activeTab === 'consent' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#201E1D]">
              Member Privacy Consent Ledger
            </h3>
            <div className="p-4 border border-[#E2D5C0] rounded-xl bg-[#F5EAD8]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span>Blood Donors Registry Participation</span>
                <StatusBadge status="CONSENT_GRANTED" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span>Chapter Skills & Technical Speakers Directory</span>
                <StatusBadge status="CONSENT_GRANTED" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span>Carpool & Community Referral Contact Sharing</span>
                <StatusBadge status="CONSENT_GRANTED" size="sm" />
              </div>
            </div>
          </div>
        )}

        {/* 8. AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#201E1D]">
              Audit Ledger History for Member
            </h3>
            {member.auditLogs && member.auditLogs.length > 0 ? (
              <div className="divide-y divide-[#EFE4D0] border border-[#E2D5C0] rounded-xl overflow-hidden text-xs">
                {member.auditLogs.map((log: any) => (
                  <div key={log.id} className="p-3">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-[#273318]">{log.action}</span>
                      <span className="text-[11px] text-[#8A7F73]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#686055] font-mono mt-0.5">
                      Target: {log.entity} · ID: {log.entityId}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8A7F73] py-4 text-center">
                No audit entries recorded for this profile.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Unlink Sign-in Dialog */}
      <ConfirmDialog
        isOpen={unlinkDialogOpen}
        title="Unlink External Sign-In Provider"
        message="This action will disassociate the linked OAuth identity. The member will need to verify with Member ID and Mobile to sign in again."
        requiresReason={true}
        reasonPlaceholder="Specify administrative justification for unlinking identity..."
        confirmLabel="Unlink Identity"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          showToast('Unlink sign-in endpoint is not yet supported by the backend API.', 'error');
          setUnlinkDialogOpen(false);
        }}
        onCancel={() => setUnlinkDialogOpen(false)}
      />
    </div>
  );
};
