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
  Droplets,
  Wind,
  ThermometerSun,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherData {
  country: string;
  capital: string;
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    weather_description: string;
    weather_icon: string;
    wind_speed: number;
    wind_direction: string;
  };
  forecast: {
    max_temp: number;
    min_temp: number;
    precipitation_probability: number;
  };
}

interface WeatherCardProps {
  data: WeatherData | null;
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

export function WeatherCard({ data, isLoading, className }: WeatherCardProps) {
  if (isLoading) {
    return (
      <div className={cn('glass-card p-6 animate-pulse', className)}>
        <div className="h-6 bg-card-hover rounded w-1/3 mb-4" />
        <div className="h-16 bg-card-hover rounded w-1/2 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-card-hover rounded" />
          <div className="h-12 bg-card-hover rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn('glass-card p-6', className)}>
        <div className="text-center text-text-muted py-8">
          <Cloud className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Select a country to see current weather</p>
        </div>
      </div>
    );
  }

  const WeatherIcon = ICON_MAP[data.current.weather_icon] || Cloud;

  return (
    <div className={cn('glass-card p-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-4 w-4 text-accent" />
        <span className="text-sm text-text-muted">
          {data.capital}, {data.country}
        </span>
      </div>

      {/* Current Temperature */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-5xl font-bold text-text">
            {data.current.temperature}°C
          </div>
          <div className="text-sm text-text-muted mt-1">
            {data.current.weather_description}
          </div>
        </div>
        <WeatherIcon className="h-16 w-16 text-accent opacity-80" />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <ThermometerSun className="h-4 w-4 text-temp-hot" />
          <div>
            <div className="text-xs text-text-muted">Feels like</div>
            <div className="text-sm font-medium">{data.current.feels_like}°C</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-400" />
          <div>
            <div className="text-xs text-text-muted">Humidity</div>
            <div className="text-sm font-medium">{data.current.humidity}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-text-muted" />
          <div>
            <div className="text-xs text-text-muted">Wind</div>
            <div className="text-sm font-medium">
              {data.current.wind_speed} km/h {data.current.wind_direction}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CloudRain className="h-4 w-4 text-blue-400" />
          <div>
            <div className="text-xs text-text-muted">Precipitation</div>
            <div className="text-sm font-medium">{data.forecast.precipitation_probability}%</div>
          </div>
        </div>
      </div>

      {/* Day Forecast */}
      <div className="pt-4 border-t border-border">
        <div className="text-xs text-text-muted mb-2">Today&apos;s Forecast</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-temp-cold font-medium">{data.forecast.min_temp}°</span>
            <div className="w-20 h-2 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-400 rounded-full" />
            <span className="text-temp-hot font-medium">{data.forecast.max_temp}°</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
