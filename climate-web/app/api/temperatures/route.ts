import { NextRequest, NextResponse } from 'next/server';
import { getTemperatures, isSupabaseConfigured } from '@/lib/supabase';

// Mock data for development without Supabase
const MOCK_DATA = [
  { year: 1900, month: 1, avg_temperature: 8.2, city: null, country: null, latitude: null, longitude: null },
  { year: 1910, month: 1, avg_temperature: 8.4, city: null, country: null, latitude: null, longitude: null },
  { year: 1920, month: 1, avg_temperature: 8.6, city: null, country: null, latitude: null, longitude: null },
  { year: 1930, month: 1, avg_temperature: 8.9, city: null, country: null, latitude: null, longitude: null },
  { year: 1940, month: 1, avg_temperature: 9.1, city: null, country: null, latitude: null, longitude: null },
  { year: 1950, month: 1, avg_temperature: 9.0, city: null, country: null, latitude: null, longitude: null },
  { year: 1960, month: 1, avg_temperature: 9.2, city: null, country: null, latitude: null, longitude: null },
  { year: 1970, month: 1, avg_temperature: 9.3, city: null, country: null, latitude: null, longitude: null },
  { year: 1980, month: 1, avg_temperature: 9.5, city: null, country: null, latitude: null, longitude: null },
  { year: 1990, month: 1, avg_temperature: 9.8, city: null, country: null, latitude: null, longitude: null },
  { year: 2000, month: 1, avg_temperature: 10.0, city: null, country: null, latitude: null, longitude: null },
  { year: 2010, month: 1, avg_temperature: 10.3, city: null, country: null, latitude: null, longitude: null },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const yearStart = searchParams.get('yearStart')
      ? parseInt(searchParams.get('yearStart')!)
      : 1743;
    const yearEnd = searchParams.get('yearEnd')
      ? parseInt(searchParams.get('yearEnd')!)
      : 2015;
    const monthsParam = searchParams.get('months');
    const months = monthsParam ? monthsParam.split(',').map(Number) : undefined;
    const country = searchParams.get('country') || undefined;
    const city = searchParams.get('city') || undefined;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 1000;

    // Use mock data if Supabase is not configured
    if (!isSupabaseConfigured()) {
      const filteredData = MOCK_DATA.filter(
        (d) => d.year >= yearStart && d.year <= yearEnd
      );
      return NextResponse.json({
        data: filteredData,
        count: filteredData.length,
        source: 'mock',
      });
    }

    const data = await getTemperatures({
      yearStart,
      yearEnd,
      months,
      country,
      city,
      limit,
    });

    return NextResponse.json({
      data,
      count: data?.length || 0,
      source: 'supabase',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch temperature data' },
      { status: 500 }
    );
  }
}
