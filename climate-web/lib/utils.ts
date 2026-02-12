import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SEASONS, type YearFilter, type MonthFilter } from './types';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Temperature color based on value
export function getTemperatureColor(temp: number | null): string {
  if (temp === null) return '#808080';

  if (temp >= 30) return '#ff6b6b';      // Hot - Red
  if (temp >= 20) return '#ffa94d';      // Warm - Orange
  if (temp >= 10) return '#ffd43b';      // Neutral - Yellow
  if (temp >= 0) return '#74c0fc';       // Cool - Light Blue
  return '#4ecdc4';                       // Cold - Cyan
}

// Format temperature with degree symbol
export function formatTemperature(temp: number | null, decimals: number = 1): string {
  if (temp === null) return 'N/A';
  return `${temp.toFixed(decimals)}°C`;
}

// Get years array for filters
export function getYearRange(start: number, end: number): number[] {
  const years: number[] = [];
  for (let year = start; year <= end; year++) {
    years.push(year);
  }
  return years;
}

// Get months from season
export function getMonthsFromSeason(season: keyof typeof SEASONS): number[] {
  return [...SEASONS[season]];
}

// Parse year filter to SQL-compatible format
export function parseYearFilter(filter: YearFilter): { start: number; end: number } {
  switch (filter.type) {
    case 'single':
      return { start: filter.single!, end: filter.single! };
    case 'range':
      return { start: filter.range!.start, end: filter.range!.end };
    case 'multiple':
      return {
        start: Math.min(...filter.multiple!),
        end: Math.max(...filter.multiple!),
      };
    default:
      return { start: 1743, end: 2015 };
  }
}

// Parse month filter to array
export function parseMonthFilter(filter: MonthFilter): number[] {
  switch (filter.type) {
    case 'single':
      return [filter.single!];
    case 'multiple':
      return filter.multiple!;
    default:
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

// Debounce function for search
export function debounce(
  func: (query: string) => void,
  wait: number
): (query: string) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (query: string) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(query), wait);
  };
}

// Calculate temperature trend (warming/cooling)
export function calculateTrend(data: { year: number; temp: number }[]): 'warming' | 'cooling' | 'stable' {
  if (data.length < 2) return 'stable';

  const sorted = [...data].sort((a, b) => a.year - b.year);
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

  const firstAvg = firstHalf.reduce((sum, d) => sum + d.temp, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.temp, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 0.5) return 'warming';
  if (diff < -0.5) return 'cooling';
  return 'stable';
}

// Generate decade labels
export function getDecadeLabel(decade: number): string {
  return `${decade}s`;
}
