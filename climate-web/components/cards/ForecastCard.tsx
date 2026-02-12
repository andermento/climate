'use client';

import React from 'react';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Snowflake,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ForecastDay {
  date: string;
  dayName: string;
  temp_max: number;
  temp_min: number;
  weather_code: number;
  weather_description: string;
  weather_icon: string;
  precipitation_probability: number;
}

interface ForecastCardProps {
  forecast: ForecastDay[] | null;
  isLoading?: boolean;
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Snowflake,
};

export function ForecastCard({ forecast, isLoading, className }: ForecastCardProps) {
  if (isLoading) {
    return (
      <div className={cn('glass-card p-6 animate-pulse', className)}>
        <div className="h-6 bg-card-hover rounded w-1/3 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-4 bg-card-hover rounded w-12" />
              <div className="h-12 w-12 bg-card-hover rounded-full" />
              <div className="h-4 bg-card-hover rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!forecast || forecast.length === 0) {
    return (
      <div className={cn('glass-card p-6', className)}>
        <div className="text-center text-text-muted py-8">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No forecast data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('glass-card p-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-accent" />
        <span className="text-sm font-medium text-text">3-Day Forecast</span>
      </div>

      {/* Forecast Grid - 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {forecast.map((day) => {
          const WeatherIcon = ICON_MAP[day.weather_icon] || Cloud;

          return (
            <div
              key={day.date}
              className="flex flex-col items-center text-center p-3 rounded-lg bg-card-hover/30 hover:bg-card-hover/50 transition-colors"
            >
              {/* Day name */}
              <span className="text-sm font-semibold text-text mb-2">
                {day.dayName}
              </span>

              {/* Weather icon */}
              <WeatherIcon className="h-10 w-10 text-accent mb-2" />

              {/* Weather description */}
              <span className="text-xs text-text-muted mb-2 line-clamp-1">
                {day.weather_description}
              </span>

              {/* Temperature range */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-temp-hot font-medium">{day.temp_max}°</span>
                <span className="text-text-muted">/</span>
                <span className="text-temp-cold font-medium">{day.temp_min}°</span>
              </div>

              {/* Precipitation probability */}
              {day.precipitation_probability > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-blue-400">
                  <CloudRain className="h-3 w-3" />
                  <span>{day.precipitation_probability}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ForecastCard;
