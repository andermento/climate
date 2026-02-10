import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if credentials are configured
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not configured. Using mock data.');
}

export { supabase };

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

// Mock data for development without Supabase
const mockTemperatures = [
  { avg_temperature: 15.2, avg_temperature_uncertainty: 0.5, dim_date: { full_date: '2010-01-15', year: 2010, month: 1, month_name: 'January' }, dim_location: { city: 'New York', state: 'NY', country: 'United States', latitude: 40.7128, longitude: -74.006, granularity: 'city' } },
  { avg_temperature: 22.8, avg_temperature_uncertainty: 0.3, dim_date: { full_date: '2010-01-15', year: 2010, month: 1, month_name: 'January' }, dim_location: { city: 'Los Angeles', state: 'CA', country: 'United States', latitude: 34.0522, longitude: -118.2437, granularity: 'city' } },
  { avg_temperature: 25.5, avg_temperature_uncertainty: 0.4, dim_date: { full_date: '2010-01-15', year: 2010, month: 1, month_name: 'January' }, dim_location: { city: 'Sao Paulo', state: 'SP', country: 'Brazil', latitude: -23.5505, longitude: -46.6333, granularity: 'city' } },
  { avg_temperature: 8.3, avg_temperature_uncertainty: 0.6, dim_date: { full_date: '2010-01-15', year: 2010, month: 1, month_name: 'January' }, dim_location: { city: 'London', state: null, country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, granularity: 'city' } },
  { avg_temperature: 4.2, avg_temperature_uncertainty: 0.5, dim_date: { full_date: '2010-01-15', year: 2010, month: 1, month_name: 'January' }, dim_location: { city: 'Tokyo', state: null, country: 'Japan', latitude: 35.6762, longitude: 139.6503, granularity: 'city' } },
  { avg_temperature: 26.1, avg_temperature_uncertainty: 0.3, dim_date: { full_date: '2010-01-15', year: 2010, month: 1, month_name: 'January' }, dim_location: { city: 'Sydney', state: 'NSW', country: 'Australia', latitude: -33.8688, longitude: 151.2093, granularity: 'city' } },
  { avg_temperature: -5.2, avg_temperature_uncertainty: 0.8, dim_date: { full_date: '2010-01-15', year: 2010, month: 1, month_name: 'January' }, dim_location: { city: 'Moscow', state: null, country: 'Russia', latitude: 55.7558, longitude: 37.6173, granularity: 'city' } },
  { avg_temperature: 12.5, avg_temperature_uncertainty: 0.4, dim_date: { full_date: '2010-01-15', year: 2010, month: 1, month_name: 'January' }, dim_location: { city: 'Paris', state: null, country: 'France', latitude: 48.8566, longitude: 2.3522, granularity: 'city' } },
];

const mockCountries = ['Australia', 'Brazil', 'Canada', 'China', 'France', 'Germany', 'India', 'Japan', 'Russia', 'United Kingdom', 'United States'];

const mockCities = [
  { city: 'New York', country: 'United States', state: 'NY', latitude: 40.7128, longitude: -74.006 },
  { city: 'Los Angeles', country: 'United States', state: 'CA', latitude: 34.0522, longitude: -118.2437 },
  { city: 'London', country: 'United Kingdom', state: null, latitude: 51.5074, longitude: -0.1278 },
  { city: 'Paris', country: 'France', state: null, latitude: 48.8566, longitude: 2.3522 },
  { city: 'Tokyo', country: 'Japan', state: null, latitude: 35.6762, longitude: 139.6503 },
  { city: 'Sydney', country: 'Australia', state: 'NSW', latitude: -33.8688, longitude: 151.2093 },
  { city: 'Sao Paulo', country: 'Brazil', state: 'SP', latitude: -23.5505, longitude: -46.6333 },
  { city: 'Moscow', country: 'Russia', state: null, latitude: 55.7558, longitude: 37.6173 },
];

const mockDecadeAverages = [
  { decade: 1750, avg_temp: 8.72, measurements: 120 },
  { decade: 1800, avg_temp: 8.85, measurements: 240 },
  { decade: 1850, avg_temp: 8.95, measurements: 480 },
  { decade: 1900, avg_temp: 9.12, measurements: 960 },
  { decade: 1950, avg_temp: 9.45, measurements: 1200 },
  { decade: 2000, avg_temp: 9.85, measurements: 1440 },
];

// Query helpers
export async function getTemperatures(params: {
  yearStart?: number;
  yearEnd?: number;
  months?: number[];
  country?: string;
  city?: string;
  limit?: number;
}) {
  if (!supabase) {
    // Return mock data when Supabase is not configured
    return mockTemperatures;
  }

  const { yearStart = 1743, yearEnd = 2015, months, country, city, limit = 1000 } = params;

  let query = supabase
    .from('fact_temperature')
    .select(`
      avg_temperature,
      avg_temperature_uncertainty,
      dim_date!inner(full_date, year, month, month_name),
      dim_location!inner(city, state, country, latitude, longitude, granularity)
    `)
    .gte('dim_date.year', yearStart)
    .lte('dim_date.year', yearEnd)
    .not('avg_temperature', 'is', null)
    .limit(limit);

  if (months && months.length > 0) {
    query = query.in('dim_date.month', months);
  }

  if (country) {
    query = query.eq('dim_location.country', country);
  }

  if (city) {
    query = query.eq('dim_location.city', city);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getCountries() {
  if (!supabase) {
    return mockCountries;
  }

  const { data, error } = await supabase
    .from('dim_location')
    .select('country')
    .eq('granularity', 'country')
    .not('country', 'is', null)
    .order('country');

  if (error) throw error;
  return [...new Set(data?.map(d => d.country))].filter(Boolean);
}

export async function searchCities(searchQuery: string) {
  if (!supabase) {
    return mockCities.filter(c =>
      c.city.toLowerCase().startsWith(searchQuery.toLowerCase())
    );
  }

  const { data, error } = await supabase
    .from('dim_location')
    .select('city, country, state, latitude, longitude')
    .eq('granularity', 'city')
    .ilike('city', `${searchQuery}%`)
    .limit(20);

  if (error) throw error;
  return data;
}

export async function getGlobalStats() {
  // Return the known values from the dataset
  return {
    total_records: 10_000_000,
    min_year: 1743,
    max_year: 2015,
    total_countries: 243,
    total_cities: 3490,
    avg_temperature: 14.5,
  };
}

export async function getDecadeAverages(country?: string) {
  if (!supabase) {
    return mockDecadeAverages;
  }

  let query = supabase
    .from('fact_temperature')
    .select(`
      avg_temperature,
      dim_date!inner(decade),
      dim_location!inner(granularity, country)
    `)
    .not('avg_temperature', 'is', null);

  if (country) {
    query = query.eq('dim_location.country', country);
  } else {
    query = query.eq('dim_location.granularity', 'global');
  }

  const { data, error } = await query;

  if (error) throw error;

  // Aggregate by decade
  const decadeMap = new Map<number, { sum: number; count: number }>();

  interface RowData {
    avg_temperature: number;
    dim_date: { decade: number }[] | { decade: number };
  }

  data?.forEach((row: RowData) => {
    const dimDate = Array.isArray(row.dim_date) ? row.dim_date[0] : row.dim_date;
    if (!dimDate) return;
    const decade = dimDate.decade;
    const current = decadeMap.get(decade) || { sum: 0, count: 0 };
    decadeMap.set(decade, {
      sum: current.sum + row.avg_temperature,
      count: current.count + 1,
    });
  });

  return Array.from(decadeMap.entries())
    .map(([decade, { sum, count }]) => ({
      decade,
      avg_temp: Number((sum / count).toFixed(2)),
      measurements: count,
    }))
    .sort((a, b) => a.decade - b.decade);
}
