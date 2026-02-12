import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const revalidate = 3600; // Cache for 1 hour

// Mock data for development
const mockExtremesData: Record<string, Record<number, { max_temp: number; min_temp: number; max_year: number; min_year: number }>> = {
  'Brazil': {
    1: { max_temp: 32.5, min_temp: 18.2, max_year: 2015, min_year: 1976 },
    2: { max_temp: 33.1, min_temp: 19.5, max_year: 2010, min_year: 1980 },
    3: { max_temp: 31.8, min_temp: 17.8, max_year: 2005, min_year: 1975 },
    4: { max_temp: 28.5, min_temp: 14.2, max_year: 2012, min_year: 1970 },
    5: { max_temp: 25.3, min_temp: 10.5, max_year: 2008, min_year: 1965 },
    6: { max_temp: 23.1, min_temp: 8.2, max_year: 2015, min_year: 1960 },
    7: { max_temp: 22.8, min_temp: 7.5, max_year: 2010, min_year: 1955 },
    8: { max_temp: 25.2, min_temp: 9.8, max_year: 2005, min_year: 1950 },
    9: { max_temp: 28.5, min_temp: 12.5, max_year: 2000, min_year: 1945 },
    10: { max_temp: 30.2, min_temp: 15.8, max_year: 1995, min_year: 1940 },
    11: { max_temp: 31.5, min_temp: 17.2, max_year: 1990, min_year: 1935 },
    12: { max_temp: 32.8, min_temp: 18.5, max_year: 1985, min_year: 1930 },
  },
  'default': {
    1: { max_temp: 25.0, min_temp: -15.0, max_year: 2015, min_year: 1900 },
    2: { max_temp: 26.0, min_temp: -12.0, max_year: 2010, min_year: 1905 },
    3: { max_temp: 28.0, min_temp: -8.0, max_year: 2005, min_year: 1910 },
    4: { max_temp: 30.0, min_temp: -2.0, max_year: 2000, min_year: 1915 },
    5: { max_temp: 32.0, min_temp: 5.0, max_year: 1995, min_year: 1920 },
    6: { max_temp: 35.0, min_temp: 10.0, max_year: 1990, min_year: 1925 },
    7: { max_temp: 38.0, min_temp: 12.0, max_year: 1985, min_year: 1930 },
    8: { max_temp: 37.0, min_temp: 11.0, max_year: 1980, min_year: 1935 },
    9: { max_temp: 34.0, min_temp: 8.0, max_year: 1975, min_year: 1940 },
    10: { max_temp: 30.0, min_temp: 2.0, max_year: 1970, min_year: 1945 },
    11: { max_temp: 27.0, min_temp: -5.0, max_year: 1965, min_year: 1950 },
    12: { max_temp: 24.0, min_temp: -12.0, max_year: 1960, min_year: 1955 },
  },
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const monthParam = searchParams.get('month');

  if (!country) {
    return NextResponse.json(
      { error: 'Country parameter is required' },
      { status: 400 }
    );
  }

  // Default to current month if not specified
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const targetMonth = monthParam ? parseInt(monthParam) : currentMonth;

  // Validate month
  if (targetMonth < 1 || targetMonth > 12) {
    return NextResponse.json(
      { error: 'Month must be between 1 and 12' },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    // Return mock data
    const countryData = mockExtremesData[country] || mockExtremesData['default'];
    const monthData = countryData[targetMonth] || countryData[1];

    return NextResponse.json({
      country,
      month: targetMonth,
      month_name: monthNames[targetMonth - 1],
      extremes: {
        max_temperature: monthData.max_temp,
        max_recorded_year: monthData.max_year,
        min_temperature: monthData.min_temp,
        min_recorded_year: monthData.min_year,
      },
      source: 'mock',
    });
  }

  try {
    // Query for max temperature in this month for the country
    // Using land_max_temperature field (not avg_temperature)
    const { data: maxData, error: maxError } = await supabase!
      .from('fact_temperature')
      .select(`
        land_max_temperature,
        dim_date!inner(year, month),
        dim_location!inner(country)
      `)
      .eq('dim_date.month', targetMonth)
      .eq('dim_location.country', country)
      .not('land_max_temperature', 'is', null)
      .order('land_max_temperature', { ascending: false })
      .limit(1);

    if (maxError) throw maxError;

    // Query for min temperature in this month for the country
    // Using land_min_temperature field (not avg_temperature)
    const { data: minData, error: minError } = await supabase!
      .from('fact_temperature')
      .select(`
        land_min_temperature,
        dim_date!inner(year, month),
        dim_location!inner(country)
      `)
      .eq('dim_date.month', targetMonth)
      .eq('dim_location.country', country)
      .not('land_min_temperature', 'is', null)
      .order('land_min_temperature', { ascending: true })
      .limit(1);

    if (minError) throw minError;

    interface MaxExtremeRow {
      land_max_temperature: number;
      dim_date: { year: number; month: number }[] | { year: number; month: number };
    }

    interface MinExtremeRow {
      land_min_temperature: number;
      dim_date: { year: number; month: number }[] | { year: number; month: number };
    }

    const maxRow = maxData?.[0] as MaxExtremeRow | undefined;
    const minRow = minData?.[0] as MinExtremeRow | undefined;

    const maxDimDate = maxRow ? (Array.isArray(maxRow.dim_date) ? maxRow.dim_date[0] : maxRow.dim_date) : null;
    const minDimDate = minRow ? (Array.isArray(minRow.dim_date) ? minRow.dim_date[0] : minRow.dim_date) : null;

    return NextResponse.json({
      country,
      month: targetMonth,
      month_name: monthNames[targetMonth - 1],
      extremes: {
        max_temperature: maxRow?.land_max_temperature ? Math.round(maxRow.land_max_temperature * 100) / 100 : null,
        max_recorded_year: maxDimDate?.year || null,
        min_temperature: minRow?.land_min_temperature ? Math.round(minRow.land_min_temperature * 100) / 100 : null,
        min_recorded_year: minDimDate?.year || null,
      },
      source: 'supabase',
    });
  } catch (error) {
    console.error('Error fetching temperature extremes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch temperature extremes' },
      { status: 500 }
    );
  }
}
