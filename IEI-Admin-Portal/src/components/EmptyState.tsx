import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data available',
  message = 'There are no active records in this section at this time.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-10 flex flex-col items-center justify-center text-center my-6 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-[#EFE4D0] flex items-center justify-center text-[#8B634A] mb-4">
        {icon || <Inbox size={26} />}
      </div>
      <h3 className="text-lg font-serif font-semibold text-[#201E1D] mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-[#686055] max-w-md leading-relaxed mb-4">
        {message}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-[#C67139] hover:bg-[#b56430] text-[#F9F4ED] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
