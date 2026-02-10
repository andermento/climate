import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using mock data.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Query helpers
export async function getTemperatures(params: {
  yearStart?: number;
  yearEnd?: number;
  months?: number[];
  country?: string;
  city?: string;
  limit?: number;
}) {
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
  const { data, error } = await supabase
    .from('dim_location')
    .select('country')
    .eq('granularity', 'country')
    .not('country', 'is', null)
    .order('country');

  if (error) throw error;
  return [...new Set(data?.map(d => d.country))].filter(Boolean);
}

export async function searchCities(query: string) {
  const { data, error } = await supabase
    .from('dim_location')
    .select('city, country, state, latitude, longitude')
    .eq('granularity', 'city')
    .ilike('city', `${query}%`)
    .limit(20);

  if (error) throw error;
  return data;
}

export async function getGlobalStats() {
  // This would be a more complex query in production
  // For now, return the known values from the dataset
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
