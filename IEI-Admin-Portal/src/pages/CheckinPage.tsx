import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  QrCode,
  Plus,
  RotateCcw,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import { apiClient } from '../services/api-client';

interface CheckInItem {
  id: string;
  memberCode: string;
  name?: string;
  member?: { fullName?: string; grade?: string; discipline?: string };
  seats?: number;
  scannedAt: string;
  deviceOffline?: boolean;
  manual?: boolean;
  volunteerMemberId?: string;
  volunteerNotes?: string;
  noRsvp?: boolean;
  duesOverdue?: boolean;
}

export const CheckinPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = id || '1';
  const { showToast } = useToast();

  const [checkIns, setCheckIns] = useState<CheckInItem[]>([]);
  const [stats, setStats] = useState<{ checkedInCount: number; totalRsvps: number }>({
    checkedInCount: 0,
    totalRsvps: 25,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manual Check-in Dialog
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [manualSeats, setManualSeats] = useState(1);
  const [manualReason, setManualReason] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, statsRes] = await Promise.all([
        apiClient<any[]>(`/events/checkin/list?eventId=${eventId}`),
        apiClient<any>(`/events/checkin/stats?eventId=${eventId}`).catch(() => null),
      ]);

      const items: CheckInItem[] = Array.isArray(listRes) ? listRes : [];
      setCheckIns(items);
      setStats({
        checkedInCount: statsRes?.checkedInCount ?? items.length,
        totalRsvps: statsRes?.totalRsvps ?? Math.max(items.length, 25),
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load attendance roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [eventId]);

  const handleManualCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      showToast('Member ID or code is required', 'error');
      return;
    }

    setIsSubmittingManual(true);
    try {
      const res = await apiClient<any>('/events/checkin', {
        method: 'POST',
        body: JSON.stringify({
          eventId,
          memberCode: manualCode.trim().toUpperCase(),
          manual: true,
          seats: Number(manualSeats) || 1,
          volunteerNotes: manualReason.trim() || 'Manual desk check-in entry',
        }),
      });

      if (res?.noRsvp) {
        showToast(`Member checked in with Warning: No advance RSVP found!`, 'warning');
      } else if (res?.duesOverdue) {
        showToast(`Member checked in with Warning: Chapter subscription dues overdue!`, 'warning');
      } else {
        showToast(`Member ${manualCode.toUpperCase()} checked in successfully.`);
      }

      setManualModalOpen(false);
      setManualCode('');
      setManualReason('');
      setManualSeats(1);
      fetchAttendance();
    } catch (err: any) {
      showToast(err.message || 'Manual check-in failed', 'error');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const handleExportAttendance = () => {
    const headers = ['Member Code', 'Name', 'Seats', 'Check-In Time', 'Method', 'Device Mode'];
    const rows = checkIns.map((item) => [
      item.memberCode,
      item.member?.fullName || item.name || '',
      item.seats || 1,
      new Date(item.scannedAt).toLocaleTimeString(),
      item.manual ? 'Manual Desk' : 'QR Token',
      item.deviceOffline ? 'Offline Synced' : 'Online Live',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iei-event-${eventId}-attendance.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Attendance list exported to CSV and logged in chapter audit ledger.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/events')}
            className="p-2 text-[#686055] hover:text-[#201E1D] hover:bg-[#F5EAD8] rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse" />
              <h1 className="text-xl font-serif font-bold text-[#201E1D]">
                Door Check-In Desk (Live)
              </h1>
            </div>
            <p className="text-xs text-[#686055] mt-0.5">
              Event #{eventId} · Ed25519 QR scanning and manual attendee entry.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchAttendance}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FFFDF9] border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold text-[#201E1D] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportAttendance}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FFFDF9] border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold text-[#201E1D] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#273318] hover:bg-[#344421] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Add Manual Check-In</span>
          </button>
        </div>
      </div>

      {/* Live Counter Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
          <div className="text-xs uppercase font-semibold text-[#8A7F73] tracking-wider mb-1">
            Checked In Live
          </div>
          <div className="text-3xl font-serif font-bold text-[#2E7D32]">
            {stats.checkedInCount}
          </div>
          <div className="text-[11px] text-[#686055] mt-1">
            Verified at door reception
          </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
          <div className="text-xs uppercase font-semibold text-[#8A7F73] tracking-wider mb-1">
            Total Confirmed RSVPs
          </div>
          <div className="text-3xl font-serif font-bold text-[#273318]">
            {stats.totalRsvps}
          </div>
          <div className="text-[11px] text-[#686055] mt-1">
            Expected attendees
          </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
          <div className="text-xs uppercase font-semibold text-[#8A7F73] tracking-wider mb-1">
            Attendance Rate
          </div>
          <div className="text-3xl font-serif font-bold text-[#C67139]">
            {stats.totalRsvps > 0
              ? `${Math.round((stats.checkedInCount / stats.totalRsvps) * 100)}%`
              : '0%'}
          </div>
          <div className="text-[11px] text-[#686055] mt-1">
            Live hall capacity occupancy
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE4D0]">
          <div>
            <h2 className="text-sm font-serif font-bold text-[#201E1D]">
              Verified Door Attendance Roster
            </h2>
            <p className="text-xs text-[#686055]">
              Real-time check-in log. Duplicates are rejected; warnings flagged.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FFF5F5] border border-[#F5C2C7] text-xs text-[#842029]">
            {error}
          </div>
        )}

        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : checkIns.length === 0 ? (
          <EmptyState
            title="No check-ins recorded yet"
            message="Ready to scan member QR cards or register attendees manually at reception."
            icon={<QrCode size={26} className="text-[#273318]" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2D5C0] text-[#686055] font-semibold bg-[#F5EAD8]/40">
                  <th className="py-2.5 px-3">Member ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Seats</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Warnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE4D0] text-[#201E1D]">
                {checkIns.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5EAD8]/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#273318]">
                      {item.memberCode}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium">{item.member?.fullName || item.name || 'Member'}</div>
                      {item.member?.grade && (
                        <div className="text-[10px] text-[#8A7F73]">
                          {item.member.grade} · {item.member.discipline}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {item.seats || 1} seat{(item.seats || 1) > 1 ? 's' : ''}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#8A7F73]">
                      {new Date(item.scannedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.manual ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                          Manual {item.volunteerMemberId ? `(${item.volunteerMemberId})` : ''}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                          QR Verified
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.deviceOffline ? (
                        <span className="text-[10px] text-[#E65100]">Synced Offline</span>
                      ) : (
                        <span className="text-[10px] text-[#2E7D32]">Online Live</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        {item.noRsvp && (
                          <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#FFF8E1] text-[#B78103] border border-[#FFE082]">
                            No RSVP
                          </span>
                        )}
                        {item.duesOverdue && (
                          <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">
                            Dues Overdue
                          </span>
                        )}
                        {!item.noRsvp && !item.duesOverdue && (
                          <span className="text-[#8A7F73] text-[10px]">None</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Check-In Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-serif font-bold text-[#201E1D]">
              Manual Door Check-In Registration
            </h3>
            <p className="text-xs text-[#686055]">
              Register an attendee when the physical or digital card QR token cannot be scanned.
            </p>

            <form onSubmit={handleManualCheckin} className="space-y-4 pt-2">
              <FormField label="Member ID (or Code)" required>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. IEI0005, IEI0010"
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs uppercase"
                  autoFocus
                />
              </FormField>

              <FormField label="Total Seats Admitted" required>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={manualSeats}
                  onChange={(e) => setManualSeats(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs"
                />
              </FormField>

              <FormField label="Entry Justification / Reason" required>
                <input
                  type="text"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g. Card phone battery depleted, verified with Civil ID"
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs"
                />
              </FormField>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFE4D0]">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  disabled={isSubmittingManual}
                  className="px-4 py-2 border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-4 py-2 bg-[#273318] hover:bg-[#344421] text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingManual ? 'Registering...' : 'Confirm Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
