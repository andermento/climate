'use client';

import React from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn, debounce } from '@/lib/utils';
import type { CityData, CitySearch as CitySearchType } from '@/lib/types';

interface CitySearchProps {
  value: CitySearchType;
  onChange: (value: CitySearchType) => void;
  onSearch: (query: string) => Promise<CityData[]>;
  onCitySelect?: (city: CityData) => void;
  className?: string;
}

export function CitySearch({
  value,
  onChange,
  onSearch,
  onCitySelect,
  className,
}: CitySearchProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Debounced search
  const debouncedSearch = React.useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length < 2) {
          onChange({ ...value, results: [] });
          return;
        }

        setIsLoading(true);
        try {
          const results = await onSearch(query);
          onChange({ ...value, results });
        } catch (error) {
          console.error('Search error:', error);
          onChange({ ...value, results: [] });
        } finally {
          setIsLoading(false);
        }
      }, 300),
    [value, onChange, onSearch]
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange({ ...value, query });
    setIsOpen(true);
    debouncedSearch(query);
  };

  const handleCitySelect = (city: CityData) => {
    onChange({
      query: city.city,
      results: [],
      selected: city,
    });
    setIsOpen(false);
    onCitySelect?.(city);
  };

  const handleClear = () => {
    onChange({ query: '', results: [], selected: undefined });
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search city..."
          value={value.query}
          onChange={handleInputChange}
          onFocus={() => value.results.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted animate-spin" />
        )}
        {!isLoading && value.query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selected City Display */}
      {value.selected && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-accent/10 rounded-lg">
          <MapPin className="h-4 w-4 text-accent" />
          <div className="flex-1">
            <p className="text-sm font-medium text-text">{value.selected.city}</p>
            <p className="text-xs text-text-muted">
              {value.selected.state ? `${value.selected.state}, ` : ''}
              {value.selected.country}
            </p>
          </div>
          <button
            onClick={handleClear}
            className="text-text-muted hover:text-temp-hot"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Results Dropdown */}
      {isOpen && value.results.length > 0 && !value.selected && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-card-hover z-50 max-h-64 overflow-y-auto">
          {value.results.map((city, index) => (
            <button
              key={`${city.city}-${city.country}-${index}`}
              onClick={() => handleCitySelect(city)}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-card-hover transition-colors"
            >
              <MapPin className="h-4 w-4 text-text-muted flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-text">{city.city}</p>
                <p className="text-xs text-text-muted">
                  {city.state ? `${city.state}, ` : ''}
                  {city.country}
                </p>
              </div>
              <span className="ml-auto text-xs text-text-dark">
                {city.latitude.toFixed(1)}°, {city.longitude.toFixed(1)}°
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen &&
        value.query.length >= 2 &&
        !isLoading &&
        value.results.length === 0 &&
        !value.selected && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-card-hover z-50 p-4 text-center text-sm text-text-muted">
            No cities found for &quot;{value.query}&quot;
          </div>
        )}
    </div>
  );
}

export default CitySearch;
