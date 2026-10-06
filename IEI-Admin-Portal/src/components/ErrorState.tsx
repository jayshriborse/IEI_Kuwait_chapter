import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load records',
  message = 'An error occurred while communicating with the chapter backend service.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#FFFDF9] border border-[#FFCDD2] rounded-2xl p-8 flex flex-col items-center justify-center text-center my-6 shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#FFEBEE] flex items-center justify-center text-[#C62828] mb-3.5">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-serif font-bold text-[#201E1D] mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-[#686055] max-w-md leading-relaxed mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#273318] hover:bg-[#344421] text-[#F9F4ED] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
};
