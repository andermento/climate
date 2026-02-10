'use client';

import React from 'react';
import { Check, ChevronDown, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CountryFilter as CountryFilterType } from '@/lib/types';

interface CountryFilterProps {
  value: CountryFilterType;
  onChange: (value: CountryFilterType) => void;
  countries: string[];
  className?: string;
}

export function CountryFilter({
  value,
  onChange,
  countries,
  className,
}: CountryFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = React.useMemo(() => {
    if (!search) return countries;
    return countries.filter((country) =>
      country.toLowerCase().includes(search.toLowerCase())
    );
  }, [countries, search]);

  const handleCountryToggle = (country: string) => {
    const isSelected = value.countries.includes(country);
    let newCountries: string[];

    if (isSelected) {
      newCountries = value.countries.filter((c) => c !== country);
    } else {
      newCountries = [...value.countries, country];
    }

    onChange({ countries: newCountries });
  };

  const handleRemoveCountry = (country: string) => {
    onChange({ countries: value.countries.filter((c) => c !== country) });
  };

  const handleClearAll = () => {
    onChange({ countries: [] });
    setSearch('');
  };

  const handleSelectGlobal = () => {
    onChange({ countries: [] });
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-card-hover transition-colors"
      >
        <span className="text-text-muted">
          {value.countries.length === 0
            ? 'Global (all countries)'
            : `${value.countries.length} selected`}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-text-muted transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Selected Tags */}
      {value.countries.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {value.countries.slice(0, 3).map((country) => (
            <span
              key={country}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-accent/20 text-accent rounded"
            >
              {country}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCountry(country);
                }}
                className="hover:text-temp-hot"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {value.countries.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-text-muted">
              +{value.countries.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-card-hover z-50">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <Input
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {/* Global Option */}
            <button
              onClick={handleSelectGlobal}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-card-hover transition-colors',
                value.countries.length === 0 && 'text-accent'
              )}
            >
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Global (all countries)
              </span>
              {value.countries.length === 0 && (
                <Check className="h-4 w-4 text-accent" />
              )}
            </button>

            {/* Country List */}
            {filteredCountries.map((country) => {
              const isSelected = value.countries.includes(country);
              return (
                <button
                  key={country}
                  onClick={() => handleCountryToggle(country)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-card-hover transition-colors',
                    isSelected && 'text-accent'
                  )}
                >
                  <span>{country}</span>
                  {isSelected && <Check className="h-4 w-4 text-accent" />}
                </button>
              );
            })}

            {filteredCountries.length === 0 && (
              <div className="px-3 py-4 text-sm text-text-muted text-center">
                No countries found
              </div>
            )}
          </div>

          {/* Actions */}
          {value.countries.length > 0 && (
            <div className="p-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full text-xs text-text-muted hover:text-temp-hot"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CountryFilter;
