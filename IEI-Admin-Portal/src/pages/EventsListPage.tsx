import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Eye,
  Edit,
  QrCode,
} from 'lucide-react';
import { DataTable, ColumnDef } from '../components/DataTable';
import { SearchInput } from '../components/SearchInput';
import { FilterBar, FilterField } from '../components/FilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { apiClient } from '../services/api-client';

interface EventItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  isAcceptingRsvp: boolean;
  isOpenForGuest: boolean;
  rsvpsCount?: number;
}

export const EventsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    type: '',
    audience: '',
  });

  const [unpublishDialog, setUnpublishDialog] = useState<{
    isOpen: boolean;
    event: EventItem | null;
  }>({
    isOpen: false,
    event: null,
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient<EventItem[]>('/events');
      setEvents(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch programmes and events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filterFields: FilterField[] = [
    {
      key: 'type',
      label: 'Programme Type',
      options: [
        { label: "Engineers' Day", value: "ENGINEERS' DAY" },
        { label: 'Technical Seminar', value: 'TECHNICAL SEMINAR' },
        { label: 'Annual General Meeting', value: 'ANNUAL GENERAL MEETING' },
        { label: 'Ladies Wing', value: 'LADIES WING' },
        { label: 'Family Day', value: 'FAMILY DAY' },
        { label: 'AMIE Exam', value: 'AMIE WINTER EXAMINATION' },
      ],
    },
    {
      key: 'audience',
      label: 'Audience Tag',
      options: [
        { label: 'Open', value: 'Open' },
        { label: 'Members', value: 'Members' },
        { label: 'Family', value: 'Family' },
        { label: 'Students', value: 'Students' },
      ],
    },
  ];

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filters.type || e.category === filters.type;
    const matchesAudience = !filters.audience || e.badge === filters.audience;
    return matchesSearch && matchesType && matchesAudience;
  });

  const columns: ColumnDef<EventItem>[] = [
    {
      key: 'title',
      header: 'Event & Programme',
      sortable: true,
      render: (e) => (
        <div>
          <div className="font-semibold text-[#201E1D]">{e.title}</div>
          <div className="text-[11px] text-[#686055]">{e.location}</div>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Date & Time',
      sortable: true,
      render: (e) => (
        <div className="text-xs">
          <div className="font-medium text-[#201E1D]">{e.startDate}</div>
          <div className="text-[11px] text-[#8A7F73]">
            {e.startTime} – {e.endTime}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Type',
      render: (e) => (
        <span className="text-[10.5px] uppercase font-mono font-medium px-2 py-0.5 rounded bg-[#F5EAD8] text-[#273318] border border-[#E2D5C0]">
          {e.category}
        </span>
      ),
    },
    {
      key: 'badge',
      header: 'Audience',
      render: (e) => (
        <span className="text-[11px] font-medium text-[#686055] bg-[#EFE4D0] px-2 py-0.5 rounded-full">
          {e.badge}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (e) => <StatusBadge status={e.status || 'UPCOMING'} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (e) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => navigate(`/admin/events/${e.id}`)}
            className="p-1.5 text-[#273318] hover:bg-[#F5EAD8] rounded-lg transition-colors cursor-pointer"
            title="View event details"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => navigate(`/admin/events/${e.id}/check-in`)}
            className="p-1.5 text-[#C67139] hover:bg-[#F5EAD8] rounded-lg transition-colors cursor-pointer"
            title="Door Check-In Desk"
          >
            <QrCode size={15} />
          </button>
          <button
            onClick={() => navigate(`/admin/events/${e.id}/edit`)}
            className="p-1.5 text-[#686055] hover:bg-[#F5EAD8] rounded-lg transition-colors cursor-pointer"
            title="Edit event"
          >
            <Edit size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Create Event */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#201E1D]">
            Events & Chapter Programmes
          </h1>
          <p className="text-xs text-[#686055] mt-0.5">
            Technical seminars, AGM, Engineers' Day celebrations, and wing sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/events/new')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#273318] hover:bg-[#344421] text-[#F9F4ED] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search event title or venue..."
          />
        </div>
        <div className="md:col-span-2">
          <FilterBar
            fields={filterFields}
            selectedValues={filters}
            onChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
            onReset={() => setFilters({ type: '', audience: '' })}
          />
        </div>
      </div>

      {/* Events Table */}
      {isLoading ? (
        <SkeletonLoader type="table" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEvents} />
      ) : (
        <DataTable
          data={filteredEvents}
          columns={columns}
          keyExtractor={(e) => e.id}
          pageSize={10}
          emptyTitle="No events found"
          emptyMessage="No chapter events match the active search criteria."
        />
      )}

      {/* Unpublish Confirmation Dialog */}
      <ConfirmDialog
        isOpen={unpublishDialog.isOpen}
        title="Unpublish Programme Event"
        message={`Are you sure you want to unpublish "${unpublishDialog.event?.title}"? Unpublishing will hide it from member mobile apps and the public site.`}
        confirmLabel="Unpublish Event"
        cancelLabel="Keep Published"
        variant="warning"
        requiresReason={true}
        reasonPlaceholder="Specify reason for withdrawal..."
        onConfirm={(reason) => {
          showToast(`Event unpublished: "${reason}". Logged in audit ledger.`);
          setUnpublishDialog({ isOpen: false, event: null });
        }}
        onCancel={() => setUnpublishDialog({ isOpen: false, event: null })}
      />
    </div>
  );
};
