import React from 'react';
import { EmptyState } from '../components/EmptyState';
import { Coins, AlertCircle, FileCheck } from 'lucide-react';

export const TreasurerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#8F7726]">
              Exclusive Financial Authority
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#201E1D]">
            Chapter Treasurer Workbench
          </h1>
          <p className="text-xs text-[#686055] mt-0.5">
            Dues receipt confirmation queue, physical book logging, and subscription reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FFF9E6] border border-[#FFE082] rounded-xl text-xs text-[#8F7726] font-semibold">
          <Coins size={16} />
          <span>Role: Treasurer (2026–27)</span>
        </div>
      </div>

      {/* Client Business Rule Card */}
      <div className="p-4 bg-[#FFFDF9] border-l-4 border-l-[#C67139] border border-[#E2D5C0] rounded-xl text-xs text-[#474238] flex items-start gap-3 shadow-sm">
        <AlertCircle size={18} className="text-[#C67139] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#201E1D] block mb-0.5">
            Client Rule (Prototype Specification):
          </strong>
          A member's "Subscription due" warning band clears <span className="font-semibold underline">only</span> when the Chapter Treasurer confirms the receipt in the backend (<code className="font-mono bg-[#EFE4D0] px-1 py-0.5 rounded text-[#201E1D]">POST /ec/receipts/:id/confirm</code>), recording the physical Receipt Book No. and Receipt No.
        </div>
      </div>

      {/* Pending Receipts Queue Section */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2D5C0]">
          <div>
            <h2 className="font-serif font-bold text-base text-[#201E1D]">
              Receipts Awaiting Confirmation
            </h2>
            <p className="text-xs text-[#686055]">
              Bank transfer slips uploaded by members awaiting Treasurer approval.
            </p>
          </div>
        </div>

        {/* Foundation Empty State (Rule: No fake numbers or invented rows) */}
        <EmptyState
          title="No data available"
          message="There are no pending member subscription declarations awaiting Treasurer confirmation at this time."
          icon={<FileCheck size={28} className="text-[#8F7726]" />}
        />
      </div>
    </div>
  );
};
