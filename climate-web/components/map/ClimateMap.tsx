'use client';

import React, { useCallback, useRef, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import type { MapRef, ViewStateChangeEvent, HeatmapLayer } from 'react-map-gl';
import { cn, getTemperatureColor, formatTemperature } from '@/lib/utils';
import type { MapMarker, MapViewport } from '@/lib/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ClimateMapProps {
  markers?: MapMarker[];
  viewport?: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  showHeatmap?: boolean;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Default map style (dark)
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

// Heatmap layer configuration
const heatmapLayer: Omit<HeatmapLayer, 'source'> = {
  id: 'temperature-heat',
  type: 'heatmap',
  paint: {
    'heatmap-weight': 0.5,
    'heatmap-intensity': 1,
    'heatmap-radius': 15,
    'heatmap-opacity': 0.7,
  },
};

export function ClimateMap({
  markers = [],
  viewport: initialViewport,
  onViewportChange,
  onMarkerClick,
  showHeatmap = true,
  className,
}: ClimateMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [viewState, setViewState] = useState({
    latitude: initialViewport?.latitude ?? 20,
    longitude: initialViewport?.longitude ?? 0,
    zoom: initialViewport?.zoom ?? 2,
  });

  // Convert markers to GeoJSON for heatmap
  const heatmapData = React.useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: markers.map((marker) => ({
      type: 'Feature' as const,
      properties: {
        temperature: marker.temperature,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [marker.longitude, marker.latitude],
      },
    })),
  }), [markers]);

  const handleMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewState(evt.viewState);
      onViewportChange?.({
        latitude: evt.viewState.latitude,
        longitude: evt.viewState.longitude,
        zoom: evt.viewState.zoom,
      });
    },
    [onViewportChange]
  );

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    onMarkerClick?.(marker);
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className={cn('flex items-center justify-center bg-card rounded-lg', className)}>
        <div className="text-center p-8">
          <p className="text-text-muted mb-2">Mapbox token not configured</p>
          <p className="text-xs text-text-dark">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Navigation controls */}
        <NavigationControl position="top-right" />

        {/* Heatmap layer */}
        {showHeatmap && markers.length > 0 && (
          <Source id="temperature-data" type="geojson" data={heatmapData}>
            <Layer {...heatmapLayer} />
          </Source>
        )}

        {/* Individual markers (shown at higher zoom levels) */}
        {viewState.zoom > 5 &&
          markers.slice(0, 100).map((marker) => (
            <Marker
              key={marker.id}
              latitude={marker.latitude}
              longitude={marker.longitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(marker);
              }}
            >
              <div
                className="w-3 h-3 rounded-full cursor-pointer border-2 border-background shadow-md transition-transform hover:scale-150"
                style={{ backgroundColor: getTemperatureColor(marker.temperature) }}
                title={`${marker.city}: ${formatTemperature(marker.temperature)}`}
              />
            </Marker>
          ))}

        {/* Selected marker popup */}
        {selectedMarker && (
          <Popup
            latitude={selectedMarker.latitude}
            longitude={selectedMarker.longitude}
            anchor="bottom"
            onClose={() => setSelectedMarker(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="min-w-[150px]">
              <h3 className="font-medium text-text">{selectedMarker.city}</h3>
              <p className="text-sm text-text-muted">{selectedMarker.country}</p>
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getTemperatureColor(selectedMarker.temperature) }}
                />
                <span className="text-lg font-bold" style={{ color: getTemperatureColor(selectedMarker.temperature) }}>
                  {formatTemperature(selectedMarker.temperature)}
                </span>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Temperature legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
        <p className="text-xs text-text-muted mb-2">Temperature</p>
        <div className="w-32 h-2 rounded temp-gradient" />
        <div className="flex justify-between mt-1 text-xs text-text-muted">
          <span>-20°C</span>
          <span>30°C</span>
        </div>
      </div>

      {/* Marker count */}
      {markers.length > 0 && (
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
          <p className="text-xs text-text-muted">
            <span className="text-accent font-medium">{markers.length.toLocaleString()}</span> data points
          </p>
        </div>
      )}
    </div>
  );
}

export default ClimateMap;
