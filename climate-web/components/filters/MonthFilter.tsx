'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MONTH_NAMES, type MonthFilter as MonthFilterType } from '@/lib/types';

interface MonthFilterProps {
  value: MonthFilterType;
  onChange: (value: MonthFilterType) => void;
  className?: string;
}

export function MonthFilter({ value, onChange, className }: MonthFilterProps) {
  const selectedMonths = React.useMemo(() => {
    if (value.type === 'single' && value.single) {
      return [value.single];
    }
    if (value.type === 'multiple' && value.multiple) {
      return value.multiple;
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

  const handleSelectAll = () => {
    onChange({ type: 'multiple', multiple: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] });
  };

  const isAllSelected = selectedMonths.length === 12 || selectedMonths.length === 0;

  return (
    <div className={cn('space-y-4', className)}>
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
        ) : (
          `${selectedMonths.length} month${selectedMonths.length !== 1 ? 's' : ''} selected`
        )}
      </div>
    </div>
  );
}

export default MonthFilter;
