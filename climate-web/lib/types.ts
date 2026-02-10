// ===========================================
// Climate Web - TypeScript Types
// ===========================================

// Database Types (matching Supabase schema)
export interface DimDate {
  date_id: number;
  full_date: string;
  year: number;
  month: number;
  month_name: string;
  quarter: number;
  decade: number;
  century: number;
  is_modern_era: boolean;
}

export interface DimLocation {
  location_id: number;
  granularity: 'global' | 'country' | 'state' | 'major_city' | 'city';
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  latitude_raw: string | null;
  longitude_raw: string | null;
  hemisphere_ns: 'N' | 'S' | null;
  hemisphere_ew: 'E' | 'W' | null;
}

export interface FactTemperature {
  temperature_id: number;
  date_id: number;
  location_id: number;
  avg_temperature: number | null;
  avg_temperature_uncertainty: number | null;
  land_max_temperature: number | null;
  land_max_temp_uncertainty: number | null;
  land_min_temperature: number | null;
  land_min_temp_uncertainty: number | null;
  land_ocean_avg_temperature: number | null;
  land_ocean_avg_temp_uncertainty: number | null;
  source_file: string;
  loaded_at: string;
}

// API Response Types
export interface TemperatureData {
  full_date: string;
  year: number;
  month: number;
  month_name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  avg_temperature: number | null;
  avg_temperature_uncertainty: number | null;
}

export interface CountryData {
  country: string;
  count: number;
}

export interface CityData {
  city: string;
  country: string;
  state: string | null;
  latitude: number;
  longitude: number;
}

export interface GlobalStats {
  total_records: number;
  min_year: number;
  max_year: number;
  total_countries: number;
  total_cities: number;
  avg_temperature: number;
}

export interface DecadeData {
  decade: number;
  avg_temp: number;
  measurements: number;
}

export interface SeasonalData {
  month: number;
  month_name: string;
  avg_temp: number;
}

// Filter Types
export interface YearFilter {
  type: 'single' | 'range' | 'multiple';
  single?: number;
  range?: {
    start: number;
    end: number;
  };
  multiple?: number[];
}

export interface MonthFilter {
  type: 'single' | 'multiple' | 'season';
  single?: number;
  multiple?: number[];
  season?: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface CountryFilter {
  countries: string[];
}

export interface CitySearch {
  query: string;
  results: CityData[];
  selected?: CityData;
}

export interface Filters {
  year: YearFilter;
  month: MonthFilter;
  country: CountryFilter;
  city: CitySearch;
}

// Map Types
export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  temperature: number;
  city: string;
  country: string;
}

// Chart Types
export interface ChartDataPoint {
  name: string;
  value: number;
  uncertainty?: number;
}

// Season constants
export const SEASONS = {
  spring: [3, 4, 5],    // Mar, Apr, May
  summer: [6, 7, 8],    // Jun, Jul, Aug
  fall: [9, 10, 11],    // Sep, Oct, Nov
  winter: [12, 1, 2],   // Dec, Jan, Feb
} as const;

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;
