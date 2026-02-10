'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function MetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  className,
}: MetricsCardProps) {
  return (
    <Card className={cn('p-4 hover:bg-card-hover transition-colors', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted">{title}</p>
          <p className="text-2xl font-bold text-text mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-text-dark mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend === 'up' && 'text-temp-hot',
                  trend === 'down' && 'text-temp-cold',
                  trend === 'neutral' && 'text-text-muted'
                )}
              >
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
            <Icon className="h-5 w-5 text-accent" />
          </div>
        )}
      </div>
    </Card>
  );
}

interface TemperatureCardProps {
  temperature: number | null;
  city?: string;
  country?: string;
  date?: string;
  uncertainty?: number;
  className?: string;
}

export function TemperatureCard({
  temperature,
  city,
  country,
  date,
  uncertainty,
  className,
}: TemperatureCardProps) {
  const getTemperatureColor = (temp: number | null) => {
    if (temp === null) return 'text-text-muted';
    if (temp >= 30) return 'text-temp-hot';
    if (temp >= 20) return 'text-temp-warm';
    if (temp >= 10) return 'text-temp-neutral';
    if (temp >= 0) return 'text-temp-cool';
    return 'text-temp-cold';
  };

  const getTemperatureBg = (temp: number | null) => {
    if (temp === null) return 'bg-card';
    if (temp >= 30) return 'bg-temp-hot/10';
    if (temp >= 20) return 'bg-temp-warm/10';
    if (temp >= 10) return 'bg-temp-neutral/10';
    if (temp >= 0) return 'bg-temp-cool/10';
    return 'bg-temp-cold/10';
  };

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-card-hover',
        getTemperatureBg(temperature),
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          {city && (
            <p className="font-medium text-text">
              {city}
              {country && <span className="text-text-muted">, {country}</span>}
            </p>
          )}
          {date && <p className="text-sm text-text-muted">{date}</p>}
        </div>
        <div className="text-right">
          <p className={cn('text-3xl font-bold', getTemperatureColor(temperature))}>
            {temperature !== null ? `${temperature.toFixed(1)}°C` : 'N/A'}
          </p>
          {uncertainty !== undefined && (
            <p className="text-xs text-text-dark">±{uncertainty.toFixed(2)}°C</p>
          )}
        </div>
      </div>
    </Card>
  );
}

interface LocationCardProps {
  city: string;
  country: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  onClick?: () => void;
  className?: string;
}

export function LocationCard({
  city,
  country,
  state,
  latitude,
  longitude,
  onClick,
  className,
}: LocationCardProps) {
  return (
    <Card
      className={cn(
        'p-3 cursor-pointer hover:bg-card-hover transition-colors',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-text">{city}</p>
          <p className="text-sm text-text-muted">
            {state ? `${state}, ` : ''}
            {country}
          </p>
        </div>
        {latitude !== undefined && longitude !== undefined && (
          <p className="text-xs text-text-dark">
            {latitude.toFixed(2)}°, {longitude.toFixed(2)}°
          </p>
        )}
      </div>
    </Card>
  );
}

export default MetricsCard;
