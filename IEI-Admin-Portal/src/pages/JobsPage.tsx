import React, { useState } from 'react';
import { Briefcase, CheckCircle, XCircle, Eye, Plus } from 'lucide-react';
import { BackendMissingBadge } from '../components/BackendMissingBadge';
import { Tabs, TabItem } from '../components/Tabs';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export const JobsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [refuseDialogOpen, setRefuseDialogOpen] = useState(false);

  const tabs: TabItem[] = [
    { id: 'pending', label: 'Pending Review', count: 0 },
    { id: 'published', label: 'Published Vacancies', count: 0 },
    { id: 'refused', label: 'Refused Vacancies', count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#201E1D]">
            Engineering Jobs & Vacancy Review
          </h1>
          <p className="text-xs text-[#686055] mt-0.5">
            Review recruitment postings to protect members from fee-charging agencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-xl cursor-not-allowed border border-[#E2D5C0]"
          >
            <Plus size={14} />
            <span>Post Vacancy</span>
          </button>
          <BackendMissingBadge />
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Action Buttons Toolbar (Rendered and disabled with badges) */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#686055]">
          Vacancy Actions
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled
            className="flex items-center gap-1 px-3 py-1.5 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed"
          >
            <CheckCircle size={13} />
            <span>Approve</span>
          </button>

          <button
            disabled
            onClick={() => setRefuseDialogOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#FFF5F5] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed border border-[#FFCDD2]"
          >
            <XCircle size={13} />
            <span>Refuse (with reason)</span>
          </button>

          <button
            disabled
            className="flex items-center gap-1 px-3 py-1.5 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed"
          >
            <span>Unpublish</span>
          </button>

          <button
            disabled
            className="flex items-center gap-1 px-3 py-1.5 bg-[#F5EAD8] text-[#8A7F73] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed"
          >
            <Eye size={13} />
            <span>View Applications</span>
          </button>

          <BackendMissingBadge />
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-10 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#F5EAD8] text-[#273318] flex items-center justify-center mx-auto">
          <Briefcase size={26} />
        </div>
        <div>
          <h2 className="text-base font-serif font-bold text-[#201E1D]">
            No Vacancies in {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
          <p className="text-xs text-[#686055] max-w-md mx-auto mt-1 leading-relaxed">
            There are no vacancy submissions recorded in the database for this status.
          </p>
        </div>
        <div>
          <BackendMissingBadge label="Job vacancies model pending backend migration" />
        </div>
      </div>

      {/* Refuse Dialog */}
      <ConfirmDialog
        isOpen={refuseDialogOpen}
        title="Refuse Vacancy Submission"
        message="Specify administrative reason for refusal (e.g. recruitment agency charging candidate placement fees, unverified sponsor credentials)."
        confirmLabel="Confirm Refusal"
        cancelLabel="Cancel"
        variant="danger"
        requiresReason={true}
        reasonPlaceholder="Specify refusal reason..."
        onConfirm={(reason) => {
          showToast(`Vacancy refused: "${reason}"`);
          setRefuseDialogOpen(false);
        }}
        onCancel={() => setRefuseDialogOpen(false)}
      />
    </div>
  );
};
