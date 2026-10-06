import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  fields: FilterField[];
  selectedValues: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  fields,
  selectedValues,
  onChange,
  onReset,
  className = '',
}) => {
  const hasActiveFilters = Object.values(selectedValues).some(
    (v) => v !== '' && v !== 'ALL',
  );

  return (
    <div
      className={`flex flex-wrap items-center gap-2.5 bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl p-2.5 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#686055] px-1">
        <Filter size={14} className="text-[#8A7F73]" />
        <span>Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 flex-1">
        {fields.map((field) => (
          <select
            key={field.key}
            value={selectedValues[field.key] || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="bg-[#F5EAD8]/50 border border-[#E2D5C0] text-[#201E1D] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#273318] focus:border-[#273318] cursor-pointer"
          >
            <option value="">{field.label}: All</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {hasActiveFilters && onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#C67139] hover:bg-[#F5EAD8] rounded-lg transition-colors cursor-pointer"
          title="Reset all filters"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};
