import React from 'react';

interface SkeletonLoaderProps {
  type?: 'table' | 'cards' | 'form' | 'detail';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'table',
  count = 5,
  className = '',
}) => {
  if (type === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-5 shadow-xs animate-pulse space-y-3"
          >
            <div className="h-3 bg-[#EFE4D0] rounded w-2/5" />
            <div className="h-8 bg-[#EFE4D0] rounded w-3/5" />
            <div className="h-3 bg-[#EFE4D0] rounded w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className={`bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-6 shadow-xs animate-pulse space-y-5 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-[#EFE4D0] rounded w-1/4" />
            <div className="h-10 bg-[#EFE4D0] rounded-xl w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Default: Table skeleton
  return (
    <div className={`bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl p-4 shadow-xs animate-pulse space-y-3 ${className}`}>
      <div className="h-10 bg-[#EFE4D0] rounded-xl w-full mb-4" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2 border-b border-[#EFE4D0]/60">
          <div className="h-4 bg-[#EFE4D0] rounded w-1/6" />
          <div className="h-4 bg-[#EFE4D0] rounded w-2/6" />
          <div className="h-4 bg-[#EFE4D0] rounded w-1/6" />
          <div className="h-4 bg-[#EFE4D0] rounded w-1/6" />
          <div className="h-4 bg-[#EFE4D0] rounded w-1/6" />
        </div>
      ))}
    </div>
  );
};
