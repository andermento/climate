'use client';

import React from 'react';
import { Calendar, BarChart3, Globe } from 'lucide-react';
import { SidebarSection } from '@/components/layout/Sidebar';
import { YearFilter } from './YearFilter';
import { MonthFilter } from './MonthFilter';
import { CountryFilter } from './CountryFilter';
import type { Filters } from '@/lib/types';

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  countries: string[];
}

export function FilterPanel({
  filters,
  onChange,
  countries,
}: FilterPanelProps) {
  return (
    <>
      {/* Country Filter - Now at the top and prominent */}
      <SidebarSection
        title="Country"
        icon={<Globe className="h-4 w-4" />}
        defaultOpen={true}
      >
        <CountryFilter
          value={filters.country}
          onChange={(country) => onChange({ ...filters, country })}
          countries={countries}
        />
      </SidebarSection>

      {/* Year Filter */}
      <SidebarSection
        title="Time Period"
        icon={<Calendar className="h-4 w-4" />}
        defaultOpen={true}
      >
        <YearFilter
          value={filters.year}
          onChange={(year) => onChange({ ...filters, year })}
        />
      </SidebarSection>

      {/* Month Filter */}
      <SidebarSection
        title="Months"
        icon={<BarChart3 className="h-4 w-4" />}
        defaultOpen={false}
      >
        <MonthFilter
          value={filters.month}
          onChange={(month) => onChange({ ...filters, month })}
        />
      </SidebarSection>
    </>
  );
}

// Default filters (removed city)
export const DEFAULT_FILTERS: Filters = {
  year: {
    type: 'range',
    range: { start: 1900, end: 2015 },
  },
  month: {
    type: 'multiple',
    multiple: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  country: {
    countries: [],
  },
};

export default FilterPanel;
