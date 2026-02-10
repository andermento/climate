import { NextResponse } from 'next/server';
import { getCountries, isSupabaseConfigured } from '@/lib/supabase';

// Mock country list for development
const MOCK_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia',
  'Austria', 'Bangladesh', 'Belgium', 'Bolivia', 'Brazil',
  'Bulgaria', 'Cambodia', 'Cameroon', 'Canada', 'Chile',
  'China', 'Colombia', 'Congo', 'Costa Rica', 'Cuba',
  'Czech Republic', 'Denmark', 'Ecuador', 'Egypt', 'Ethiopia',
  'Finland', 'France', 'Germany', 'Ghana', 'Greece',
  'Guatemala', 'Haiti', 'Honduras', 'Hungary', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kuwait', 'Lebanon', 'Libya', 'Malaysia',
  'Mexico', 'Morocco', 'Nepal', 'Netherlands', 'New Zealand',
  'Nigeria', 'Norway', 'Pakistan', 'Panama', 'Paraguay',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Romania',
  'Russia', 'Saudi Arabia', 'Senegal', 'Singapore', 'South Africa',
  'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden',
  'Switzerland', 'Syria', 'Taiwan', 'Tanzania', 'Thailand',
  'Tunisia', 'Turkey', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
];

export async function GET() {
  try {
    // Use mock data if Supabase is not configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        countries: MOCK_COUNTRIES,
        count: MOCK_COUNTRIES.length,
        source: 'mock',
      });
    }

    const countries = await getCountries();

    return NextResponse.json({
      countries,
      count: countries?.length || 0,
      source: 'supabase',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
