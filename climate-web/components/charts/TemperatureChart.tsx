'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataPoint {
  year: number;
  temperature: number;
  uncertainty?: number;
}

interface TemperatureChartProps {
  data: DataPoint[];
  title?: string;
  showUncertainty?: boolean;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const temp = payload.find((p) => p.dataKey === 'temperature');
    const uncertainty = payload.find((p) => p.dataKey === 'uncertainty');

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-card">
        <p className="text-sm font-medium text-text">Year: {label}</p>
        {temp && (
          <p className="text-sm text-accent">
            Temperature: {temp.value.toFixed(2)}°C
          </p>
        )}
        {uncertainty && (
          <p className="text-xs text-text-muted">
            Uncertainty: ±{uncertainty.value.toFixed(2)}°C
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function TemperatureChart({
  data,
  title = 'Temperature Over Time',
  showUncertainty = true,
  className,
}: TemperatureChartProps) {
  // Calculate min/max for Y axis
  const temps = data.map((d) => d.temperature);
  const minTemp = Math.floor(Math.min(...temps) - 1);
  const maxTemp = Math.ceil(Math.max(...temps) + 1);

  // Prepare data with uncertainty bands
  const chartData = data.map((d) => ({
    ...d,
    tempLow: d.uncertainty ? d.temperature - d.uncertainty : d.temperature,
    tempHigh: d.uncertainty ? d.temperature + d.uncertainty : d.temperature,
  }));

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5a" />
              <XAxis
                dataKey="year"
                stroke="#a0a0a0"
                tick={{ fill: '#a0a0a0', fontSize: 12 }}
                tickLine={{ stroke: '#a0a0a0' }}
              />
              <YAxis
                domain={[minTemp, maxTemp]}
                stroke="#a0a0a0"
                tick={{ fill: '#a0a0a0', fontSize: 12 }}
                tickLine={{ stroke: '#a0a0a0' }}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Uncertainty band */}
              {showUncertainty && (
                <Area
                  type="monotone"
                  dataKey="tempHigh"
                  stroke="none"
                  fill="#4ecca3"
                  fillOpacity={0.1}
                />
              )}

              {/* Main temperature line */}
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#4ecca3"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#4ecca3' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-accent rounded" />
            <span>Temperature</span>
          </div>
          {showUncertainty && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-accent/20 rounded" />
              <span>Uncertainty</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TemperatureChart;
