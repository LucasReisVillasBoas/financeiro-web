import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface UseReportFiltersConfig<T> {
  data: T[];
  initialItemsPerPage?: number;
}

export interface UseReportFiltersReturn<T> {
  // Pagination
  paginationConfig: PaginationConfig;
  paginatedData: T[];
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;

  // Sorting
  sortConfig: SortConfig<T> | null;
  sortedData: T[];
  requestSort: (key: keyof T | string) => void;
  getSortDirection: (key: keyof T | string) => SortDirection | null;

  // Combined
  filteredSortedPaginatedData: T[];
}

export function useReportFilters<T>({
  data,
  initialItemsPerPage = 10,
}: UseReportFiltersConfig<T>): UseReportFiltersReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key as string);
      const bValue = getNestedValue(b, sortConfig.key as string);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle different types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Date handling
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Try to compare as dates if they're date strings
      const aDate = new Date(aValue as string | number);
      const bDate = new Date(bValue as string | number);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return sortConfig.direction === 'asc'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }

      // Fallback to string comparison
      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return sorted;
  }, [data, sortConfig]);

  // Pagination calculations
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const paginationConfig: PaginationConfig = {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
  };

  // Pagination actions
  const handleSetCurrentPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const handleSetItemsPerPage = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => handleSetCurrentPage(currentPage + 1);
  const goToPreviousPage = () => handleSetCurrentPage(currentPage - 1);

  // Sorting actions
  const requestSort = (key: keyof T | string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirection = (key: keyof T | string): SortDirection | null => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction;
  };

  return {
    // Pagination
    paginationConfig,
    paginatedData,
    setCurrentPage: handleSetCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,

    // Sorting
    sortConfig,
    sortedData,
    requestSort,
    getSortDirection,

    // Combined
    filteredSortedPaginatedData: paginatedData,
  };
}

// Helper function to get nested property values (e.g., "pessoa.nome")
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path
    .split('.')
    .reduce((current, key) => (current as Record<string, unknown>)?.[key], obj as unknown);
}
