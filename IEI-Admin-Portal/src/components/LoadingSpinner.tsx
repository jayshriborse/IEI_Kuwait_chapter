import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  size = 'md',
  fullHeight = false,
}) => {
  const sizeMap = {
    sm: 18,
    md: 28,
    lg: 40,
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-[#686055] ${
        fullHeight ? 'min-h-[300px]' : ''
      }`}
    >
      <Loader2
        size={sizeMap[size]}
        className="animate-spin text-[#C67139] mb-3"
      />
      {label && <p className="text-sm font-medium tracking-wide">{label}</p>}
    </div>
  );
};
