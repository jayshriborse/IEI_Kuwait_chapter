import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck,
  CreditCard,
  Calendar,
  UserCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  PhoneCall,
} from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { apiClient } from '../services/api-client';

interface DashboardData {
  kpis: {
    totalMembers: number;
    pendingApplications: number;
    receiptsAwaitingConfirmation: number;
    upcomingEvents: number;
    totalRsvps: number;
    duesUnpaid: number;
  };
  applicationCounts: {
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    total: number;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    status: string;
    badge: string;
  }>;
  recentApplications: Array<{
    id: string;
    applicationNumber: string;
    applicant: string;
    discipline: string;
    date: string;
    status: string;
  }>;
  renewalRisk: Array<{
    id: string;
    memberCode: string;
    fullName: string;
    mobile: string;
    grade: string;
    memberSinceYear?: number;
    riskLevel: string;
  }>;
  recentActivity: Array<{
    id: string;
    actor: string;
    actorCode: string;
    action: string;
    entity: string;
    entityId: string;
    time: string;
  }>;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient<DashboardData>('/admin/dashboard');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch executive dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="cards" count={6} />
        <SkeletonLoader type="table" count={4} />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error || 'Unable to retrieve dashboard.'} onRetry={fetchDashboard} />;
  }

  const { kpis, applicationCounts, upcomingEvents, recentApplications, renewalRisk, recentActivity } = data;

  return (
    <div className="space-y-7">
      {/* Page Title & Chapter Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#201E1D]">
            Executive Chapter Dashboard
          </h1>
          <p className="text-xs text-[#686055] mt-0.5">
            Real-time status overview from official chapter registry & audit ledgers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/reports')}
            className="px-3.5 py-1.5 bg-[#FFFDF9] border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold text-[#201E1D] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            View Reports
          </button>
        </div>
      </div>

      {/* 6 Real KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Members"
          value={kpis.totalMembers}
          subtitle="Enrolled Corporate & Associate"
          icon={<Users size={18} />}
          actionLabel="View Members"
          onAction={() => navigate('/admin/members')}
          accent="forest"
        />
        <KpiCard
          title="Pending Applications"
          value={kpis.pendingApplications}
          subtitle="Under intake & scrutiny"
          icon={<FileCheck size={18} />}
          actionLabel="View Applications"
          onAction={() => navigate('/admin/membership-applications')}
          accent="gold"
        />
        <KpiCard
          title="Receipts Awaiting"
          value={kpis.receiptsAwaitingConfirmation}
          subtitle="Submitted declarations"
          icon={<CreditCard size={18} />}
          actionLabel="View Receipts"
          onAction={() => navigate('/admin/subscriptions')}
          accent="terracotta"
        />
        <KpiCard
          title="Upcoming Events"
          value={kpis.upcomingEvents}
          subtitle="Scheduled programmes"
          icon={<Calendar size={18} />}
          actionLabel="View Events"
          onAction={() => navigate('/admin/events')}
        />
        <KpiCard
          title="Total RSVPs"
          value={kpis.totalRsvps}
          subtitle="Registered attendees"
          icon={<UserCheck size={18} />}
          actionLabel="View Participants"
          onAction={() => navigate('/admin/events')}
        />
        <KpiCard
          title="Dues Unpaid"
          value={kpis.duesUnpaid}
          subtitle="2026-27 Active period"
          icon={<AlertCircle size={18} />}
          actionLabel="View Unpaid"
          onAction={() => navigate('/admin/subscriptions')}
          accent="terracotta"
        />
      </div>

      {/* Main Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Application Counts & Upcoming Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Panel: Application Status Counts */}
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE4D0]">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-[#273318]" />
                <h2 className="text-sm font-serif font-bold text-[#201E1D]">
                  Application Scrutiny Pipeline
                </h2>
              </div>
              <button
                onClick={() => navigate('/admin/membership-applications')}
                className="text-xs font-semibold text-[#C67139] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Applications</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div
                onClick={() => navigate('/admin/membership-applications?status=AWAITING_REVIEW')}
                className="bg-[#FFF3E0]/70 border border-[#FFE0B2] rounded-xl p-3 text-center cursor-pointer hover:shadow-xs transition-shadow"
              >
                <div className="text-xl font-serif font-bold text-[#E65100]">
                  {applicationCounts.pending}
                </div>
                <div className="text-[11px] font-semibold text-[#8C3B00] uppercase tracking-wider mt-1">
                  Pending Intake
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/membership-applications?status=UNDER_SCRUTINY')}
                className="bg-[#FFF8E1]/80 border border-[#FFE082] rounded-xl p-3 text-center cursor-pointer hover:shadow-xs transition-shadow"
              >
                <div className="text-xl font-serif font-bold text-[#B78103]">
                  {applicationCounts.underReview}
                </div>
                <div className="text-[11px] font-semibold text-[#7A5600] uppercase tracking-wider mt-1">
                  Under Scrutiny
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/membership-applications?status=APPROVED')}
                className="bg-[#E8F5E9]/80 border border-[#C8E6C9] rounded-xl p-3 text-center cursor-pointer hover:shadow-xs transition-shadow"
              >
                <div className="text-xl font-serif font-bold text-[#2E7D32]">
                  {applicationCounts.approved}
                </div>
                <div className="text-[11px] font-semibold text-[#1B5E20] uppercase tracking-wider mt-1">
                  Approved
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/membership-applications?status=REJECTED')}
                className="bg-[#FFEBEE]/80 border border-[#FFCDD2] rounded-xl p-3 text-center cursor-pointer hover:shadow-xs transition-shadow"
              >
                <div className="text-xl font-serif font-bold text-[#C62828]">
                  {applicationCounts.rejected}
                </div>
                <div className="text-[11px] font-semibold text-[#B71C1C] uppercase tracking-wider mt-1">
                  Returned / Rejected
                </div>
              </div>
            </div>
          </div>

          {/* Panel: Upcoming Events */}
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE4D0]">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#273318]" />
                <h2 className="text-sm font-serif font-bold text-[#201E1D]">
                  Upcoming Chapter Programmes
                </h2>
              </div>
              <button
                onClick={() => navigate('/admin/events')}
                className="text-xs font-semibold text-[#C67139] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Events</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="divide-y divide-[#EFE4D0] pt-1">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-[#201E1D] truncate">
                        {event.title}
                      </h3>
                      <StatusBadge status={event.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-[#686055] mt-0.5">
                      {event.date} · {event.time} · {event.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/admin/events/${event.id}`)}
                      className="px-2.5 py-1 text-xs font-medium text-[#273318] hover:bg-[#F5EAD8] rounded-lg transition-colors cursor-pointer"
                    >
                      View Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel: Recent Applications */}
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE4D0]">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#273318]" />
                <h2 className="text-sm font-serif font-bold text-[#201E1D]">
                  Recent Applications
                </h2>
              </div>
              <button
                onClick={() => navigate('/admin/membership-applications')}
                className="text-xs font-semibold text-[#C67139] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {recentApplications.length === 0 ? (
              <p className="text-xs text-[#8A7F73] py-4 text-center">
                No recent applications found in database.
              </p>
            ) : (
              <div className="divide-y divide-[#EFE4D0] pt-1">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[#201E1D] truncate">
                        {app.applicant}
                      </div>
                      <div className="text-[11px] text-[#8A7F73] font-mono">
                        {app.applicationNumber} · {app.discipline}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={app.status} size="sm" />
                      <button
                        onClick={() => navigate(`/admin/membership-applications/${app.id}`)}
                        className="text-xs font-medium text-[#273318] hover:text-[#C67139] transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Renewal Risk & Audit Activity */}
        <div className="space-y-6">
          {/* Panel: Renewal Risk */}
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE4D0]">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-[#C67139]" />
                <h2 className="text-sm font-serif font-bold text-[#201E1D]">
                  Renewal Risk (Top Members)
                </h2>
              </div>
              <button
                onClick={() => navigate('/admin/subscriptions')}
                className="text-xs font-semibold text-[#C67139] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {renewalRisk.length === 0 ? (
              <p className="text-xs text-[#8A7F73] py-4 text-center">
                No active members with overdue subscription.
              </p>
            ) : (
              <div className="divide-y divide-[#EFE4D0] pt-1">
                {renewalRisk.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#201E1D] truncate">
                        {item.fullName}
                      </div>
                      <div className="text-[11px] text-[#8A7F73] font-mono">
                        {item.memberCode} · Member since {item.memberSinceYear || '—'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                        {item.riskLevel}
                      </span>
                      <a
                        href={`tel:${item.mobile}`}
                        className="p-1 text-[#273318] hover:bg-[#F5EAD8] rounded-lg transition-colors cursor-pointer"
                        title={`Call ${item.fullName}`}
                      >
                        <PhoneCall size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel: Audit Log Activity */}
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE4D0]">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-[#273318]" />
                <h2 className="text-sm font-serif font-bold text-[#201E1D]">
                  Recent Audit Ledger
                </h2>
              </div>
              <button
                onClick={() => navigate('/admin/settings')}
                className="text-xs font-semibold text-[#C67139] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Audit Logs</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-[#8A7F73] py-4 text-center">
                No recent activity recorded in chapter audit ledger.
              </p>
            ) : (
              <div className="divide-y divide-[#EFE4D0] pt-1">
                {recentActivity.slice(0, 5).map((log) => (
                  <div key={log.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#201E1D] truncate">
                        {log.actor}
                      </span>
                      <span className="text-[10px] text-[#8A7F73] font-mono shrink-0">
                        {new Date(log.time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#686055] font-mono mt-0.5 truncate">
                      {log.action} · {log.entity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
