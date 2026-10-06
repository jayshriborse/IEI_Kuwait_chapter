import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns3,
} from 'lucide-react';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  defaultVisible?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T) => string;
  pageSize?: number;
  emptyTitle?: string;
  emptyMessage?: string;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  pageSize = 10,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no items matching the current view or filters.',
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  className = '',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() =>
    columns
      .filter((col) => col.defaultVisible !== false)
      .map((col) => col.key),
  );
  const [columnToggleOpen, setColumnToggleOpen] = useState(false);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      const compare = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
      });
      return sortOrder === 'asc' ? compare : -compare;
    });
  }, [data, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const allKeys = paginatedData.map(keyExtractor);
      const combined = Array.from(new Set([...selectedKeys, ...allKeys]));
      onSelectionChange(combined);
    } else {
      const pageKeys = new Set(paginatedData.map(keyExtractor));
      onSelectionChange(selectedKeys.filter((k) => !pageKeys.has(k)));
    }
  };

  const handleSelectRow = (key: string) => {
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  const activeColumns = columns.filter((col) =>
    visibleColumnKeys.includes(col.key),
  );

  const isAllPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedKeys.includes(keyExtractor(row)));

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Table toolbar: column visibility toggle */}
      <div className="flex items-center justify-between text-xs text-[#686055]">
        <div className="flex items-center gap-2">
          <span>
            Showing{' '}
            <strong className="text-[#201E1D]">
              {Math.min(data.length, (currentPage - 1) * pageSize + 1)}–
              {Math.min(data.length, currentPage * pageSize)}
            </strong>{' '}
            of <strong className="text-[#201E1D]">{data.length}</strong> records
          </span>
          {selectable && selectedKeys.length > 0 && (
            <span className="bg-[#273318] text-[#F9F4ED] px-2 py-0.5 rounded-full text-[11px] font-medium">
              {selectedKeys.length} selected
            </span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setColumnToggleOpen(!columnToggleOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFDF9] border border-[#E2D5C0] rounded-lg text-xs hover:bg-[#F5EAD8] transition-colors cursor-pointer"
          >
            <Columns3 size={13} />
            <span>Columns</span>
          </button>

          {columnToggleOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-[#FFFDF9] border border-[#E2D5C0] rounded-xl shadow-lg p-2.5 z-20 space-y-1.5">
              <div className="text-[11px] font-semibold text-[#8A7F73] uppercase tracking-wider mb-1 px-1">
                Toggle Columns
              </div>
              {columns.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 text-xs text-[#201E1D] hover:bg-[#F5EAD8] px-2 py-1 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumnKeys.includes(col.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setVisibleColumnKeys([...visibleColumnKeys, col.key]);
                      } else if (visibleColumnKeys.length > 1) {
                        setVisibleColumnKeys(
                          visibleColumnKeys.filter((k) => k !== col.key),
                        );
                      }
                    }}
                    className="rounded border-[#E2D5C0] text-[#273318]"
                  />
                  <span>{col.header}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#FFFDF9] border border-[#E2D5C0] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#1F2913] text-[#F9F4ED] text-xs font-semibold uppercase tracking-wider border-b border-[#384723]">
                {selectable && (
                  <th className="py-3 px-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={handleSelectAll}
                      className="rounded border-[#384723] text-[#C67139] cursor-pointer"
                    />
                  </th>
                )}
                {activeColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`py-3.5 px-4 select-none ${
                      col.sortable ? 'cursor-pointer hover:bg-[#2A371B]' : ''
                    } ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    } ${col.className || ''}`}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-[#A9B890]">
                          {sortKey === col.key ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp size={13} />
                            ) : (
                              <ArrowDown size={13} />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4D0] text-[#201E1D]">
              {paginatedData.map((row) => {
                const rowKey = keyExtractor(row);
                const isSelected = selectedKeys.includes(rowKey);
                return (
                  <tr
                    key={rowKey}
                    className={`transition-colors hover:bg-[#F5EAD8]/40 ${
                      isSelected ? 'bg-[#F5EAD8]/70' : ''
                    }`}
                  >
                    {selectable && (
                      <td className="py-3 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowKey)}
                          className="rounded border-[#E2D5C0] text-[#273318] cursor-pointer"
                        />
                      </td>
                    )}
                    {activeColumns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {col.render ? col.render(row) : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-[#E2D5C0] bg-[#FFFDF9] flex items-center justify-between text-xs text-[#686055]">
            <div>
              Page <strong className="text-[#201E1D]">{currentPage}</strong> of{' '}
              <strong className="text-[#201E1D]">{totalPages}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[#E2D5C0] hover:bg-[#F5EAD8] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Only show current, first, last and surrounding
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#273318] text-[#F9F4ED]'
                          : 'border border-[#E2D5C0] hover:bg-[#F5EAD8]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return (
                    <span key={pageNum} className="px-1 text-[#8A7F73]">
                      ...
                    </span>
                  );
                }
                return null;
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[#E2D5C0] hover:bg-[#F5EAD8] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
