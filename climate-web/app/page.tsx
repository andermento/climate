'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Database, Globe, Thermometer, MapPin, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { FilterPanel, DEFAULT_FILTERS } from '@/components/filters/FilterPanel';
import { MetricsCard } from '@/components/cards/MetricsCard';
import { ClimateMap } from '@/components/map/ClimateMap';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
import { DecadeChart } from '@/components/charts/DecadeChart';
import { useFilters } from '@/hooks/useFilters';
import { parseYearFilter, parseMonthFilter, formatNumber } from '@/lib/utils';
import type { CityData, DecadeData, GlobalStats, MapMarker } from '@/lib/types';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState<string[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [decadeData, setDecadeData] = useState<DecadeData[]>([]);
  const [temperatureData, setTemperatureData] = useState<{ year: number; temperature: number; uncertainty?: number }[]>([]);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

  const { filters, setFilters, getFilterSummary } = useFilters();

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        // Fetch countries and global stats in parallel
        const [countriesRes, globalRes] = await Promise.all([
          fetch('/api/countries'),
          fetch('/api/global'),
        ]);

        const countriesData = await countriesRes.json();
        const globalData = await globalRes.json();

        setCountries(countriesData.countries || []);
        setGlobalStats(globalData.stats);
        setDecadeData(globalData.decades || []);

        // Transform decade data for temperature chart
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

      if (filters.country.countries.length === 1) {
        params.set('country', filters.country.countries[0]);
      }

      if (filters.city.selected) {
        params.set('city', filters.city.selected.city);
      }

      try {
        const res = await fetch(`/api/temperatures?${params}`);
        const data = await res.json();

        // Create map markers from temperature data
        if (data.data) {
          const markers: MapMarker[] = data.data
            .filter((d: { latitude: number | null; longitude: number | null }) => d.latitude && d.longitude)
            .slice(0, 500)
            .map((d: { city: string; country: string; latitude: number; longitude: number; avg_temperature: number }, i: number) => ({
              id: `marker-${i}`,
              city: d.city || 'Unknown',
              country: d.country || 'Unknown',
              latitude: d.latitude,
              longitude: d.longitude,
              temperature: d.avg_temperature,
            }));
          setMapMarkers(markers);
        }
      } catch (error) {
        console.error('Error fetching filtered data:', error);
      }
    }

    fetchFilteredData();
  }, [filters]);

  // City search handler
  const handleCitySearch = useCallback(async (query: string): Promise<CityData[]> => {
    try {
      const res = await fetch(`/api/cities/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      return data.cities || [];
    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }, []);

  // City select handler
  const handleCitySelect = useCallback((city: CityData) => {
    // Could zoom map to city location here
    console.log('Selected city:', city);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSearch={(query) => {
          setFilters({
            ...filters,
            city: { query, results: [], selected: undefined },
          });
        }}
      />

      {/* Sidebar with Filters */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          countries={countries}
          onCitySearch={handleCitySearch}
          onCitySelect={handleCitySelect}
        />
      </Sidebar>

      {/* Main Content */}
      <main className="pt-16 lg:pl-72">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Filter Summary */}
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>Showing:</span>
            <span className="text-accent font-medium">{getFilterSummary()}</span>
          </div>

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
              icon={TrendingUp}
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

          {/* Map Section */}
          <div className="glass-card p-4">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-accent" />
              Temperature Map
            </h2>
            <ClimateMap
              markers={mapMarkers}
              className="h-[400px] lg:h-[500px]"
              onMarkerClick={(marker) => console.log('Clicked:', marker)}
            />
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Temperature Over Time */}
            <TemperatureChart
              data={temperatureData}
              title="Global Temperature Trend"
              showUncertainty={false}
            />

            {/* Decade Averages */}
            <DecadeChart
              data={decadeData}
              title="Average Temperature by Decade"
            />
          </div>

          {/* Warming Trend Summary */}
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
