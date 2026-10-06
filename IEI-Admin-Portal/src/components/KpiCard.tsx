import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  accent?: 'forest' | 'terracotta' | 'gold' | 'default';
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  actionLabel,
  onAction,
  accent = 'default',
  className = '',
}) => {
  let topBarColor = 'bg-[#E2D5C0]';
  let valueColor = 'text-[#201E1D]';

  if (accent === 'forest') {
    topBarColor = 'bg-[#273318]';
    valueColor = 'text-[#273318]';
  } else if (accent === 'terracotta') {
    topBarColor = 'bg-[#C67139]';
    valueColor = 'text-[#C67139]';
  } else if (accent === 'gold') {
    topBarColor = 'bg-[#D4AF37]';
    valueColor = 'text-[#8A6D1C]';
  }

  return (
    <div
      className={`relative bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${className}`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${topBarColor}`} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#686055]">
            {title}
          </span>
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-[#F5EAD8] flex items-center justify-center text-[#273318]">
              {icon}
            </div>
          )}
        </div>

        <div className={`text-3xl font-serif font-bold tracking-tight mb-1 ${valueColor}`}>
          {value}
        </div>

        {subtitle && (
          <p className="text-xs text-[#8A7F73] font-sans">
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <div className="mt-4 pt-3 border-t border-[#EFE4D0] flex items-center justify-between">
          <button
            onClick={onAction}
            className="text-xs font-semibold text-[#273318] hover:text-[#C67139] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{actionLabel}</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
