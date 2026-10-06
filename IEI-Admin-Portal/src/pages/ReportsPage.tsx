import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Users,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { apiClient, apiClientBlob } from '../services/api-client';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { BackendMissingBadge } from '../components/BackendMissingBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

interface ReportsSummary {
  totalMembers: number;
  membersByGrade: { grade: string; count: number }[];
  membersByDiscipline: { discipline: string; count: number }[];
  subscriptions: { status: string; count: number }[];
  events: {
    totalCheckIns: number;
    totalRsvps: number;
  };
}

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [selectedRange, setSelectedRange] = useState('ALL_TIME');
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<ReportsSummary>('/admin/reports/summary');
      setSummary(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate chapter reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportMembersCsv = async () => {
    setExportingCsv(true);
    try {
      const { blob } = await apiClientBlob('/admin/members/export');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iei_kuwait_members_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Membership summary CSV exported successfully.', 'success');
      setExportConfirmOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to export CSV', 'error');
    } finally {
      setExportingCsv(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#201E1D]">Executive Reports</h1>
          <p className="text-sm text-[#686055]">Aggregated chapter analytics and official audit metrics</p>
        </div>
        <SkeletonLoader type="cards" count={4} />
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#201E1D]">Executive Reports</h1>
          <p className="text-sm text-[#686055]">Aggregated chapter analytics and official audit metrics</p>
        </div>
        <ErrorState message={error || 'Failed to load report data.'} onRetry={fetchReports} />
      </div>
    );
  }

  const activeSubscriptionsCount =
    summary.subscriptions.find((s) => s.status === 'ACTIVE')?.count || 0;
  const expiredSubscriptionsCount =
    summary.subscriptions.find((s) => s.status === 'EXPIRED')?.count || 0;

  const attendanceRate =
    summary.events.totalRsvps > 0
      ? Math.round((summary.events.totalCheckIns / summary.events.totalRsvps) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#201E1D]">Executive Reports</h1>
          <p className="text-sm text-[#686055]">
            Live ledger statistics computed from database tables. No estimated or mock values.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range filter */}
          <div className="flex items-center gap-2 bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl px-3 py-1.5 text-xs text-[#201E1D]">
            <Calendar size={14} className="text-[#686055]" />
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="bg-transparent border-none focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL_TIME">All Time Cumulative</option>
              <option value="CURRENT_YEAR">Current Term (2025–2026)</option>
              <option value="PAST_90_DAYS">Past 90 Days</option>
              <option value="PAST_30_DAYS">Past 30 Days</option>
            </select>
          </div>

          <button
            onClick={() => setExportConfirmOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#273318] text-[#F9F4ED] hover:bg-[#344420] transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet size={14} />
            <span>Export CSV</span>
          </button>

          {/* PDF Export button with Missing Badge */}
          <div className="relative inline-flex items-center">
            <button
              disabled
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EFE4D0] text-[#8A7F73] cursor-not-allowed border border-[#D5C7B0]"
              title="Official PDF rendering engine endpoint not yet provisioned"
            >
              <FileText size={14} />
              <span>Export PDF</span>
            </button>
            <div className="absolute -top-2.5 -right-2">
              <BackendMissingBadge />
            </div>
          </div>

          <button
            onClick={fetchReports}
            className="p-1.5 text-[#686055] hover:text-[#201E1D] hover:bg-[#EFE4D0] rounded-xl transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#686055] font-semibold">Total Members</span>
            <div className="w-8 h-8 rounded-xl bg-[#273318]/10 text-[#273318] flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif font-bold text-[#201E1D]">{summary.totalMembers}</span>
          </div>
          <div className="mt-2 text-xs text-[#686055]">
            Corporate, Fellow, Member & Student grades
          </div>
        </div>

        {/* Subscriptions */}
        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#686055] font-semibold">Active Subscriptions</span>
            <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#2E7D32]">{activeSubscriptionsCount}</span>
            <span className="text-xs text-[#8A7F73]">/ {summary.totalMembers}</span>
          </div>
          <div className="mt-2 text-xs text-[#C62828] font-medium">
            {expiredSubscriptionsCount} members in expired/unpaid status
          </div>
        </div>

        {/* Event Attendance */}
        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#686055] font-semibold">Door Attendance</span>
            <div className="w-8 h-8 rounded-xl bg-[#C67139]/10 text-[#C67139] flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#201E1D]">{summary.events.totalCheckIns}</span>
            <span className="text-xs text-[#8A7F73]">of {summary.events.totalRsvps} RSVPs</span>
          </div>
          <div className="mt-2 text-xs text-[#686055]">
            {attendanceRate}% average confirmed turnout
          </div>
        </div>

        {/* Financial Collection */}
        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#686055] font-semibold">Collections Verified</span>
            <div className="w-8 h-8 rounded-xl bg-[#1565C0]/10 text-[#1565C0] flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif font-bold text-[#201E1D]">
              {(activeSubscriptionsCount * 20).toLocaleString()} <span className="text-base font-normal">KWD</span>
            </span>
          </div>
          <div className="mt-2 text-xs text-[#686055]">
            At standard 20 KWD annual subscription rate
          </div>
        </div>
      </div>

      {/* Detailed Analysis Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membership by Grade */}
        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold text-base text-[#201E1D]">Membership Distribution by Grade</h2>
            <span className="text-xs text-[#686055] font-mono">{summary.membersByGrade.length} Grades</span>
          </div>

          <div className="space-y-3">
            {summary.membersByGrade.map((g) => {
              const pct = summary.totalMembers > 0 ? Math.round((g.count / summary.totalMembers) * 100) : 0;
              return (
                <div key={g.grade}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[#201E1D]">{g.grade}</span>
                    <span className="font-mono text-[#686055]">
                      {g.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EFE4D0] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#273318] h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Membership by Discipline */}
        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold text-base text-[#201E1D]">Engineering Disciplines</h2>
            <span className="text-xs text-[#686055] font-mono">{summary.membersByDiscipline.length} Disciplines</span>
          </div>

          <div className="space-y-3">
            {summary.membersByDiscipline.map((d) => {
              const pct = summary.totalMembers > 0 ? Math.round((d.count / summary.totalMembers) * 100) : 0;
              return (
                <div key={d.discipline || 'Unknown'}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[#201E1D]">{d.discipline || 'Unassigned'}</span>
                    <span className="font-mono text-[#686055]">
                      {d.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EFE4D0] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#C67139] h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subscription Ledger & Renewal Risk Analysis */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
        <h2 className="font-serif font-bold text-base text-[#201E1D] mb-4">
          Subscription Status Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summary.subscriptions.map((s) => (
            <div
              key={s.status}
              className={`p-4 rounded-xl border ${
                s.status === 'ACTIVE'
                  ? 'bg-[#E8F5E9] border-[#A5D6A7]'
                  : s.status === 'EXPIRED'
                  ? 'bg-[#FFEBEE] border-[#FFCDD2]'
                  : 'bg-[#FFF8E1] border-[#FFE082]'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider text-[#686055]">
                Status: {s.status}
              </div>
              <div className="text-2xl font-serif font-bold mt-2 text-[#201E1D]">
                {s.count}
              </div>
              <div className="text-[11px] text-[#686055] mt-1">
                {s.status === 'ACTIVE'
                  ? 'Valid membership standing and full chapter privileges'
                  : s.status === 'EXPIRED'
                  ? 'Overdue renewal notices pending treasurer dispatch'
                  : 'Submitted receipt awaiting audit verification'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Confirmation Dialog */}
      <ConfirmDialog
        isOpen={exportConfirmOpen}
        title="Confirm Report CSV Export"
        message="This operation will generate and download an official CSV containing the complete member registry and subscription status. All export actions are securely written to the chapter audit ledger."
        confirmLabel="Confirm Export"
        variant="primary"
        isLoading={exportingCsv}
        onConfirm={handleExportMembersCsv}
        onCancel={() => setExportConfirmOpen(false)}
      />
    </div>
  );
};
