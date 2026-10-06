import React from 'react';
import { EmptyState } from '../components/EmptyState';
import { Crown, CheckCircle2 } from 'lucide-react';

export const ChairmanPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D84315]" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#D84315]">
              Chapter Executive Head
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#201E1D]">
            Chairman Executive Desk
          </h1>
          <p className="text-xs text-[#686055] mt-0.5">
            Final application approvals, executive chapter oversight, and HQ Kolkata dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FBE9E7] border border-[#FFCCBC] rounded-xl text-xs text-[#D84315] font-semibold">
          <Crown size={16} />
          <span>Role: Chapter Chairman (2026–27)</span>
        </div>
      </div>

      {/* Role Mandate Banner */}
      <div className="p-4 bg-[#FFFDF9] border-l-4 border-l-[#D84315] border border-[#E2D5C0] rounded-xl text-xs text-[#474238] shadow-sm leading-relaxed">
        <strong className="text-[#201E1D] block mb-0.5">
          Chairman Approval Mandate:
        </strong>
        Final approval queue for membership candidates recommended by the General Secretary. Approval authorizes formal registration dispatch to IEI Headquarters in Kolkata.
      </div>

      {/* Final Approval Queue Section */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2D5C0]">
          <div>
            <h2 className="font-serif font-bold text-base text-[#201E1D]">
              Recommended Applications for Final Sign-Off
            </h2>
            <p className="text-xs text-[#686055]">
              Applications verified and forwarded by the General Secretary awaiting Chairman approval.
            </p>
          </div>
        </div>

        {/* Foundation Empty State (Rule: No fake numbers or invented rows) */}
        <EmptyState
          title="No data available"
          message="There are no applications currently pending final Chairman sign-off."
          icon={<CheckCircle2 size={28} className="text-[#D84315]" />}
        />
      </div>
    </div>
  );
};
