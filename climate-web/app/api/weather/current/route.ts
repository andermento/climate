import { NextRequest, NextResponse } from 'next/server';
import { getCapitalCoordinates } from '@/lib/country-capitals';
import { getWeatherDescription, getWindDirection } from '@/lib/weather-codes';

export const runtime = 'edge';
export const revalidate = 1800; // Cache for 30 minutes

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
}

interface ReverseGeocodeResponse {
  results?: Array<{
    name: string;
    country: string;
    admin1?: string;
  }>;
}

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; country: string } | null> {
  try {
    const url = `https://api.open-meteo.com/v1/geocode?latitude=${lat}&longitude=${lon}&count=1`;
    const response = await fetch(url);

    if (!response.ok) {
      // Fallback to nominatim
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`;
      const nominatimRes = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'ClimateExplorer/1.0' },
      });

      if (nominatimRes.ok) {
        const data = await nominatimRes.json();
        return {
          city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
          country: data.address?.country || 'Unknown',
        };
      }
      return null;
    }

    const data: ReverseGeocodeResponse = await response.json();

    if (data.results && data.results.length > 0) {
      return {
        city: data.results[0].name || data.results[0].admin1 || 'Unknown',
        country: data.results[0].country || 'Unknown',
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');

  let lat: number;
  let lon: number;
  let capital: string;
  let countryName: string;

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

    // Get city name from coordinates
    const geoInfo = await reverseGeocode(lat, lon);
    capital = geoInfo?.city || 'Current Location';
    countryName = geoInfo?.country || 'Unknown';
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
    capital = capitalInfo.capital;
    countryName = country;
  } else {
    return NextResponse.json(
      { error: 'Either country or lat/lon parameters are required' },
      { status: 400 }
    );
  }

  try {

    // Fetch current weather and daily forecast from Open-Meteo
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lon.toString());
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m');
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_max');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '1');

    const response = await fetch(url.toString(), {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data: OpenMeteoResponse = await response.json();

    const weatherInfo = getWeatherDescription(data.current.weather_code);
    const windDirection = getWindDirection(data.current.wind_direction_10m);

    return NextResponse.json({
      country: countryName,
      capital,
      coordinates: { lat, lon },
      current: {
        temperature: Math.round(data.current.temperature_2m * 10) / 10,
        feels_like: Math.round(data.current.apparent_temperature * 10) / 10,
        humidity: data.current.relative_humidity_2m,
        weather_code: data.current.weather_code,
        weather_description: weatherInfo.description,
        weather_icon: weatherInfo.icon,
        wind_speed: Math.round(data.current.wind_speed_10m * 10) / 10,
        wind_direction: windDirection,
      },
      forecast: {
        max_temp: Math.round(data.daily.temperature_2m_max[0] * 10) / 10,
        min_temp: Math.round(data.daily.temperature_2m_min[0] * 10) / 10,
        precipitation_probability: data.daily.precipitation_probability_max[0] || 0,
      },
      source: 'Open-Meteo',
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
