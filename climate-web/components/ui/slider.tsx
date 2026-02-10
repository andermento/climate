'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min, max, value, onChange, showValue = true, formatValue, ...props }, ref) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="w-full">
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={cn(
              'w-full h-2 bg-card rounded-lg appearance-none cursor-pointer',
              'range-slider',
              className
            )}
            ref={ref}
            style={{
              background: `linear-gradient(to right, #4ecca3 0%, #4ecca3 ${percentage}%, #2a3a5a ${percentage}%, #2a3a5a 100%)`,
            }}
            {...props}
          />
        </div>
        {showValue && (
          <div className="flex justify-between mt-2 text-xs text-text-muted">
            <span>{formatValue ? formatValue(min) : min}</span>
            <span className="text-accent font-medium">
              {formatValue ? formatValue(value) : value}
            </span>
            <span>{formatValue ? formatValue(max) : max}</span>
          </div>
        )}
        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #4ecca3;
            cursor: pointer;
            border: 2px solid #1a1a2e;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }

          input[type='range']::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #4ecca3;
            cursor: pointer;
            border: 2px solid #1a1a2e;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </div>
    );
  }
);
Slider.displayName = 'Slider';

// Range Slider for selecting a range of values
export interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  className?: string;
}

const RangeSlider = ({
  min,
  max,
  value,
  onChange,
  formatValue,
  className,
}: RangeSliderProps) => {
  const [minVal, maxVal] = value;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxVal - 1);
    onChange([newMin, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minVal + 1);
    onChange([minVal, newMax]);
  };

  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-2">
        {/* Background track */}
        <div className="absolute w-full h-2 bg-card rounded-lg" />
        {/* Selected range */}
        <div
          className="absolute h-2 bg-accent rounded-lg"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer pointer-events-none range-thumb"
          style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
        />
        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer pointer-events-none range-thumb"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex justify-between mt-3 text-sm">
        <span className="text-accent font-medium">
          {formatValue ? formatValue(minVal) : minVal}
        </span>
        <span className="text-text-muted">to</span>
        <span className="text-accent font-medium">
          {formatValue ? formatValue(maxVal) : maxVal}
        </span>
      </div>
      <style jsx>{`
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4ecca3;
          cursor: pointer;
          border: 2px solid #1a1a2e;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          pointer-events: auto;
        }

        .range-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4ecca3;
          cursor: pointer;
          border: 2px solid #1a1a2e;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
};

export { Slider, RangeSlider };
