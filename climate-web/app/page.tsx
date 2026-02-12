'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Database, Globe, MapPin, Search, Navigation, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { FilterPanel, DEFAULT_FILTERS } from '@/components/filters/FilterPanel';
import { MetricsCard } from '@/components/cards/MetricsCard';
import { WeatherCard } from '@/components/cards/WeatherCard';
import { ForecastCard } from '@/components/cards/ForecastCard';
import { HistoricalComparison } from '@/components/cards/HistoricalComparison';
import { CountryMap } from '@/components/map/CountryMap';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
import { DecadeChart } from '@/components/charts/DecadeChart';
import { useFilters } from '@/hooks/useFilters';
import { useGeolocation } from '@/hooks/useGeolocation';
import { parseYearFilter, parseMonthFilter, formatNumber } from '@/lib/utils';
import type {
  DecadeData,
  GlobalStats,
  MapMarker,
  CurrentWeather,
  ForecastDay,
  HistoricalData,
  ExtremesData,
} from '@/lib/types';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState<string[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [decadeData, setDecadeData] = useState<DecadeData[]>([]);
  const [temperatureData, setTemperatureData] = useState<{ year: number; temperature: number; uncertainty?: number }[]>([]);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

  // Weather state
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Historical state
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [extremesData, setExtremesData] = useState<ExtremesData | null>(null);
  const [historicalLoading, setHistoricalLoading] = useState(false);

  const { filters, setFilters, getFilterSummary } = useFilters();
  const geolocation = useGeolocation();

  // Get selected country (single selection for weather/map)
  const selectedCountry = filters.country.countries.length === 1
    ? filters.country.countries[0]
    : null;

  // Fetch weather data based on geolocation or selected country
  const fetchWeatherData = useCallback(async (lat?: number, lon?: number, country?: string) => {
    setWeatherLoading(true);
    try {
      let currentUrl: string;
      let forecastUrl: string;

      if (lat !== undefined && lon !== undefined) {
        currentUrl = `/api/weather/current?lat=${lat}&lon=${lon}`;
        forecastUrl = `/api/weather/forecast?lat=${lat}&lon=${lon}`;
      } else if (country) {
        currentUrl = `/api/weather/current?country=${encodeURIComponent(country)}`;
        forecastUrl = `/api/weather/forecast?country=${encodeURIComponent(country)}`;
      } else {
        setWeatherLoading(false);
        return;
      }

      const [currentRes, forecastRes] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl),
      ]);

      if (currentRes.ok) {
        const currentData = await currentRes.json();
        setCurrentWeather(currentData);
      }

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        setForecast(forecastData.forecast);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // Fetch historical data for selected country
  const fetchHistoricalData = useCallback(async (country: string) => {
    setHistoricalLoading(true);
    try {
      const [historicalRes, extremesRes] = await Promise.all([
        fetch(`/api/temperatures/historical?country=${encodeURIComponent(country)}`),
        fetch(`/api/temperatures/extremes?country=${encodeURIComponent(country)}`),
      ]);

      if (historicalRes.ok) {
        const data = await historicalRes.json();
        setHistoricalData(data);
      }

      if (extremesRes.ok) {
        const data = await extremesRes.json();
        setExtremesData(data);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setHistoricalLoading(false);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        const [countriesRes, globalRes] = await Promise.all([
          fetch('/api/countries'),
          fetch('/api/global'),
        ]);

        const countriesData = await countriesRes.json();
        const globalData = await globalRes.json();

        setCountries(countriesData.countries || []);
        setGlobalStats(globalData.stats);
        setDecadeData(globalData.decades || []);

        const chartData = (globalData.decades || []).map((d: DecadeData) => ({
          year: d.decade,
          temperature: d.avg_temp,
        }));
        setTemperatureData(chartData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  // Fetch weather based on geolocation (initial load)
  useEffect(() => {
    if (!geolocation.loading && geolocation.coordinates && !selectedCountry) {
      fetchWeatherData(geolocation.coordinates.lat, geolocation.coordinates.lon);
    }
  }, [geolocation.loading, geolocation.coordinates, selectedCountry, fetchWeatherData]);

  // Fetch weather when country is selected
  useEffect(() => {
    if (selectedCountry) {
      fetchWeatherData(undefined, undefined, selectedCountry);
      fetchHistoricalData(selectedCountry);
    } else {
      // Clear historical data when no country selected
      setHistoricalData(null);
      setExtremesData(null);
    }
  }, [selectedCountry, fetchWeatherData, fetchHistoricalData]);

  // Fetch temperature data when filters change
  useEffect(() => {
    async function fetchFilteredData() {
      const yearRange = parseYearFilter(filters.year);
      const months = parseMonthFilter(filters.month);

      const params = new URLSearchParams({
        yearStart: yearRange.start.toString(),
        yearEnd: yearRange.end.toString(),
      });

      if (months.length < 12) {
        params.set('months', months.join(','));
      }

      if (selectedCountry) {
        params.set('country', selectedCountry);
      }

      try {
        const res = await fetch(`/api/temperatures?${params}`);
        const data = await res.json();

        if (data.data) {
          interface TemperatureRecord {
            avg_temperature: number;
            dim_location: {
              city: string | null;
              country: string | null;
              latitude: number | null;
              longitude: number | null;
              granularity: string;
            };
          }

          const markers: MapMarker[] = data.data
            .filter((d: TemperatureRecord) =>
              d.dim_location?.latitude &&
              d.dim_location?.longitude &&
              d.dim_location?.granularity === 'city'
            )
            .slice(0, 500)
            .map((d: TemperatureRecord, i: number) => ({
              id: `marker-${i}`,
              city: d.dim_location?.city || 'Unknown',
              country: d.dim_location?.country || 'Unknown',
              latitude: d.dim_location.latitude!,
              longitude: d.dim_location.longitude!,
              temperature: d.avg_temperature,
            }));
          setMapMarkers(markers);
        }
      } catch (error) {
        console.error('Error fetching filtered data:', error);
      }
    }

    fetchFilteredData();
  }, [filters, selectedCountry]);

  // Show map only when a country is selected
  const showCountryMap = selectedCountry !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar with Filters */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          countries={countries}
        />
      </Sidebar>

      {/* Main Content */}
      <main className="pt-16 lg:pl-72">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Country Search/Filter - Prominent Position */}
          <div className="glass-card p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-accent" />
                <div>
                  <h2 className="text-lg font-semibold text-text">Explore Climate Data</h2>
                  <p className="text-sm text-text-muted">
                    {selectedCountry
                      ? `Showing data for ${selectedCountry}`
                      : 'Select a country from the sidebar to see detailed information'}
                  </p>
                </div>
              </div>

              {/* Geolocation status */}
              {!selectedCountry && (
                <div className="flex items-center gap-2 text-sm">
                  {geolocation.loading ? (
                    <span className="text-text-muted">Detecting location...</span>
                  ) : geolocation.error ? (
                    <span className="flex items-center gap-1 text-yellow-500">
                      <AlertCircle className="h-4 w-4" />
                      Using default location (Brazil)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-accent">
                      <Navigation className="h-4 w-4" />
                      {geolocation.city}, {geolocation.country}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid - Changes based on country selection */}
          <div className={`grid gap-6 ${showCountryMap ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Left Column: Weather Cards */}
            <div className="space-y-6 order-2 lg:order-1">
              {/* Current Weather Card */}
              <WeatherCard
                data={currentWeather}
                isLoading={weatherLoading}
              />

              {/* 3-Day Forecast Card */}
              <ForecastCard
                forecast={forecast}
                isLoading={weatherLoading}
              />
            </div>

            {/* Right Column: Country Map (only when country selected) */}
            {showCountryMap && (
              <div className="order-1 lg:order-2">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-5 w-5 text-accent" />
                    <span className="text-lg font-semibold text-text">{selectedCountry}</span>
                  </div>
                  <CountryMap
                    selectedCountry={selectedCountry}
                    className="h-[300px] lg:h-[400px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Historical Comparison - Below weather cards */}
          {(selectedCountry || historicalData || extremesData) && (
            <HistoricalComparison
              country={selectedCountry || 'Global'}
              currentTemp={currentWeather?.current.temperature}
              historicalData={historicalData}
              extremesData={extremesData}
              isLoading={historicalLoading}
            />
          )}

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard
              title="Total Records"
              value={globalStats ? formatNumber(globalStats.total_records) : '—'}
              subtitle="Temperature measurements"
              icon={Database}
            />
            <MetricsCard
              title="Time Period"
              value={globalStats ? `${globalStats.min_year}-${globalStats.max_year}` : '—'}
              subtitle="272 years of data"
              icon={Database}
            />
            <MetricsCard
              title="Countries"
              value={globalStats?.total_countries ?? '—'}
              subtitle="Global coverage"
              icon={Globe}
            />
            <MetricsCard
              title="Cities"
              value={globalStats ? formatNumber(globalStats.total_cities) : '—'}
              subtitle="Monitoring stations"
              icon={MapPin}
            />
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            <TemperatureChart
              data={temperatureData}
              title="Global Temperature Trend"
              showUncertainty={false}
            />
            <DecadeChart
              data={decadeData}
              title="Average Temperature by Decade"
            />
          </div>

          {/* Climate Insights */}
          {decadeData.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-text mb-4">Climate Insights</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-text-muted">Coldest Decade</p>
                  <p className="text-xl font-bold text-temp-cold">
                    {Math.min(...decadeData.map(d => d.decade))}s
                  </p>
                  <p className="text-sm text-text-muted">
                    {Math.min(...decadeData.map(d => d.avg_temp)).toFixed(2)}°C average
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Warmest Decade</p>
                  <p className="text-xl font-bold text-temp-hot">
                    {decadeData.reduce((max, d) => d.avg_temp > max.avg_temp ? d : max, decadeData[0]).decade}s
                  </p>
                  <p className="text-sm text-text-muted">
                    {Math.max(...decadeData.map(d => d.avg_temp)).toFixed(2)}°C average
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Temperature Change</p>
                  <p className="text-xl font-bold text-accent">
                    +{(decadeData[decadeData.length - 1]?.avg_temp - decadeData[0]?.avg_temp).toFixed(2)}°C
                  </p>
                  <p className="text-sm text-text-muted">
                    Since {decadeData[0]?.decade}s
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center py-8 text-sm text-text-muted border-t border-border">
            <p>
              Data source:{' '}
              <a
                href="http://berkeleyearth.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Berkeley Earth
              </a>
            </p>
            <p className="mt-2">
              Built with Next.js, Tailwind CSS, and Mapbox
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
