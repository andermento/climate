'use client';

import React from 'react';
import { Calendar, BarChart3, MapPin, Search } from 'lucide-react';
import { SidebarSection } from '@/components/layout/Sidebar';
import { YearFilter } from './YearFilter';
import { MonthFilter } from './MonthFilter';
import { CountryFilter } from './CountryFilter';
import { CitySearch } from './CitySearch';
import type { Filters, CityData } from '@/lib/types';

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  countries: string[];
  onCitySearch: (query: string) => Promise<CityData[]>;
  onCitySelect?: (city: CityData) => void;
}

export function FilterPanel({
  filters,
  onChange,
  countries,
  onCitySearch,
  onCitySelect,
}: FilterPanelProps) {
  return (
    <>
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

      {/* Country Filter */}
      <SidebarSection
        title="Country"
        icon={<MapPin className="h-4 w-4" />}
        defaultOpen={false}
      >
        <CountryFilter
          value={filters.country}
          onChange={(country) => onChange({ ...filters, country })}
          countries={countries}
        />
      </SidebarSection>

      {/* City Search */}
      <SidebarSection
        title="City Search"
        icon={<Search className="h-4 w-4" />}
        defaultOpen={false}
      >
        <CitySearch
          value={filters.city}
          onChange={(city) => onChange({ ...filters, city })}
          onSearch={onCitySearch}
          onCitySelect={onCitySelect}
        />
      </SidebarSection>
    </>
  );
}

// Default filters
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
  city: {
    query: '',
    results: [],
  },
};

export default FilterPanel;
