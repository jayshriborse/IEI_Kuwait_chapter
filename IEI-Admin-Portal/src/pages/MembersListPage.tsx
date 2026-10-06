import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Upload, Eye, Edit, Send } from 'lucide-react';
import { DataTable, ColumnDef } from '../components/DataTable';
import { SearchInput } from '../components/SearchInput';
import { FilterBar, FilterField } from '../components/FilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { BackendMissingBadge } from '../components/BackendMissingBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { apiClient, apiClientBlob } from '../services/api-client';

interface MemberItem {
  id: string;
  memberCode: string;
  fullName: string;
  grade: string;
  discipline: string;
  mobile: string;
  email?: string | null;
  bloodGroup?: string | null;
  status: string;
  subscriptionStatus: string;
  latestPeriod: string;
  joinedAt: string;
  positions: string[];
}

export const MembersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    grade: '',
    discipline: '',
    status: '',
  });

  // Bulk Selection
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Export Confirmation Dialog
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (filters.grade) queryParams.set('grade', filters.grade);
      if (filters.discipline) queryParams.set('discipline', filters.discipline);

      const res = await apiClient<MemberItem[]>(
        `/admin/members?${queryParams.toString()}`,
      );
      setMembers(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chapter members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, filters]);

  const handleExportConfirm = async () => {
    setIsExporting(true);
    try {
      const { blob } = await apiClientBlob('/admin/members/export', {
        method: 'POST',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iei-kuwait-members-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showToast('Members ledger exported to CSV and logged to audit ledger.');
      setExportDialogOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to export members ledger', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const filterFields: FilterField[] = [
    {
      key: 'grade',
      label: 'Grade',
      options: [
        { label: 'FIE (Fellow)', value: 'FIE' },
        { label: 'MIE (Member)', value: 'MIE' },
        { label: 'AMIE (Associate)', value: 'AMIE' },
        { label: 'TIE (Technician)', value: 'TIE' },
        { label: 'SMIE (Senior)', value: 'SMIE' },
      ],
    },
    {
      key: 'discipline',
      label: 'Discipline',
      options: [
        { label: 'Civil', value: 'Civil' },
        { label: 'Electrical', value: 'Electrical' },
        { label: 'Mechanical', value: 'Mechanical' },
        { label: 'Electronics & Comm', value: 'Electronics' },
      ],
    },
  ];

  const columns: ColumnDef<MemberItem>[] = [
    {
      key: 'memberCode',
      header: 'Member ID',
      sortable: true,
      render: (m) => (
        <span className="font-mono font-bold text-[#273318]">{m.memberCode}</span>
      ),
    },
    {
      key: 'fullName',
      header: 'Name',
      sortable: true,
      render: (m) => (
        <div>
          <div className="font-semibold text-[#201E1D]">{m.fullName}</div>
          {m.positions && m.positions.length > 0 && (
            <div className="text-[10px] text-[#A9B890] font-mono">
              {m.positions.join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      sortable: true,
      render: (m) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#F5EAD8] text-[#273318] border border-[#E2D5C0]">
          {m.grade}
        </span>
      ),
    },
    {
      key: 'discipline',
      header: 'Discipline',
      sortable: true,
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (m) => <span className="font-mono text-xs">{m.mobile}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (m) => <span className="text-xs text-[#686055]">{m.email || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (m) => <StatusBadge status={m.status} size="sm" />,
    },
    {
      key: 'subscriptionStatus',
      header: 'Subscription',
      sortable: true,
      render: (m) => <StatusBadge status={m.subscriptionStatus} size="sm" />,
    },
    {
      key: 'joinedAt',
      header: 'Joined',
      sortable: true,
      render: (m) => (
        <span className="text-xs text-[#8A7F73]">
          {new Date(m.joinedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => navigate(`/admin/members/${m.id}`)}
            className="p-1 text-[#273318] hover:bg-[#F5EAD8] rounded-lg transition-colors cursor-pointer"
            title="View member profile"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => navigate(`/admin/members/${m.id}?edit=true`)}
            className="p-1 text-[#C67139] hover:bg-[#F5EAD8] rounded-lg transition-colors cursor-pointer"
            title="Edit member details"
          >
            <Edit size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#201E1D]">
            Chapter Members Directory
          </h1>
          <p className="text-xs text-[#686055] mt-0.5">
            Registered corporate and associate members in official chapter records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import members (missing in backend) */}
          <div className="flex items-center gap-1.5">
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-2 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-xl cursor-not-allowed border border-[#E2D5C0]"
            >
              <Upload size={14} />
              <span>Import</span>
            </button>
            <BackendMissingBadge />
          </div>

          {/* Export Members */}
          <button
            onClick={() => setExportDialogOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#273318] hover:bg-[#344421] text-[#F9F4ED] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (when selected) */}
      {selectedKeys.length > 0 && (
        <div className="p-3 bg-[#FFFDF9] border border-[#273318] rounded-xl flex items-center justify-between shadow-xs">
          <div className="text-xs font-semibold text-[#201E1D]">
            {selectedKeys.length} members selected for bulk action
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigate(
                  `/admin/communication/notifications?bulkIds=${selectedKeys.join(',')}`,
                );
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C67139] hover:bg-[#b05f2c] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              <Send size={13} />
              <span>Bulk Notify</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search name, Member ID, mobile..."
          />
        </div>
        <div className="md:col-span-2">
          <FilterBar
            fields={filterFields}
            selectedValues={filters}
            onChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
            onReset={() => setFilters({ grade: '', discipline: '', status: '' })}
          />
        </div>
      </div>

      {/* Content State */}
      {isLoading ? (
        <SkeletonLoader type="table" count={7} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMembers} />
      ) : (
        <DataTable
          data={members}
          columns={columns}
          keyExtractor={(m) => m.id}
          pageSize={10}
          selectable={true}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          emptyTitle="No members match search"
          emptyMessage="Try adjusting your search terms or clearing active filters."
        />
      )}

      {/* Export Confirmation Dialog */}
      <ConfirmDialog
        isOpen={exportDialogOpen}
        title="Confirm Member Ledger Export"
        message="This operation exports all registered members along with contact and subscription details. The export will be logged with your Officer credentials in the permanent audit ledger."
        confirmLabel="Download CSV Export"
        cancelLabel="Cancel"
        variant="primary"
        isLoading={isExporting}
        onConfirm={handleExportConfirm}
        onCancel={() => setExportDialogOpen(false)}
      />
    </div>
  );
};
