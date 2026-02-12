'use client';

import React from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoricalData {
  year: number;
  avg_temperature: number | null;
  comparison: {
    years_ago: number;
    data_available: boolean;
    note?: string;
  };
}

interface ExtremesData {
  month: number;
  month_name: string;
  extremes: {
    max_temperature: number | null;
    max_recorded_year: number | null;
    min_temperature: number | null;
    min_recorded_year: number | null;
  };
}

interface HistoricalComparisonProps {
  country: string;
  currentTemp?: number;
  historicalData: HistoricalData | null;
  extremesData: ExtremesData | null;
  isLoading?: boolean;
  className?: string;
}

export function HistoricalComparison({
  country,
  currentTemp,
  historicalData,
  extremesData,
  isLoading,
  className,
}: HistoricalComparisonProps) {
  if (isLoading) {
    return (
      <div className={cn('glass-card p-6 animate-pulse', className)}>
        <div className="h-6 bg-card-hover rounded w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-card-hover rounded w-1/2" />
              <div className="h-8 bg-card-hover rounded w-2/3" />
              <div className="h-4 bg-card-hover rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!historicalData && !extremesData) {
    return (
      <div className={cn('glass-card p-6', className)}>
        <div className="text-center text-text-muted py-8">
          <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Select a country to see historical data</p>
        </div>
      </div>
    );
  }

  // Calculate temperature difference if both current and historical are available
  const tempDiff = currentTemp && historicalData?.avg_temperature
    ? currentTemp - historicalData.avg_temperature
    : null;

  return (
    <div className={cn('glass-card p-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <History className="h-5 w-5 text-accent" />
        <span className="text-lg font-semibold text-text">
          Historical Climate Data - {country}
        </span>
      </div>

      {/* Three columns grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: 50 Years Ago */}
        <div className="p-4 rounded-lg bg-card-hover/30">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-text-muted" />
            <span className="text-sm text-text-muted">
              {historicalData?.comparison.years_ago || 50} Years Ago
            </span>
          </div>

          {historicalData?.avg_temperature !== null && historicalData?.avg_temperature !== undefined ? (
            <>
              <div className="text-3xl font-bold text-text mb-1">
                {historicalData.avg_temperature.toFixed(1)}°C
              </div>
              <div className="text-sm text-text-muted">
                Average in {historicalData.year}
              </div>

              {/* Temperature comparison */}
              {tempDiff !== null && (
                <div className={cn(
                  'flex items-center gap-1 mt-3 text-sm font-medium',
                  tempDiff > 0 ? 'text-temp-hot' : 'text-temp-cold'
                )}>
                  {tempDiff > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      <span>+{tempDiff.toFixed(1)}°C since then</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4" />
                      <span>{tempDiff.toFixed(1)}°C since then</span>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-text-muted">
              No data available for this period
            </div>
          )}
        </div>

        {/* Column 2: Max Temperature Record */}
        <div className="p-4 rounded-lg bg-card-hover/30">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUp className="h-4 w-4 text-temp-hot" />
            <span className="text-sm text-text-muted">
              Maximum Record ({extremesData?.month_name || 'This Month'})
            </span>
          </div>

          {extremesData?.extremes.max_temperature !== null && extremesData?.extremes.max_temperature !== undefined ? (
            <>
              <div className="text-3xl font-bold text-temp-hot mb-1">
                {extremesData.extremes.max_temperature.toFixed(1)}°C
              </div>
              <div className="text-sm text-text-muted">
                Recorded in {extremesData.extremes.max_recorded_year}
              </div>
            </>
          ) : (
            <div className="text-text-muted">
              No maximum record available
            </div>
          )}
        </div>

        {/* Column 3: Min Temperature Record */}
        <div className="p-4 rounded-lg bg-card-hover/30">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDown className="h-4 w-4 text-temp-cold" />
            <span className="text-sm text-text-muted">
              Minimum Record ({extremesData?.month_name || 'This Month'})
            </span>
          </div>

          {extremesData?.extremes.min_temperature !== null && extremesData?.extremes.min_temperature !== undefined ? (
            <>
              <div className="text-3xl font-bold text-temp-cold mb-1">
                {extremesData.extremes.min_temperature.toFixed(1)}°C
              </div>
              <div className="text-sm text-text-muted">
                Recorded in {extremesData.extremes.min_recorded_year}
              </div>
            </>
          ) : (
            <div className="text-text-muted">
              No minimum record available
            </div>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Thermometer className="h-3 w-3" />
          <span>
            Historical data from Berkeley Earth (1743-2015)
          </span>
        </div>
      </div>
    </div>
  );
}

export default HistoricalComparison;
