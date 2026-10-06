import React from 'react';
import { AlertCircle } from 'lucide-react';

interface BackendMissingBadgeProps {
  label?: string;
  className?: string;
}

export const BackendMissingBadge: React.FC<BackendMissingBadgeProps> = ({
  label = 'Backend not available yet',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FFF3E0] text-[#D84315] border border-[#FFE0B2] shadow-2xs ${className}`}
      title="This feature endpoint or data model is not yet available in the backend API."
    >
      <AlertCircle size={12} className="shrink-0" />
      <span>{label}</span>
    </span>
  );
};
