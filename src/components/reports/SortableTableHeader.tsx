import React from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import type { SortDirection } from '../../hooks/useReportFilters';

interface SortableTableHeaderProps {
  label: string;
  sortKey: string;
  currentSortKey?: string | null;
  sortDirection?: SortDirection | null;
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  label,
  sortKey,
  currentSortKey,
  sortDirection,
  onSort,
  align = 'left',
  className = '',
}) => {
  const isActive = currentSortKey === sortKey;
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <th
      className={`p-3 text-[var(--color-text-secondary)] ${alignClass} ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <button
        className="inline-flex items-center gap-1 hover:text-[var(--color-text)] transition-colors cursor-pointer select-none"
        type="button"
      >
        <span>{label}</span>
        <span className="flex flex-col">
          {isActive && sortDirection === 'asc' && (
            <FiArrowUp size={14} className="text-[var(--color-primary)]" />
          )}
          {isActive && sortDirection === 'desc' && (
            <FiArrowDown size={14} className="text-[var(--color-primary)]" />
          )}
          {!isActive && (
            <span className="opacity-30">
              <FiArrowUp size={14} />
            </span>
          )}
        </span>
      </button>
    </th>
  );
};
