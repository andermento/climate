'use client';

import { useState, useCallback } from 'react';
import type { Filters, YearFilter, MonthFilter, CountryFilter } from '@/lib/types';
import { DEFAULT_FILTERS } from '@/components/filters/FilterPanel';

export function useFilters(initialFilters?: Partial<Filters>) {
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const updateYear = useCallback((year: YearFilter) => {
    setFilters((prev) => ({ ...prev, year }));
  }, []);

  const updateMonth = useCallback((month: MonthFilter) => {
    setFilters((prev) => ({ ...prev, month }));
  }, []);

  const updateCountry = useCallback((country: CountryFilter) => {
    setFilters((prev) => ({ ...prev, country }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Get filter summary for display
  const getFilterSummary = useCallback(() => {
    const parts: string[] = [];

    // Year summary
    if (filters.year.type === 'single' && filters.year.single) {
      parts.push(`Year: ${filters.year.single}`);
    } else if (filters.year.type === 'range' && filters.year.range) {
      parts.push(`${filters.year.range.start}-${filters.year.range.end}`);
    }

    // Country summary
    if (filters.country.countries.length > 0) {
      if (filters.country.countries.length === 1) {
        parts.push(filters.country.countries[0]);
      } else {
        parts.push(`${filters.country.countries.length} countries`);
      }
    } else {
      parts.push('Global');
    }

    return parts.join(' | ');
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilters,
    updateYear,
    updateMonth,
    updateCountry,
    resetFilters,
    getFilterSummary,
  };
}

export default useFilters;
