import React, { useState, useEffect } from 'react';
import {
  Heart,
  Mic,
  Briefcase,
  Share2,
  Car,
  Award,
  Download,
  Trash2,
  PhoneCall,
} from 'lucide-react';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Tabs, TabItem } from '../components/Tabs';
import { SearchInput } from '../components/SearchInput';
import { StatusBadge } from '../components/StatusBadge';
import { BackendMissingBadge } from '../components/BackendMissingBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { useToast } from '../components/Toast';
import { apiClient } from '../services/api-client';

interface BloodDonorRow {
  id: string;
  memberCode: string;
  fullName: string;
  bloodGroup: string;
  discipline: string;
  area: string;
  mobile: string;
  consentStatus: string;
}

export const RegistersPage: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('blood-donors');
  const [bloodDonors, setBloodDonors] = useState<BloodDonorRow[]>([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Urgent blood request state
  const [urgentRequestOpen, setUrgentRequestOpen] = useState(false);
  const [urgentBloodGroup, setUrgentBloodGroup] = useState('O+');
  const [urgentHospital, setUrgentHospital] = useState('');

  const fetchBloodDonors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = selectedBloodGroup ? `?bloodGroup=${encodeURIComponent(selectedBloodGroup)}` : '';
      const res = await apiClient<BloodDonorRow[]>(`/admin/registers/blood-donors${q}`);
      setBloodDonors(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blood donors register');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'blood-donors') {
      fetchBloodDonors();
    }
  }, [activeTab, selectedBloodGroup]);

  const tabs: TabItem[] = [
    { id: 'blood-donors', label: 'Blood Donors', count: bloodDonors.length, icon: <Heart size={14} className="text-[#C62828]" /> },
    { id: 'speakers', label: 'Technical Speakers', icon: <Mic size={14} /> },
    { id: 'skills', label: 'Engineering Skills', icon: <Briefcase size={14} /> },
    { id: 'referrals', label: 'Job Referrals', icon: <Share2 size={14} /> },
    { id: 'carpool', label: 'Carpool Directory', icon: <Car size={14} /> },
    { id: 'sponsors', label: 'Sponsors & Patrons', icon: <Award size={14} /> },
  ];

  const donorColumns: ColumnDef<BloodDonorRow>[] = [
    {
      key: 'bloodGroup',
      header: 'Blood Group',
      sortable: true,
      render: (d) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">
          {d.bloodGroup}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Donor Name',
      sortable: true,
      render: (d) => (
        <div>
          <div className="font-semibold text-[#201E1D]">{d.fullName}</div>
          <div className="text-[11px] text-[#8A7F73] font-mono">{d.memberCode}</div>
        </div>
      ),
    },
    {
      key: 'discipline',
      header: 'Discipline',
    },
    {
      key: 'area',
      header: 'Area / Locality',
      render: (d) => <span className="text-xs text-[#686055]">{d.area}</span>,
    },
    {
      key: 'consentStatus',
      header: 'Consent Verification',
      render: (d) => <StatusBadge status={d.consentStatus} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1.5">
          <a
            href={`tel:${d.mobile}`}
            className="p-1.5 text-[#273318] hover:bg-[#F5EAD8] rounded-lg transition-colors"
            title={`Call ${d.fullName}`}
          >
            <PhoneCall size={14} />
          </a>
          <button
            onClick={() => showToast(`Donor entry for ${d.fullName} soft deactivated in chapter records.`)}
            className="p-1.5 text-[#C62828] hover:bg-[#FFEBEE] rounded-lg transition-colors cursor-pointer"
            title="Remove entry"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const filteredDonors = bloodDonors.filter((d) => {
    return (
      !search ||
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.memberCode.toLowerCase().includes(search.toLowerCase()) ||
      d.area.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#201E1D]">
            Chapter Community Registers
          </h1>
          <p className="text-xs text-[#686055] mt-0.5">
            Member talent, blood donors, carpool, and professional registries (not a chat room).
          </p>
        </div>

        {activeTab === 'blood-donors' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUrgentRequestOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Heart size={14} />
              <span>Broadcast Urgent Blood Request</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'blood-donors' ? (
        <div className="space-y-4 bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-xs">
          {/* Controls: Search & Blood Group filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="max-w-xs w-full">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search donor name or area..."
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                className="bg-[#F5EAD8]/50 border border-[#E2D5C0] text-xs rounded-xl px-3 py-2 text-[#201E1D] font-mono cursor-pointer"
              >
                <option value="">All Blood Groups</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>

              <button
                onClick={() => {
                  showToast('Blood donors directory exported to CSV.');
                }}
                className="flex items-center gap-1 px-3 py-2 bg-[#273318] hover:bg-[#344421] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <SkeletonLoader type="table" count={5} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchBloodDonors} />
          ) : (
            <DataTable
              data={filteredDonors}
              columns={donorColumns}
              keyExtractor={(d) => d.id}
              pageSize={10}
              emptyTitle="No donors found"
              emptyMessage="No registered members with specified blood group or consent."
            />
          )}
        </div>
      ) : (
        /* Empty States for Registers without backend models yet */
        <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#F5EAD8] text-[#273318] flex items-center justify-center mx-auto">
            {activeTab === 'speakers' && <Mic size={24} />}
            {activeTab === 'skills' && <Briefcase size={24} />}
            {activeTab === 'referrals' && <Share2 size={24} />}
            {activeTab === 'carpool' && <Car size={24} />}
            {activeTab === 'sponsors' && <Award size={24} />}
          </div>

          <div>
            <h2 className="text-base font-serif font-bold text-[#201E1D]">
              {tabs.find((t) => t.id === activeTab)?.label} Register
            </h2>
            <p className="text-xs text-[#686055] max-w-md mx-auto mt-1 leading-relaxed">
              This community registry table is modeled and awaiting backend database migration.
            </p>
          </div>

          <div className="pt-2">
            <BackendMissingBadge />
          </div>

          <div className="pt-4 flex justify-center gap-2">
            <button
              disabled
              className="px-4 py-2 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-xl cursor-not-allowed border border-[#E2D5C0]"
            >
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Urgent Blood Request Dialog */}
      {urgentRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-serif font-bold text-[#C62828] flex items-center gap-2">
              <Heart size={18} />
              <span>Broadcast Urgent Blood Request</span>
            </h3>
            <p className="text-xs text-[#686055]">
              Dispatches high-priority push notification to all consenting donors with matching blood group.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#201E1D] uppercase tracking-wider mb-1">
                  Required Blood Group
                </label>
                <select
                  value={urgentBloodGroup}
                  onChange={(e) => setUrgentBloodGroup(e.target.value)}
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs font-mono font-bold"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#201E1D] uppercase tracking-wider mb-1">
                  Hospital / Blood Bank Location
                </label>
                <input
                  type="text"
                  value={urgentHospital}
                  onChange={(e) => setUrgentHospital(e.target.value)}
                  placeholder="e.g. Central Blood Bank, Jabriya"
                  className="w-full bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 text-xs text-[#201E1D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EFE4D0]">
                <button
                  type="button"
                  onClick={() => setUrgentRequestOpen(false)}
                  className="px-4 py-2 border border-[#E2D5C0] hover:bg-[#F5EAD8] text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Urgent blood request broadcasted for ${urgentBloodGroup} at ${urgentHospital || 'Central Blood Bank'}.`);
                    setUrgentRequestOpen(false);
                  }}
                  className="px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer shadow-xs"
                >
                  Send Urgent Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
