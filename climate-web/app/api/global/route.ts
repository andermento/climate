import { NextResponse } from 'next/server';
import { getGlobalStats, getDecadeAverages, isSupabaseConfigured } from '@/lib/supabase';

// Mock global stats
const MOCK_STATS = {
  total_records: 10000000,
  min_year: 1743,
  max_year: 2015,
  total_countries: 243,
  total_cities: 3490,
  avg_temperature: 14.5,
};

// Mock decade averages
const MOCK_DECADES = [
  { decade: 1750, avg_temp: 8.72, measurements: 120 },
  { decade: 1760, avg_temp: 8.39, measurements: 120 },
  { decade: 1770, avg_temp: 8.41, measurements: 120 },
  { decade: 1780, avg_temp: 8.25, measurements: 120 },
  { decade: 1790, avg_temp: 8.52, measurements: 120 },
  { decade: 1800, avg_temp: 8.28, measurements: 120 },
  { decade: 1810, avg_temp: 8.15, measurements: 120 },
  { decade: 1820, avg_temp: 8.33, measurements: 120 },
  { decade: 1830, avg_temp: 8.24, measurements: 120 },
  { decade: 1840, avg_temp: 8.36, measurements: 120 },
  { decade: 1850, avg_temp: 8.41, measurements: 120 },
  { decade: 1860, avg_temp: 8.50, measurements: 120 },
  { decade: 1870, avg_temp: 8.52, measurements: 120 },
  { decade: 1880, avg_temp: 8.45, measurements: 120 },
  { decade: 1890, avg_temp: 8.58, measurements: 120 },
  { decade: 1900, avg_temp: 8.67, measurements: 120 },
  { decade: 1910, avg_temp: 8.72, measurements: 120 },
  { decade: 1920, avg_temp: 8.84, measurements: 120 },
  { decade: 1930, avg_temp: 9.02, measurements: 120 },
  { decade: 1940, avg_temp: 9.15, measurements: 120 },
  { decade: 1950, avg_temp: 9.08, measurements: 120 },
  { decade: 1960, avg_temp: 9.12, measurements: 120 },
  { decade: 1970, avg_temp: 9.21, measurements: 120 },
  { decade: 1980, avg_temp: 9.45, measurements: 120 },
  { decade: 1990, avg_temp: 9.68, measurements: 120 },
  { decade: 2000, avg_temp: 9.85, measurements: 120 },
  { decade: 2010, avg_temp: 10.12, measurements: 72 },
];

export async function GET() {
  try {
    // Use mock data if Supabase is not configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        stats: MOCK_STATS,
        decades: MOCK_DECADES,
        source: 'mock',
      });
    }

    const [stats, decades] = await Promise.all([
      getGlobalStats(),
      getDecadeAverages(),
    ]);

    return NextResponse.json({
      stats,
      decades,
      source: 'supabase',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global data' },
      { status: 500 }
    );
  }
}
