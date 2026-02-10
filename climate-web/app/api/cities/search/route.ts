import { NextRequest, NextResponse } from 'next/server';
import { searchCities, isSupabaseConfigured } from '@/lib/supabase';

// Mock cities for development
const MOCK_CITIES = [
  { city: 'São Paulo', country: 'Brazil', state: 'São Paulo', latitude: -23.55, longitude: -46.64 },
  { city: 'Rio de Janeiro', country: 'Brazil', state: 'Rio de Janeiro', latitude: -22.91, longitude: -43.17 },
  { city: 'New York', country: 'United States', state: 'New York', latitude: 40.71, longitude: -74.01 },
  { city: 'Los Angeles', country: 'United States', state: 'California', latitude: 34.05, longitude: -118.24 },
  { city: 'London', country: 'United Kingdom', state: null, latitude: 51.51, longitude: -0.13 },
  { city: 'Paris', country: 'France', state: null, latitude: 48.86, longitude: 2.35 },
  { city: 'Tokyo', country: 'Japan', state: null, latitude: 35.69, longitude: 139.69 },
  { city: 'Sydney', country: 'Australia', state: 'New South Wales', latitude: -33.87, longitude: 151.21 },
  { city: 'Beijing', country: 'China', state: null, latitude: 39.90, longitude: 116.41 },
  { city: 'Mumbai', country: 'India', state: 'Maharashtra', latitude: 19.08, longitude: 72.88 },
  { city: 'Moscow', country: 'Russia', state: null, latitude: 55.76, longitude: 37.62 },
  { city: 'Berlin', country: 'Germany', state: null, latitude: 52.52, longitude: 13.40 },
  { city: 'Buenos Aires', country: 'Argentina', state: null, latitude: -34.60, longitude: -58.38 },
  { city: 'Cairo', country: 'Egypt', state: null, latitude: 30.04, longitude: 31.24 },
  { city: 'Mexico City', country: 'Mexico', state: null, latitude: 19.43, longitude: -99.13 },
  { city: 'Lagos', country: 'Nigeria', state: null, latitude: 6.52, longitude: 3.38 },
  { city: 'Singapore', country: 'Singapore', state: null, latitude: 1.35, longitude: 103.82 },
  { city: 'Seoul', country: 'South Korea', state: null, latitude: 37.57, longitude: 126.98 },
  { city: 'Toronto', country: 'Canada', state: 'Ontario', latitude: 43.65, longitude: -79.38 },
  { city: 'Lima', country: 'Peru', state: null, latitude: -12.05, longitude: -77.04 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json({ cities: [], count: 0 });
    }

    // Use mock data if Supabase is not configured
    if (!isSupabaseConfigured()) {
      const filtered = MOCK_CITIES.filter((city) =>
        city.city.toLowerCase().startsWith(query.toLowerCase())
      );
      return NextResponse.json({
        cities: filtered,
        count: filtered.length,
        source: 'mock',
      });
    }

    const cities = await searchCities(query);

    return NextResponse.json({
      cities,
      count: cities?.length || 0,
      source: 'supabase',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to search cities' },
      { status: 500 }
    );
  }
}
