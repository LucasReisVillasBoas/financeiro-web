import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import type { PaginationConfig } from '../../hooks/useReportFilters';

interface PaginationControlsProps {
  config: PaginationConfig;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  config,
  onPageChange,
  onItemsPerPageChange,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPreviousPage,
}) => {
  const { currentPage, itemsPerPage, totalItems, totalPages } = config;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const itemsPerPageOptions = [10, 25, 50, 100, 200];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-[var(--color-text-secondary)]">Itens por página:</label>
        <select
          value={itemsPerPage}
          onChange={e => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Page info */}
      <div className="text-sm text-[var(--color-text-secondary)]">
        Mostrando <span className="font-medium text-[var(--color-text)]">{startItem}</span> a{' '}
        <span className="font-medium text-[var(--color-text)]">{endItem}</span> de{' '}
        <span className="font-medium text-[var(--color-text)]">{totalItems}</span> registros
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onFirstPage}
          disabled={currentPage === 1}
          className="p-2 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Primeira página"
        >
          <FiChevronsLeft size={18} />
        </button>

        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="p-2 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página anterior"
        >
          <FiChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2 px-3">
          <span className="text-sm text-[var(--color-text-secondary)]">Página</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={e => {
              const page = Number(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="w-16 px-2 py-1 text-center bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <span className="text-sm text-[var(--color-text-secondary)]">de {totalPages}</span>
        </div>

        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Próxima página"
        >
          <FiChevronRight size={18} />
        </button>

        <button
          onClick={onLastPage}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Última página"
        >
          <FiChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};
