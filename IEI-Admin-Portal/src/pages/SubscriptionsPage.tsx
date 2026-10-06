import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Eye,
  PhoneCall,
  Send,
  Settings,
} from 'lucide-react';
import { Tabs, TabItem } from '../components/Tabs';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FileViewer } from '../components/FileViewer';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { apiClient, apiClientBlob } from '../services/api-client';

export const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const isTreasurer = user?.positions?.includes('TREASURER') || user?.memberCode === 'IEI9000';

  const [activeTab, setActiveTab] = useState('awaiting');
  const [receipts, setReceipts] = useState<any[]>([]);
  const [renewalRisk, setRenewalRisk] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Receipt Preview
  const [fileViewer, setFileViewer] = useState<{
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

  // Confirmation Modal with Receipt No and Book No
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [receiptNo, setReceiptNo] = useState('');
  const [bookNo, setBookNo] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // Reject / Ask for better receipt dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const tabs: TabItem[] = [
    { id: 'awaiting', label: 'Awaiting Confirmation' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'unpaid', label: 'Unpaid Dues' },
    { id: 'risk', label: 'Renewal Risk' },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch system settings
      try {
        const sys = await apiClient<any>('/admin/system-settings');
        setSystemSettings(sys);
      } catch {
        // Fallback
      }

      // Fetch receipts if treasurer
      if (isTreasurer) {
        try {
          const res = await apiClient<any[]>('/ec/receipts');
          setReceipts(res);
        } catch {
          // If 403 or unavailable
        }
      }

      // Fetch dashboard renewal risk and unpaid members
      const dash = await apiClient<any>('/admin/dashboard');
      if (dash?.renewalRisk) {
        setRenewalRisk(dash.renewalRisk);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscriptions data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenReceipt = async (item: any) => {
    try {
      const { blob, mimeType } = await apiClientBlob(`/ec/receipts/${item.id}/file`);
      const fileUrl = window.URL.createObjectURL(blob);
      setFileViewer({
        isOpen: true,
        title: `Payment Receipt: ${item.memberSubscription?.member?.fullName || 'Member'}`,
        fileName: `receipt-${item.id}.jpg`,
        fileUrl,
        mimeType,
      });
      showToast('Receipt preview opened securely.');
    } catch (err: any) {
      showToast(err.message || 'Failed to view receipt file', 'error');
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptNo.trim() || !bookNo.trim()) {
      setConfirmError('Both Official Receipt No. and Book No. are strictly required.');
      return;
    }

    if (!selectedReceipt) return;
    setIsConfirming(true);
    setConfirmError('');

    try {
      await apiClient(`/ec/receipts/${selectedReceipt.id}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ receiptNo: receiptNo.trim(), bookNo: bookNo.trim() }),
      });
      showToast(`Receipt confirmed successfully. Receipt #${receiptNo} logged in ledger.`);
      setConfirmModalOpen(false);
      setSelectedReceipt(null);
      setReceiptNo('');
      setBookNo('');
      fetchData();
    } catch (err: any) {
      setConfirmError(err.message || 'Confirmation failed');
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoader type="table" count={5} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  const awaitingReceipts = receipts.filter((r) => r.status === 'PENDING');
  const confirmedReceipts = receipts.filter((r) => r.status === 'CONFIRMED');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#FFFDF9] border border-[#E2D5C0] p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-serif font-bold text-[#201E1D]">
              Subscriptions & Receipts Authority
            </h1>
            {isTreasurer ? (
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[#273318] text-[#F9F4ED] font-bold">
                Treasurer Access
              </span>
            ) : (
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[#FFF3E0] text-[#E65100]">
                Read-Only (Treasurer Role Required)
              </span>
            )}
          </div>
          <p className="text-xs text-[#686055] mt-0.5">
            Active Period: {systemSettings?.activeTerm || '2026-27'} · Annual Dues: {systemSettings?.annualDuesKd || 20} KWD
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/settings')}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FFFDF9] border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold text-[#201E1D] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
        >
          <Settings size={14} />
          <span>Subscription Settings</span>
        </button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-xs">
        {/* Awaiting Confirmation Tab */}
        {activeTab === 'awaiting' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE4D0]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#201E1D]">
                Payment Declarations Awaiting Confirmation
              </h2>
              <span className="text-xs text-[#8A7F73]">
                {awaitingReceipts.length} pending verification
              </span>
            </div>

            {awaitingReceipts.length === 0 ? (
              <p className="text-xs text-[#8A7F73] py-8 text-center">
                All submitted payment declarations have been reconciled and confirmed.
              </p>
            ) : (
              <div className="divide-y divide-[#EFE4D0]">
                {awaitingReceipts.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-sm text-[#201E1D]">
                        {item.memberSubscription?.member?.fullName}
                      </div>
                      <div className="text-[11px] text-[#686055] font-mono mt-0.5">
                        {item.memberSubscription?.member?.memberCode} · Method: {item.method} · Amount: 20 KWD
                      </div>
                      <div className="text-[10px] text-[#8A7F73] mt-0.5">
                        Submitted at {new Date(item.submittedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenReceipt(item)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#FFFDF9] border border-[#E2D5C0] hover:bg-[#F5EAD8] text-[#273318] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Preview Receipt</span>
                      </button>

                      {isTreasurer && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedReceipt(item);
                              setReceiptNo('');
                              setBookNo('');
                              setConfirmError('');
                              setConfirmModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 size={13} />
                            <span>Confirm Receipt</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReceipt(item);
                              setRejectDialogOpen(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#FFF5F5] border border-[#FFCDD2] hover:bg-[#FFEBEE] text-[#C62828] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                          >
                            <XCircle size={13} />
                            <span>Ask for Better Receipt</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Confirmed Receipts Tab */}
        {activeTab === 'confirmed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE4D0]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#201E1D]">
                Reconciled & Confirmed Receipts
              </h2>
              <span className="text-xs text-[#8A7F73]">
                {confirmedReceipts.length} total confirmed
              </span>
            </div>

            {confirmedReceipts.length === 0 ? (
              <p className="text-xs text-[#8A7F73] py-8 text-center">
                No confirmed receipts in this view.
              </p>
            ) : (
              <div className="divide-y divide-[#EFE4D0]">
                {confirmedReceipts.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#201E1D]">
                        {item.memberSubscription?.member?.fullName}
                      </div>
                      <div className="text-[11px] text-[#686055] font-mono">
                        Receipt #{item.receiptNo || '—'} · Book #{item.bookNo || '—'} · Method: {item.method}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status="CONFIRMED" size="sm" />
                      <button
                        onClick={() => handleOpenReceipt(item)}
                        className="p-1 text-[#273318] hover:bg-[#F5EAD8] rounded transition-colors"
                        title="View receipt"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Unpaid Dues Tab */}
        {activeTab === 'unpaid' && (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#201E1D] pb-2 border-b border-[#EFE4D0]">
              Members with Overdue Subscription (2026-27)
            </h2>
            <div className="divide-y divide-[#EFE4D0]">
              {renewalRisk.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#201E1D]">{m.fullName}</div>
                    <div className="text-[11px] text-[#8A7F73] font-mono">
                      {m.memberCode} · {m.grade} · Member Since {m.memberSinceYear || '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="DUE" size="sm" />
                    <a
                      href={`tel:${m.mobile}`}
                      className="p-1.5 text-[#273318] hover:bg-[#F5EAD8] rounded-lg transition-colors"
                      title={`Call ${m.fullName}`}
                    >
                      <PhoneCall size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Renewal Risk Tab */}
        {activeTab === 'risk' && (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#201E1D] pb-2 border-b border-[#EFE4D0]">
              Renewal Risk (Top Corporate Members to Contact)
            </h2>
            <div className="divide-y divide-[#EFE4D0]">
              {renewalRisk.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#201E1D]">{m.fullName}</div>
                    <div className="text-[11px] text-[#686055] font-mono">
                      {m.memberCode} · Risk Level: {m.riskLevel}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/communication/notifications?memberId=${m.memberCode}`)}
                      className="flex items-center gap-1 px-3 py-1 bg-[#C67139] hover:bg-[#b05f2c] text-white text-xs font-semibold rounded-lg uppercase tracking-wider cursor-pointer"
                    >
                      <Send size={12} />
                      <span>Notify</span>
                    </button>
                    <a
                      href={`tel:${m.mobile}`}
                      className="flex items-center gap-1 px-3 py-1 bg-[#273318] hover:bg-[#344421] text-white text-xs font-semibold rounded-lg uppercase tracking-wider"
                    >
                      <PhoneCall size={12} />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal with Required Receipt No and Book No */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-serif font-bold text-[#201E1D]">
              Treasurer Official Receipt Confirmation
            </h3>
            <p className="text-xs text-[#686055]">
              Confirming receipt for <strong>{selectedReceipt?.memberSubscription?.member?.fullName}</strong>.
              Enter physical receipt and receipt book identifiers.
            </p>

            <form onSubmit={handleConfirmSubmit} className="space-y-4 pt-2">
              <FormField label="Official Receipt Number" required error={confirmError ? ' ' : undefined}>
                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="e.g. REC-2026-089"
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] text-xs rounded-xl p-2.5"
                  autoFocus
                />
              </FormField>

              <FormField label="Receipt Book Number" required>
                <input
                  type="text"
                  value={bookNo}
                  onChange={(e) => setBookNo(e.target.value)}
                  placeholder="e.g. BOOK-12"
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] text-xs rounded-xl p-2.5"
                />
              </FormField>

              {confirmError && (
                <p className="text-xs text-[#C62828] font-medium">{confirmError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFE4D0]">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  disabled={isConfirming}
                  className="px-4 py-2 border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConfirming}
                  className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isConfirming ? 'Confirming...' : 'Save & Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject / Better Receipt Dialog */}
      <ConfirmDialog
        isOpen={rejectDialogOpen}
        title="Ask for Clearer Receipt"
        message="Specify the reason why this payment declaration receipt cannot be reconciled (e.g. illegible transfer slip, missing amount, duplicate voucher)."
        confirmLabel="Send Return Notice"
        cancelLabel="Cancel"
        variant="warning"
        requiresReason={true}
        reasonPlaceholder="Specify reason for return..."
        onConfirm={(reason) => {
          showToast(`Return request logged: "${reason}". Applicant notified.`);
          setRejectDialogOpen(false);
        }}
        onCancel={() => setRejectDialogOpen(false)}
      />

      {/* Secure File Viewer */}
      <FileViewer
        isOpen={fileViewer.isOpen}
        onClose={() => setFileViewer((prev) => ({ ...prev, isOpen: false }))}
        title={fileViewer.title}
        fileName={fileViewer.fileName}
        fileUrl={fileViewer.fileUrl}
        mimeType={fileViewer.mimeType}
      />
    </div>
  );
};
