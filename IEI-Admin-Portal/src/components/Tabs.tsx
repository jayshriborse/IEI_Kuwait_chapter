import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  badge?: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto border-b border-[#E2D5C0] pb-px ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all relative border-b-2 cursor-pointer whitespace-nowrap ${
              isActive
                ? 'border-[#273318] text-[#273318]'
                : 'border-transparent text-[#686055] hover:text-[#201E1D] hover:border-[#D5C6AF]'
            }`}
          >
            {tab.icon && <span className="text-current">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium ${
                  isActive
                    ? 'bg-[#273318] text-[#F9F4ED]'
                    : 'bg-[#EFE4D0] text-[#686055]'
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="px-1.5 py-0.2 rounded text-[9.5px] uppercase tracking-wider bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
