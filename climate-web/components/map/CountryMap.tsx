'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';
import { getCapitalCoordinates } from '@/lib/country-capitals';
import { AlertCircle, Globe } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
mapboxgl.accessToken = MAPBOX_TOKEN;

interface CountryMapProps {
  selectedCountry: string | null;
  className?: string;
}

// Mapping from our database country names to ISO country codes
const COUNTRY_TO_ISO: Record<string, string> = {
  'Afghanistan': 'AFG',
  'Albania': 'ALB',
  'Algeria': 'DZA',
  'Angola': 'AGO',
  'Argentina': 'ARG',
  'Armenia': 'ARM',
  'Australia': 'AUS',
  'Austria': 'AUT',
  'Azerbaijan': 'AZE',
  'Bahrain': 'BHR',
  'Bangladesh': 'BGD',
  'Belarus': 'BLR',
  'Belgium': 'BEL',
  'Benin': 'BEN',
  'Bolivia': 'BOL',
  'Bosnia And Herzegovina': 'BIH',
  'Botswana': 'BWA',
  'Brazil': 'BRA',
  'Bulgaria': 'BGR',
  'Burkina Faso': 'BFA',
  'Burma': 'MMR',
  'Burundi': 'BDI',
  'Cambodia': 'KHM',
  'Cameroon': 'CMR',
  'Canada': 'CAN',
  'Central African Republic': 'CAF',
  'Chad': 'TCD',
  'Chile': 'CHL',
  'China': 'CHN',
  'Colombia': 'COL',
  'Congo': 'COG',
  'Congo (Democratic Republic Of The)': 'COD',
  'Costa Rica': 'CRI',
  "Côte D'Ivoire": 'CIV',
  'Croatia': 'HRV',
  'Cuba': 'CUB',
  'Cyprus': 'CYP',
  'Czech Republic': 'CZE',
  'Denmark': 'DNK',
  'Dominican Republic': 'DOM',
  'Ecuador': 'ECU',
  'Egypt': 'EGY',
  'El Salvador': 'SLV',
  'Eritrea': 'ERI',
  'Estonia': 'EST',
  'Ethiopia': 'ETH',
  'Finland': 'FIN',
  'France': 'FRA',
  'Gabon': 'GAB',
  'Gambia': 'GMB',
  'Georgia': 'GEO',
  'Germany': 'DEU',
  'Ghana': 'GHA',
  'Greece': 'GRC',
  'Guatemala': 'GTM',
  'Guinea': 'GIN',
  'Haiti': 'HTI',
  'Honduras': 'HND',
  'Hungary': 'HUN',
  'Iceland': 'ISL',
  'India': 'IND',
  'Indonesia': 'IDN',
  'Iran': 'IRN',
  'Iraq': 'IRQ',
  'Ireland': 'IRL',
  'Israel': 'ISR',
  'Italy': 'ITA',
  'Jamaica': 'JAM',
  'Japan': 'JPN',
  'Jordan': 'JOR',
  'Kazakhstan': 'KAZ',
  'Kenya': 'KEN',
  'Kuwait': 'KWT',
  'Kyrgyzstan': 'KGZ',
  'Laos': 'LAO',
  'Latvia': 'LVA',
  'Lebanon': 'LBN',
  'Lesotho': 'LSO',
  'Liberia': 'LBR',
  'Libya': 'LBY',
  'Lithuania': 'LTU',
  'Luxembourg': 'LUX',
  'Macedonia': 'MKD',
  'Madagascar': 'MDG',
  'Malawi': 'MWI',
  'Malaysia': 'MYS',
  'Mali': 'MLI',
  'Mauritania': 'MRT',
  'Mexico': 'MEX',
  'Moldova': 'MDA',
  'Mongolia': 'MNG',
  'Morocco': 'MAR',
  'Mozambique': 'MOZ',
  'Namibia': 'NAM',
  'Nepal': 'NPL',
  'Netherlands': 'NLD',
  'New Zealand': 'NZL',
  'Nicaragua': 'NIC',
  'Niger': 'NER',
  'Nigeria': 'NGA',
  'North Korea': 'PRK',
  'Norway': 'NOR',
  'Oman': 'OMN',
  'Pakistan': 'PAK',
  'Panama': 'PAN',
  'Papua New Guinea': 'PNG',
  'Paraguay': 'PRY',
  'Peru': 'PER',
  'Philippines': 'PHL',
  'Poland': 'POL',
  'Portugal': 'PRT',
  'Qatar': 'QAT',
  'Romania': 'ROU',
  'Russia': 'RUS',
  'Rwanda': 'RWA',
  'Saudi Arabia': 'SAU',
  'Senegal': 'SEN',
  'Serbia': 'SRB',
  'Sierra Leone': 'SLE',
  'Singapore': 'SGP',
  'Slovakia': 'SVK',
  'Slovenia': 'SVN',
  'Somalia': 'SOM',
  'South Africa': 'ZAF',
  'South Korea': 'KOR',
  'Spain': 'ESP',
  'Sri Lanka': 'LKA',
  'Sudan': 'SDN',
  'Swaziland': 'SWZ',
  'Sweden': 'SWE',
  'Switzerland': 'CHE',
  'Syria': 'SYR',
  'Taiwan': 'TWN',
  'Tajikistan': 'TJK',
  'Tanzania': 'TZA',
  'Thailand': 'THA',
  'Togo': 'TGO',
  'Tunisia': 'TUN',
  'Turkey': 'TUR',
  'Turkmenistan': 'TKM',
  'Uganda': 'UGA',
  'Ukraine': 'UKR',
  'United Arab Emirates': 'ARE',
  'United Kingdom': 'GBR',
  'United States': 'USA',
  'Uruguay': 'URY',
  'Uzbekistan': 'UZB',
  'Venezuela': 'VEN',
  'Vietnam': 'VNM',
  'Yemen': 'YEM',
  'Zambia': 'ZMB',
  'Zimbabwe': 'ZWE',
};

export function CountryMap({ selectedCountry, className }: CountryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    // Skip if no token
    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox token not configured');
      return;
    }

    if (!mapContainer.current || map.current) return;

    // Reset error state
    setMapError(null);

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 1.5,
        projection: 'mercator',
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error);
        setMapError(e.error?.message || 'Failed to load map');
      });

      map.current.on('load', () => {
        setMapLoaded(true);

        // Add country boundaries source
        map.current?.addSource('countries', {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
        });

        // Add highlight layer (initially hidden)
        map.current?.addLayer({
          id: 'country-highlight',
          type: 'fill',
          source: 'countries',
          'source-layer': 'country_boundaries',
          paint: {
            'fill-color': '#90EE90', // Light green
            'fill-opacity': 0.6,
          },
          filter: ['==', 'iso_3166_1_alpha_3', ''],
        });

        // Add border layer for highlighted country
        map.current?.addLayer({
          id: 'country-border',
          type: 'line',
          source: 'countries',
          'source-layer': 'country_boundaries',
          paint: {
            'line-color': '#228B22', // Forest green
            'line-width': 2,
          },
          filter: ['==', 'iso_3166_1_alpha_3', ''],
        });
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(error instanceof Error ? error.message : 'Failed to initialize map');
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update highlighted country
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (selectedCountry) {
      const isoCode = COUNTRY_TO_ISO[selectedCountry] || '';

      if (isoCode) {
        // Update filters to show the selected country
        map.current.setFilter('country-highlight', ['==', 'iso_3166_1_alpha_3', isoCode]);
        map.current.setFilter('country-border', ['==', 'iso_3166_1_alpha_3', isoCode]);

        // Fly to the country's capital
        const capital = getCapitalCoordinates(selectedCountry);
        if (capital) {
          map.current.flyTo({
            center: [capital.lon, capital.lat],
            zoom: 4,
            duration: 1500,
          });
        }
      }
    } else {
      // Clear highlight
      map.current.setFilter('country-highlight', ['==', 'iso_3166_1_alpha_3', '']);
      map.current.setFilter('country-border', ['==', 'iso_3166_1_alpha_3', '']);

      // Reset view
      map.current.flyTo({
        center: [0, 20],
        zoom: 1.5,
        duration: 1000,
      });
    }
  }, [selectedCountry, mapLoaded]);

  // Show error state (including missing token)
  if (mapError) {
    const isTokenError = mapError.includes('token') || mapError.includes('Token');
    return (
      <div className={cn('relative rounded-lg overflow-hidden bg-card', className)}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <AlertCircle className={cn('h-12 w-12 mb-3', isTokenError ? 'text-yellow-500' : 'text-red-500')} />
          <p className="text-text font-medium text-center">
            {isTokenError ? 'Mapbox token not configured' : 'Failed to load map'}
          </p>
          <p className="text-sm text-text-muted text-center mt-1">
            {isTokenError ? 'Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local' : mapError}
          </p>
          {!isTokenError && (
            <p className="text-xs text-text-muted text-center mt-2">
              Check browser console for details
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      <div ref={mapContainer} className="absolute inset-0" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card">
          <Globe className="h-8 w-8 text-accent animate-pulse mb-2" />
          <div className="text-text-muted">Loading map...</div>
        </div>
      )}
    </div>
  );
}

export default CountryMap;
