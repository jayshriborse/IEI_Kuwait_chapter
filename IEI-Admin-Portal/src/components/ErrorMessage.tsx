import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
}) => {
  return (
    <div className="bg-[#FFF5F5] border border-[#F5C2C7] rounded-xl p-5 my-4 flex items-start gap-3.5 shadow-sm">
      <AlertCircle className="text-[#D32F2F] shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-[#842029] mb-1">{title}</h4>
        <p className="text-sm text-[#842029]/90">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#842029] hover:underline cursor-pointer"
          >
            Retry Request
          </button>
        )}
      </div>
    </div>
  );
};
