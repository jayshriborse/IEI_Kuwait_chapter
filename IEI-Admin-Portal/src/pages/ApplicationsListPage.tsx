import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { DataTable, ColumnDef } from '../components/DataTable';
import { SearchInput } from '../components/SearchInput';
import { Tabs, TabItem } from '../components/Tabs';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { apiClient } from '../services/api-client';

interface ApplicationRow {
  id: string;
  applicationNumber: string;
  fullName: string;
  mobile: string;
  email?: string;
  discipline: string;
  employer: string;
  designation: string;
  qualification: string;
  status: string;
  submittedAt: string;
  reviewer: string;
  documentsCount: number;
}

export const ApplicationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('status') || 'ALL';
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs: TabItem[] = [
    { id: 'ALL', label: 'All' },
    { id: 'AWAITING_REVIEW', label: 'Pending' },
    { id: 'UNDER_SCRUTINY', label: 'Under Review' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'REJECTED', label: 'Returned / Rejected' },
  ];

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (currentTab !== 'ALL') queryParams.set('status', currentTab);
      if (search) queryParams.set('search', search);

      const res = await apiClient<ApplicationRow[]>(
        `/admin/applications?${queryParams.toString()}`,
      );
      setApplications(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load membership applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 200);
    return () => clearTimeout(timer);
  }, [currentTab, search]);

  const handleTabChange = (newStatus: string) => {
    setSearchParams(newStatus === 'ALL' ? {} : { status: newStatus });
  };

  const columns: ColumnDef<ApplicationRow>[] = [
    {
      key: 'applicationNumber',
      header: 'Application ID',
      sortable: true,
      render: (a) => (
        <span className="font-mono font-bold text-[#273318]">
          {a.applicationNumber}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Applicant',
      sortable: true,
      render: (a) => (
        <div>
          <div className="font-semibold text-[#201E1D]">{a.fullName}</div>
          <div className="text-[11px] text-[#686055] font-mono">{a.mobile}</div>
        </div>
      ),
    },
    {
      key: 'discipline',
      header: 'Discipline & Qualification',
      render: (a) => (
        <div>
          <div className="font-medium text-[#201E1D]">{a.discipline}</div>
          <div className="text-[11px] text-[#8A7F73]">{a.qualification}</div>
        </div>
      ),
    },
    {
      key: 'employer',
      header: 'Employer',
      render: (a) => (
        <span className="text-xs text-[#201E1D]">{a.employer}</span>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      sortable: true,
      render: (a) => (
        <span className="text-xs text-[#8A7F73]">
          {new Date(a.submittedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (a) => <StatusBadge status={a.status} size="sm" />,
    },
    {
      key: 'reviewer',
      header: 'Current Reviewer',
      render: (a) => (
        <span className="text-xs font-medium text-[#273318] bg-[#F5EAD8] px-2 py-0.5 rounded border border-[#E2D5C0]">
          {a.reviewer}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (a) => (
        <button
          onClick={() => navigate(`/admin/membership-applications/${a.id}`)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#273318] hover:bg-[#344421] text-[#F9F4ED] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
        >
          <Eye size={13} />
          <span>View</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#201E1D]">
          Membership Applications Review
        </h1>
        <p className="text-xs text-[#686055] mt-0.5">
          General Secretary intake, Chairman endorsement, and charter qualification verification.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={currentTab} onChange={handleTabChange} />

      {/* Search Bar */}
      <div className="max-w-md">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search applicant name, ID, phone..."
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <SkeletonLoader type="table" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchApplications} />
      ) : (
        <DataTable
          data={applications}
          columns={columns}
          keyExtractor={(a) => a.id}
          pageSize={10}
          emptyTitle="No applications in this category"
          emptyMessage="No membership applications match the selected status filter."
        />
      )}
    </div>
  );
};
