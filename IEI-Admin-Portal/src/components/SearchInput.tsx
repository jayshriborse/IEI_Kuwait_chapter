import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search records...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={16}
        className="absolute left-3.5 text-[#8A7F73] pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FFFDF9] border border-[#E2D5C0] text-[#201E1D] text-sm rounded-xl pl-9 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-[#273318]/30 focus:border-[#273318] transition-all placeholder:text-[#A89F91]"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 text-[#8A7F73] hover:text-[#201E1D] p-0.5 rounded-full"
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
