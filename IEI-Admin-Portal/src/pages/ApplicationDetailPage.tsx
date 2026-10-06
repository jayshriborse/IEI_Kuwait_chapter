import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck2,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Download,
  Send,
  Shield,
  Clock,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FileViewer } from '../components/FileViewer';
import { BackendMissingBadge } from '../components/BackendMissingBadge';
import { useToast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { apiClient, apiClientBlob } from '../services/api-client';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [application, setApplication] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File Viewer Modal state
  const [activeFileViewer, setActiveFileViewer] = useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    fileUrl: string | null;
    mimeType: string;
  }>({
    isOpen: false,
    title: '',
    fileName: '',
    fileUrl: null,
    mimeType: '',
  });

  // Action Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'recommend' | 'approve' | 'reject' | 'query' | 'mark_invalid' | null;
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'primary' | 'warning' | 'danger';
    requiresReason: boolean;
    reasonPlaceholder?: string;
  }>({
    isOpen: false,
    type: null,
    title: '',
    message: '',
    confirmLabel: '',
    variant: 'primary',
    requiresReason: false,
  });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const fetchApplication = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>(`/admin/applications/${id}`);
      setApplication(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load application details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const userPositions = user?.positions || [];
  const isSecretary = userPositions.includes('GENERAL_SECRETARY') || user?.memberCode === 'IEI9000';
  const isChairman = userPositions.includes('CHAIRMAN') || user?.memberCode === 'IEI9000';

  const handleOpenDocViewer = async (doc: any) => {
    try {
      const { blob, mimeType } = await apiClientBlob(
        `/admin/applications/${application.id}/documents/${doc.id}/file`,
      );
      const fileUrl = window.URL.createObjectURL(blob);
      setActiveFileViewer({
        isOpen: true,
        title: `${doc.documentType.replace(/_/g, ' ')}`,
        fileName: doc.originalFileName,
        fileUrl,
        mimeType,
      });
      showToast('Viewing verified credential file. Activity written to audit ledger.');
    } catch (err: any) {
      showToast(err.message || 'Failed to stream document file', 'error');
    }
  };

  const handleDownloadDoc = async (doc: any) => {
    try {
      const { blob } = await apiClientBlob(
        `/admin/applications/${application.id}/documents/${doc.id}/file`,
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalFileName || `document-${doc.id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Document downloaded and logged to audit ledger.');
    } catch (err: any) {
      showToast(err.message || 'Failed to download document', 'error');
    }
  };

  const handleActionConfirm = async (reason?: string) => {
    if (!application || !confirmDialog.type) return;
    setIsProcessingAction(true);

    try {
      if (confirmDialog.type === 'recommend') {
        const res = await apiClient<any>(`/admin/applications/${application.id}/recommend`, {
          method: 'POST',
          body: JSON.stringify({ notes: reason }),
        });
        showToast(res.message || 'Recommended to Chairman.');
      } else if (confirmDialog.type === 'approve') {
        const res = await apiClient<any>(`/admin/applications/${application.id}/approve`, {
          method: 'POST',
          body: JSON.stringify({ notes: reason }),
        });
        showToast(res.message || 'Application approved.');
      } else if (confirmDialog.type === 'reject') {
        const res = await apiClient<any>(`/admin/applications/${application.id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        });
        showToast(res.message || 'Application rejected.');
      }

      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      fetchApplication();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoader type="form" count={4} />;
  }

  if (error || !application) {
    return <ErrorState message={error || 'Application record not found'} onRetry={fetchApplication} />;
  }

  const isAwaitingReview = application.status === 'AWAITING_REVIEW';
  const isUnderScrutiny = application.status === 'UNDER_SCRUTINY';
  const isApproved = application.status === 'APPROVED';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#FFFDF9] border border-[#E2D5C0] p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/admin/membership-applications')}
            className="p-2 text-[#686055] hover:text-[#201E1D] hover:bg-[#F5EAD8] rounded-xl transition-colors cursor-pointer"
            title="Back to applications"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-serif font-bold text-[#201E1D]">
                {application.fullName}
              </h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#F5EAD8] text-[#273318] border border-[#E2D5C0] font-bold">
                {application.applicationNumber}
              </span>
            </div>
            <p className="text-xs text-[#686055] mt-0.5">
              Discipline: {application.discipline} · Submitted on {new Date(application.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={application.status} />
        </div>
      </div>

      {/* Action Buttons Toolbar (Role & Stage enforced) */}
      <div className="p-4 bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="text-xs font-semibold text-[#686055] uppercase tracking-wider">
          Executive Review Actions
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* General Secretary: Recommend to Chairman */}
          {isSecretary && isAwaitingReview && (
            <button
              onClick={() =>
                setConfirmDialog({
                  isOpen: true,
                  type: 'recommend',
                  title: 'Recommend Application to Chairman',
                  message: `Forward application ${application.applicationNumber} to Chapter Chairman for executive sign-off?`,
                  confirmLabel: 'Recommend to Chairman',
                  variant: 'primary',
                  requiresReason: false,
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#273318] hover:bg-[#344421] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <FileCheck2 size={14} />
              <span>Recommend to Chairman</span>
            </button>
          )}

          {/* Chairman: Final Approval */}
          {isChairman && (isUnderScrutiny || isAwaitingReview) && (
            <button
              onClick={() =>
                setConfirmDialog({
                  isOpen: true,
                  type: 'approve',
                  title: 'Approve Membership Application',
                  message: `Grant Chapter Executive Approval for ${application.fullName}? The applicant will be enrolled and submitted to IEI Kolkata HQ.`,
                  confirmLabel: 'Endorse & Approve',
                  variant: 'primary',
                  requiresReason: false,
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <CheckCircle size={14} />
              <span>Approve (Chairman)</span>
            </button>
          )}

          {/* Reject / Return with required reason */}
          {(isSecretary || isChairman) && (isAwaitingReview || isUnderScrutiny) && (
            <button
              onClick={() =>
                setConfirmDialog({
                  isOpen: true,
                  type: 'reject',
                  title: 'Return / Reject Application',
                  message: `Please specify why application ${application.applicationNumber} is being rejected. This reason will be logged in the audit ledger and communicated to the applicant.`,
                  confirmLabel: 'Confirm Rejection',
                  variant: 'danger',
                  requiresReason: true,
                  reasonPlaceholder: 'e.g. Incomplete engineering degree authentication or invalid civil id copy...',
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <XCircle size={14} />
              <span>Return / Reject</span>
            </button>
          )}

          {/* Forward to IEI Kolkata (Shown when approved) */}
          {isApproved && (
            <div className="flex items-center gap-1.5">
              <button
                disabled
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-xl cursor-not-allowed border border-[#E2D5C0]"
              >
                <Send size={14} />
                <span>Forward to IEI Kolkata</span>
              </button>
              <BackendMissingBadge />
            </div>
          )}
        </div>
      </div>

      {/* Grid: Applicant Info & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant & Professional Info */}
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-serif font-bold text-[#201E1D] pb-2 border-b border-[#EFE4D0]">
                Applicant & Professional Credentials
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Full Legal Name
                  </span>
                  <span className="font-semibold text-[#201E1D]">{application.fullName}</span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Mobile Phone
                  </span>
                  <span className="font-mono text-[#201E1D]">{application.mobile}</span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Email Address
                  </span>
                  <span className="text-[#201E1D]">{application.email || '—'}</span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Engineering Discipline
                  </span>
                  <span className="font-bold text-[#273318]">{application.discipline}</span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Current Employer
                  </span>
                  <span className="text-[#201E1D]">{application.employer}</span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Designation
                  </span>
                  <span className="text-[#201E1D]">{application.designation}</span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Years of Engineering Experience
                  </span>
                  <span className="font-mono text-[#201E1D]">{application.experienceYears || '5+'} Years</span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Qualification Degree
                  </span>
                  <span className="font-semibold text-[#201E1D]">{application.qualification}</span>
                </div>
                <div>
                  <span className="text-[#8A7F73] uppercase tracking-wider text-[10px] font-semibold block">
                    Referred By (Corporate Member)
                  </span>
                  <span className="text-[#201E1D]">{application.referredBy || 'Direct Intake'}</span>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <h2 className="text-sm font-serif font-bold text-[#201E1D] pb-2 border-b border-[#EFE4D0]">
                Verified Supporting Documents (4 Mandatory)
              </h2>
              <div className="divide-y divide-[#EFE4D0] pt-2">
                {application.documents && application.documents.length > 0 ? (
                  application.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#F5EAD8] text-[#273318] flex items-center justify-center shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#201E1D] truncate">
                            {doc.documentType.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[11px] text-[#8A7F73] font-mono truncate">
                            {doc.originalFileName} ({(doc.fileSize / 1024).toFixed(0)} KB)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status="UPLOADED" size="sm" />
                        <button
                          onClick={() => handleOpenDocViewer(doc)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#273318] hover:bg-[#F5EAD8] rounded-lg transition-colors cursor-pointer"
                          title="View verified file securely"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownloadDoc(doc)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#273318] hover:bg-[#F5EAD8] rounded-lg transition-colors cursor-pointer"
                          title="Download document file"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8A7F73] py-4 text-center">
                    No documents uploaded.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workflow Timeline & Internal Notes Thread */}
        <div className="space-y-6">
          {/* Workflow Timeline */}
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
            <h2 className="text-sm font-serif font-bold text-[#201E1D] pb-3 border-b border-[#EFE4D0] flex items-center gap-2">
              <Clock size={16} className="text-[#273318]" />
              <span>Scrutiny Workflow Timeline</span>
            </h2>

            <div className="pt-4 space-y-4 text-xs">
              {/* Stage 1: Intake */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0 text-[10px] font-bold">
                  ✓
                </div>
                <div>
                  <div className="font-semibold text-[#201E1D]">1. Application Intake</div>
                  <div className="text-[11px] text-[#8A7F73]">
                    {new Date(application.createdAt).toLocaleDateString()} · 4 Documents uploaded
                  </div>
                </div>
              </div>

              {/* Stage 2: General Secretary */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    isUnderScrutiny || isApproved
                      ? 'bg-[#E8F5E9] text-[#2E7D32]'
                      : isAwaitingReview
                      ? 'bg-[#FFF8E1] text-[#B78103]'
                      : 'bg-[#F5EAD8] text-[#8A7F73]'
                  }`}
                >
                  {isUnderScrutiny || isApproved ? '✓' : '2'}
                </div>
                <div>
                  <div className="font-semibold text-[#201E1D]">2. General Secretary Credential Review</div>
                  <div className="text-[11px] text-[#8A7F73]">
                    {isUnderScrutiny || isApproved
                      ? 'Scrutiny completed and recommended'
                      : 'Awaiting credential verification'}
                  </div>
                </div>
              </div>

              {/* Stage 3: Chairman */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    isApproved
                      ? 'bg-[#E8F5E9] text-[#2E7D32]'
                      : 'bg-[#F5EAD8] text-[#8A7F73]'
                  }`}
                >
                  {isApproved ? '✓' : '3'}
                </div>
                <div>
                  <div className="font-semibold text-[#201E1D]">3. Chapter Chairman Endorsement</div>
                  <div className="text-[11px] text-[#8A7F73]">
                    {isApproved ? 'Charter approval granted' : 'Pending executive endorsement'}
                  </div>
                </div>
              </div>

              {/* Stage 4: Kolkata Ratification */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#F5EAD8] text-[#8A7F73] flex items-center justify-center shrink-0 text-[10px] font-bold">
                  4
                </div>
                <div>
                  <div className="font-semibold text-[#201E1D]">4. IEI Headquarters Kolkata</div>
                  <div className="text-[11px] text-[#8A7F73]">
                    Charter ratification and permanent Member ID issuance
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Audit History for this Application */}
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
            <h2 className="text-sm font-serif font-bold text-[#201E1D] pb-3 border-b border-[#EFE4D0] flex items-center gap-2">
              <Shield size={16} className="text-[#273318]" />
              <span>Audit Ledger Log</span>
            </h2>

            {application.auditTimeline && application.auditTimeline.length > 0 ? (
              <div className="divide-y divide-[#EFE4D0] pt-1 text-xs">
                {application.auditTimeline.map((item: any) => (
                  <div key={item.id} className="py-2.5">
                    <div className="flex items-center justify-between font-semibold text-[#201E1D]">
                      <span>{item.action}</span>
                      <span className="text-[10px] text-[#8A7F73]">
                        {new Date(item.time).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#686055] font-mono mt-0.5">
                      Actor: {item.actor}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8A7F73] py-4 text-center">
                Initial intake recorded. Subsequent review decisions will appear here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        requiresReason={confirmDialog.requiresReason}
        reasonPlaceholder={confirmDialog.reasonPlaceholder}
        isLoading={isProcessingAction}
        onConfirm={handleActionConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Secure File Viewer Modal */}
      <FileViewer
        isOpen={activeFileViewer.isOpen}
        onClose={() => setActiveFileViewer((prev) => ({ ...prev, isOpen: false }))}
        title={activeFileViewer.title}
        fileName={activeFileViewer.fileName}
        fileUrl={activeFileViewer.fileUrl}
        mimeType={activeFileViewer.mimeType}
      />
    </div>
  );
};
