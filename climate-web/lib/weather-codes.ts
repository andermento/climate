// ===========================================
// WMO Weather Interpretation Codes (WW)
// Used by Open-Meteo API
// https://open-meteo.com/en/docs
// ===========================================

export interface WeatherDescription {
  description: string;
  icon: string; // Lucide icon name
}

export const WMO_CODES: Record<number, WeatherDescription> = {
  0: { description: 'Clear sky', icon: 'Sun' },
  1: { description: 'Mainly clear', icon: 'Sun' },
  2: { description: 'Partly cloudy', icon: 'CloudSun' },
  3: { description: 'Overcast', icon: 'Cloud' },
  45: { description: 'Fog', icon: 'CloudFog' },
  48: { description: 'Depositing rime fog', icon: 'CloudFog' },
  51: { description: 'Light drizzle', icon: 'CloudDrizzle' },
  53: { description: 'Moderate drizzle', icon: 'CloudDrizzle' },
  55: { description: 'Dense drizzle', icon: 'CloudDrizzle' },
  56: { description: 'Light freezing drizzle', icon: 'CloudSnow' },
  57: { description: 'Dense freezing drizzle', icon: 'CloudSnow' },
  61: { description: 'Slight rain', icon: 'CloudRain' },
  63: { description: 'Moderate rain', icon: 'CloudRain' },
  65: { description: 'Heavy rain', icon: 'CloudRain' },
  66: { description: 'Light freezing rain', icon: 'CloudSnow' },
  67: { description: 'Heavy freezing rain', icon: 'CloudSnow' },
  71: { description: 'Slight snow fall', icon: 'Snowflake' },
  73: { description: 'Moderate snow fall', icon: 'Snowflake' },
  75: { description: 'Heavy snow fall', icon: 'Snowflake' },
  77: { description: 'Snow grains', icon: 'Snowflake' },
  80: { description: 'Slight rain showers', icon: 'CloudRain' },
  81: { description: 'Moderate rain showers', icon: 'CloudRain' },
  82: { description: 'Violent rain showers', icon: 'CloudRain' },
  85: { description: 'Slight snow showers', icon: 'Snowflake' },
  86: { description: 'Heavy snow showers', icon: 'Snowflake' },
  95: { description: 'Thunderstorm', icon: 'CloudLightning' },
  96: { description: 'Thunderstorm with slight hail', icon: 'CloudLightning' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'CloudLightning' },
};

export function getWeatherDescription(code: number): WeatherDescription {
  return WMO_CODES[code] || { description: 'Unknown', icon: 'Cloud' };
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
