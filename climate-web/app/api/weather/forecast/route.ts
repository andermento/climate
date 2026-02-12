import { NextRequest, NextResponse } from 'next/server';
import { getCapitalCoordinates } from '@/lib/country-capitals';
import { getWeatherDescription } from '@/lib/weather-codes';

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

interface OpenMeteoForecastResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
  };
}

interface ForecastDay {
  date: string;
  dayName: string;
  temp_max: number;
  temp_min: number;
  weather_code: number;
  weather_description: string;
  weather_icon: string;
  precipitation_probability: number;
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');

  let lat: number;
  let lon: number;

  // If lat/lon are provided, use them directly
  if (latParam && lonParam) {
    lat = parseFloat(latParam);
    lon = parseFloat(lonParam);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude values' },
        { status: 400 }
      );
    }
  } else if (country) {
    // Use country to get capital coordinates
    const capitalInfo = getCapitalCoordinates(country);

    if (!capitalInfo) {
      return NextResponse.json(
        { error: `Capital coordinates not found for country: ${country}` },
        { status: 404 }
      );
    }

    lat = capitalInfo.lat;
    lon = capitalInfo.lon;
  } else {
    return NextResponse.json(
      { error: 'Either country or lat/lon parameters are required' },
      { status: 400 }
    );
  }

  try {
    // Fetch 4-day forecast from Open-Meteo (today + 3 days)
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lon.toString());
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '4');

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data: OpenMeteoForecastResponse = await response.json();

    // Skip today (index 0), return next 3 days
    const forecast: ForecastDay[] = data.daily.time.slice(1, 4).map((date, index) => {
      const actualIndex = index + 1; // Skip today
      const weatherInfo = getWeatherDescription(data.daily.weather_code[actualIndex]);

      return {
        date,
        dayName: getDayName(date),
        temp_max: Math.round(data.daily.temperature_2m_max[actualIndex] * 10) / 10,
        temp_min: Math.round(data.daily.temperature_2m_min[actualIndex] * 10) / 10,
        weather_code: data.daily.weather_code[actualIndex],
        weather_description: weatherInfo.description,
        weather_icon: weatherInfo.icon,
        precipitation_probability: data.daily.precipitation_probability_max[actualIndex] || 0,
      };
    });

    return NextResponse.json({
      coordinates: { lat, lon },
      forecast,
      source: 'Open-Meteo',
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forecast data' },
      { status: 500 }
    );
  }
}
