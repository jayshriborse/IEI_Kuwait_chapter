import React from 'react';
import { EmptyState } from '../components/EmptyState';
import { FileCheck2, UserCheck } from 'lucide-react';

export const SecretaryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1565C0]" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#1565C0]">
              Chapter Administration & Verification
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#201E1D]">
            General Secretary Workbench
          </h1>
          <p className="text-xs text-[#686055] mt-0.5">
            Initial membership applications review, document verification, and recommendation workflow.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#E3F2FD] border border-[#BBDEFB] rounded-xl text-xs text-[#1565C0] font-semibold">
          <FileCheck2 size={16} />
          <span>Role: General Secretary (2026–27)</span>
        </div>
      </div>

      {/* Workflow Explanation Banner */}
      <div className="p-4 bg-[#FFFDF9] border-l-4 border-l-[#1565C0] border border-[#E2D5C0] rounded-xl text-xs text-[#474238] shadow-sm leading-relaxed">
        <strong className="text-[#201E1D] block mb-0.5">
          Application Review Hierarchy:
        </strong>
        Applications submitted by prospective members are reviewed first by the General Secretary (verifying Degree, Passport, and Civil ID). Approving forwards the recommendation to the Chairman for final sign-off.
      </div>

      {/* Applications Queue Section */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2D5C0]">
          <div>
            <h2 className="font-serif font-bold text-base text-[#201E1D]">
              Applications Awaiting Review
            </h2>
            <p className="text-xs text-[#686055]">
              New engineer membership applications requiring initial administrative verification.
            </p>
          </div>
        </div>

        {/* Foundation Empty State (Rule: No fake numbers or invented rows) */}
        <EmptyState
          title="No data available"
          message="There are no membership applications currently awaiting General Secretary review."
          icon={<UserCheck size={28} className="text-[#1565C0]" />}
        />
      </div>
    </div>
  );
};
