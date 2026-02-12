'use client';

import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
  lat: number;
  lon: number;
}

interface LocationInfo {
  city: string | null;
  country: string | null;
  coordinates: Coordinates | null;
}

interface GeolocationState {
  coordinates: Coordinates | null;
  city: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

// Fallback: Brasilia, Brazil
const FALLBACK_LOCATION: LocationInfo = {
  city: 'Brasilia',
  country: 'Brazil',
  coordinates: { lat: -15.7801, lon: -47.9292 },
};

const STORAGE_KEY = 'climate_user_location';

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; country: string } | null> {
  try {
    // Using Open-Meteo's geocoding API for reverse lookup
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ClimateExplorer/1.0',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      city: data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || 'Unknown',
      country: data.address?.country || 'Unknown',
    };
  } catch {
    return null;
  }
}

function getCachedLocation(): LocationInfo | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Cache expires after 1 hour
      if (Date.now() - parsed.timestamp < 3600000) {
        return {
          city: parsed.city,
          country: parsed.country,
          coordinates: parsed.coordinates,
        };
      }
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function setCachedLocation(location: LocationInfo): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...location,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignore cache errors
  }
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    city: null,
    country: null,
    loading: true,
    error: null,
    permissionStatus: 'unknown',
  });

  const requestLocation = useCallback(async () => {
    // Check for cached location first
    const cached = getCachedLocation();
    if (cached && cached.coordinates) {
      setState({
        coordinates: cached.coordinates,
        city: cached.city,
        country: cached.country,
        loading: false,
        error: null,
        permissionStatus: 'granted',
      });
      return;
    }

    // Check if geolocation is available
    if (!navigator.geolocation) {
      setState({
        ...FALLBACK_LOCATION,
        loading: false,
        error: 'Geolocation not supported',
        permissionStatus: 'denied',
      });
      return;
    }

    // Check permission status if available
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permissionStatus: permission.state as 'granted' | 'denied' | 'prompt' }));

        // Listen for permission changes
        permission.onchange = () => {
          setState(prev => ({ ...prev, permissionStatus: permission.state as 'granted' | 'denied' | 'prompt' }));
        };
      } catch {
        // Permission API not supported
      }
    }

    // Request geolocation
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        // Get city name via reverse geocoding
        const locationInfo = await reverseGeocode(coordinates.lat, coordinates.lon);

        const newLocation: LocationInfo = {
          coordinates,
          city: locationInfo?.city || null,
          country: locationInfo?.country || null,
        };

        // Cache the location
        setCachedLocation(newLocation);

        setState({
          ...newLocation,
          loading: false,
          error: null,
          permissionStatus: 'granted',
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        // Use fallback location (Brazil)
        setState({
          ...FALLBACK_LOCATION,
          loading: false,
          error: errorMessage,
          permissionStatus: error.code === error.PERMISSION_DENIED ? 'denied' : 'unknown',
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const refresh = useCallback(() => {
    // Clear cache and re-request
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setState(prev => ({ ...prev, loading: true, error: null }));
    requestLocation();
  }, [requestLocation]);

  return {
    ...state,
    refresh,
    isUsingFallback: state.permissionStatus === 'denied' || state.error !== null,
  };
}

export default useGeolocation;
