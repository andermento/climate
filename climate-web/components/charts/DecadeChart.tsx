'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn, getDecadeLabel } from '@/lib/utils';
import type { DecadeData } from '@/lib/types';

interface DecadeChartProps {
  data: DecadeData[];
  title?: string;
  className?: string;
}

// Color gradient based on temperature
const getBarColor = (temp: number, minTemp: number, maxTemp: number): string => {
  const range = maxTemp - minTemp;
  const normalized = (temp - minTemp) / range;

  // Gradient from cold to hot
  if (normalized < 0.25) return '#4ecdc4'; // Cold
  if (normalized < 0.5) return '#74c0fc';  // Cool
  if (normalized < 0.75) return '#ffd43b'; // Neutral
  if (normalized < 0.9) return '#ffa94d';  // Warm
  return '#ff6b6b';                         // Hot
};

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: DecadeData }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-card">
        <p className="text-sm font-medium text-text">{getDecadeLabel(data.decade)}</p>
        <p className="text-sm text-accent">
          Avg: {data.avg_temp.toFixed(2)}°C
        </p>
        <p className="text-xs text-text-muted">
          {data.measurements.toLocaleString()} measurements
        </p>
      </div>
    );
  }
  return null;
};

export function DecadeChart({
  data,
  title = 'Temperature by Decade',
  className,
}: DecadeChartProps) {
  const temps = data.map((d) => d.avg_temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  // Format decade for display
  const chartData = data.map((d) => ({
    ...d,
    decadeLabel: getDecadeLabel(d.decade),
  }));

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5a" vertical={false} />
              <XAxis
                dataKey="decadeLabel"
                stroke="#a0a0a0"
                tick={{ fill: '#a0a0a0', fontSize: 10 }}
                tickLine={{ stroke: '#a0a0a0' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#a0a0a0"
                tick={{ fill: '#a0a0a0', fontSize: 12 }}
                tickLine={{ stroke: '#a0a0a0' }}
                tickFormatter={(value) => `${value}°`}
                domain={[Math.floor(minTemp - 1), Math.ceil(maxTemp + 1)]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg_temp" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.avg_temp, minTemp, maxTemp)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature gradient legend */}
        <div className="mt-4">
          <div className="h-2 w-full rounded temp-gradient" />
          <div className="flex justify-between mt-1 text-xs text-text-muted">
            <span>Cold</span>
            <span>Hot</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DecadeChart;
