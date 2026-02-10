'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MONTH_NAMES, SEASONS, type MonthFilter as MonthFilterType } from '@/lib/types';

interface MonthFilterProps {
  value: MonthFilterType;
  onChange: (value: MonthFilterType) => void;
  className?: string;
}

const SEASON_CONFIG = [
  { key: 'spring' as const, label: 'Spring', emoji: '🌸', months: SEASONS.spring },
  { key: 'summer' as const, label: 'Summer', emoji: '☀️', months: SEASONS.summer },
  { key: 'fall' as const, label: 'Fall', emoji: '🍂', months: SEASONS.fall },
  { key: 'winter' as const, label: 'Winter', emoji: '❄️', months: SEASONS.winter },
];

export function MonthFilter({ value, onChange, className }: MonthFilterProps) {
  const selectedMonths = React.useMemo(() => {
    if (value.type === 'single' && value.single) {
      return [value.single];
    }
    if (value.type === 'multiple' && value.multiple) {
      return value.multiple;
    }
    if (value.type === 'season' && value.season) {
      return [...SEASONS[value.season]];
    }
    return [];
  }, [value]);

  const handleMonthToggle = (month: number) => {
    const isSelected = selectedMonths.includes(month);
    let newMonths: number[];

    if (isSelected) {
      newMonths = selectedMonths.filter((m) => m !== month);
    } else {
      newMonths = [...selectedMonths, month].sort((a, b) => a - b);
    }

    if (newMonths.length === 0) {
      // All months selected when none selected
      onChange({ type: 'multiple', multiple: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] });
    } else if (newMonths.length === 1) {
      onChange({ type: 'single', single: newMonths[0] });
    } else {
      onChange({ type: 'multiple', multiple: newMonths });
    }
  };

  const handleSeasonSelect = (season: keyof typeof SEASONS) => {
    const isCurrentSeason = value.type === 'season' && value.season === season;

    if (isCurrentSeason) {
      // Deselect - select all months
      onChange({ type: 'multiple', multiple: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] });
    } else {
      onChange({ type: 'season', season });
    }
  };

  const handleSelectAll = () => {
    onChange({ type: 'multiple', multiple: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] });
  };

  const isAllSelected = selectedMonths.length === 12 || selectedMonths.length === 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Season Quick Select */}
      <div className="grid grid-cols-2 gap-2">
        {SEASON_CONFIG.map((season) => {
          const isActive = value.type === 'season' && value.season === season.key;
          return (
            <Button
              key={season.key}
              variant={isActive ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleSeasonSelect(season.key)}
              className="text-xs"
            >
              <span className="mr-1">{season.emoji}</span>
              {season.label}
            </Button>
          );
        })}
      </div>

      {/* All Months Button */}
      <Button
        variant={isAllSelected ? 'default' : 'secondary'}
        size="sm"
        onClick={handleSelectAll}
        className="w-full text-xs"
      >
        All Months
      </Button>

      {/* Month Grid */}
      <div className="grid grid-cols-4 gap-1">
        {MONTH_NAMES.map((month, index) => {
          const monthNum = index + 1;
          const isSelected = selectedMonths.includes(monthNum) || isAllSelected;
          const shortName = month.slice(0, 3);

          return (
            <button
              key={month}
              onClick={() => handleMonthToggle(monthNum)}
              className={cn(
                'px-2 py-1.5 text-xs rounded transition-colors',
                isSelected
                  ? 'bg-accent text-background font-medium'
                  : 'bg-card text-text-muted hover:bg-card-hover hover:text-text'
              )}
            >
              {shortName}
            </button>
          );
        })}
      </div>

      {/* Selection Info */}
      <div className="text-center text-sm text-text-muted">
        {isAllSelected ? (
          'All months'
        ) : value.type === 'season' && value.season ? (
          `${SEASON_CONFIG.find((s) => s.key === value.season)?.label} (${selectedMonths.length} months)`
        ) : (
          `${selectedMonths.length} month${selectedMonths.length !== 1 ? 's' : ''} selected`
        )}
      </div>
    </div>
  );
}

export default MonthFilter;
