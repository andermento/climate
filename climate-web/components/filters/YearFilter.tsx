'use client';

import React from 'react';
import { RangeSlider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { YearFilter as YearFilterType } from '@/lib/types';

interface YearFilterProps {
  value: YearFilterType;
  onChange: (value: YearFilterType) => void;
  min?: number;
  max?: number;
  className?: string;
}

const QUICK_RANGES = [
  { label: 'All Time', start: 1743, end: 2015 },
  { label: '2000s', start: 2000, end: 2015 },
  { label: '1990s', start: 1990, end: 1999 },
  { label: '1950-2000', start: 1950, end: 2000 },
  { label: '1900-1950', start: 1900, end: 1950 },
  { label: 'Pre-1900', start: 1743, end: 1899 },
];

export function YearFilter({
  value,
  onChange,
  min = 1743,
  max = 2015,
  className,
}: YearFilterProps) {
  const currentRange: [number, number] = React.useMemo(() => {
    if (value.type === 'single' && value.single) {
      return [value.single, value.single];
    }
    if (value.type === 'range' && value.range) {
      return [value.range.start, value.range.end];
    }
    return [min, max];
  }, [value, min, max]);

  const handleRangeChange = (newRange: [number, number]) => {
    if (newRange[0] === newRange[1]) {
      onChange({ type: 'single', single: newRange[0] });
    } else {
      onChange({
        type: 'range',
        range: { start: newRange[0], end: newRange[1] },
      });
    }
  };

  const handleQuickRange = (start: number, end: number) => {
    if (start === end) {
      onChange({ type: 'single', single: start });
    } else {
      onChange({ type: 'range', range: { start, end } });
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Range Slider */}
      <RangeSlider
        min={min}
        max={max}
        value={currentRange}
        onChange={handleRangeChange}
        formatValue={(val) => val.toString()}
      />

      {/* Quick Range Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {QUICK_RANGES.map((range) => {
          const isActive =
            currentRange[0] === range.start && currentRange[1] === range.end;
          return (
            <Button
              key={range.label}
              variant={isActive ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleQuickRange(range.start, range.end)}
              className="text-xs"
            >
              {range.label}
            </Button>
          );
        })}
      </div>

      {/* Current Selection Display */}
      <div className="text-center text-sm text-text-muted">
        {currentRange[0] === currentRange[1] ? (
          <span>Year: <span className="text-accent font-medium">{currentRange[0]}</span></span>
        ) : (
          <span>
            <span className="text-accent font-medium">{currentRange[1] - currentRange[0] + 1}</span> years selected
          </span>
        )}
      </div>
    </div>
  );
}

export default YearFilter;
