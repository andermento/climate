import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const revalidate = 3600; // Cache for 1 hour

// Mock data for development
const mockHistoricalData: Record<string, { year: number; avg_temp: number }[]> = {
  'Brazil': [
    { year: 1976, avg_temp: 24.2 },
    { year: 1975, avg_temp: 24.0 },
    { year: 1965, avg_temp: 23.8 },
  ],
  'United States': [
    { year: 1976, avg_temp: 12.5 },
    { year: 1975, avg_temp: 12.3 },
    { year: 1965, avg_temp: 12.1 },
  ],
  'default': [
    { year: 1976, avg_temp: 14.5 },
    { year: 1975, avg_temp: 14.3 },
    { year: 1965, avg_temp: 14.1 },
  ],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const yearParam = searchParams.get('year');

  if (!country) {
    return NextResponse.json(
      { error: 'Country parameter is required' },
      { status: 400 }
    );
  }

  // Default to 50 years ago if not specified
  const currentYear = new Date().getFullYear();
  const targetYear = yearParam ? parseInt(yearParam) : currentYear - 50;

  // Ensure year is within dataset range (1743-2015)
  const validYear = Math.min(Math.max(targetYear, 1743), 2015);

  if (!isSupabaseConfigured()) {
    // Return mock data
    const countryData = mockHistoricalData[country] || mockHistoricalData['default'];
    const yearData = countryData.find(d => d.year === validYear) || countryData[0];

    return NextResponse.json({
      country,
      year: yearData.year,
      avg_temperature: yearData.avg_temp,
      comparison: {
        years_ago: currentYear - yearData.year,
        data_available: true,
      },
      source: 'mock',
    });
  }

  try {
    // Query for the specific year and country
    const { data, error } = await supabase!
      .from('fact_temperature')
      .select(`
        avg_temperature,
        dim_date!inner(year),
        dim_location!inner(country, granularity)
      `)
      .eq('dim_date.year', validYear)
      .eq('dim_location.country', country)
      .not('avg_temperature', 'is', null);

    if (error) throw error;

    if (!data || data.length === 0) {
      // Try to find the closest year with data
      const { data: closestData, error: closestError } = await supabase!
        .from('fact_temperature')
        .select(`
          avg_temperature,
          dim_date!inner(year),
          dim_location!inner(country)
        `)
        .eq('dim_location.country', country)
        .lte('dim_date.year', validYear)
        .not('avg_temperature', 'is', null)
        .order('dim_date.year', { ascending: false })
        .limit(100);

      if (closestError) throw closestError;

      if (closestData && closestData.length > 0) {
        interface HistoricalRow {
          avg_temperature: number;
          dim_date: { year: number }[] | { year: number };
        }

        const avgTemp = closestData.reduce((sum: number, row: HistoricalRow) => sum + row.avg_temperature, 0) / closestData.length;
        const dimDate = Array.isArray(closestData[0].dim_date) ? closestData[0].dim_date[0] : closestData[0].dim_date;
        const actualYear = dimDate?.year || validYear;

        return NextResponse.json({
          country,
          year: actualYear,
          avg_temperature: Math.round(avgTemp * 100) / 100,
          comparison: {
            years_ago: currentYear - actualYear,
            data_available: true,
            note: `Closest available data from ${actualYear}`,
          },
          source: 'supabase',
        });
      }

      return NextResponse.json({
        country,
        year: validYear,
        avg_temperature: null,
        comparison: {
          years_ago: currentYear - validYear,
          data_available: false,
        },
        source: 'supabase',
      });
    }

    // Calculate average temperature for the year
    const avgTemp = data.reduce((sum, row) => sum + row.avg_temperature, 0) / data.length;

    return NextResponse.json({
      country,
      year: validYear,
      avg_temperature: Math.round(avgTemp * 100) / 100,
      data_points: data.length,
      comparison: {
        years_ago: currentYear - validYear,
        data_available: true,
      },
      source: 'supabase',
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}
