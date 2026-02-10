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
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ComparisonDataPoint {
  year: number;
  [key: string]: number; // Dynamic keys for each region
}

interface ComparisonChartProps {
  data: ComparisonDataPoint[];
  regions: string[];
  title?: string;
  className?: string;
}

// Colors for different regions
const REGION_COLORS = [
  '#4ecca3', // Accent green
  '#ff6b6b', // Red
  '#74c0fc', // Blue
  '#ffa94d', // Orange
  '#845ef7', // Purple
  '#ffd43b', // Yellow
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-card">
        <p className="text-sm font-medium text-text mb-2">Year: {label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey}: {entry.value.toFixed(2)}°C
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ComparisonChart({
  data,
  regions,
  title = 'Temperature Comparison',
  className,
}: ComparisonChartProps) {
  // Calculate Y axis domain
  const allTemps = data.flatMap((d) =>
    regions.map((r) => d[r]).filter((t) => t !== undefined)
  );
  const minTemp = allTemps.length > 0 ? Math.floor(Math.min(...allTemps) - 2) : 0;
  const maxTemp = allTemps.length > 0 ? Math.ceil(Math.max(...allTemps) + 2) : 30;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
              <Legend
                wrapperStyle={{
                  paddingTop: '10px',
                  fontSize: '12px',
                }}
              />
              {regions.map((region, index) => (
                <Line
                  key={region}
                  type="monotone"
                  dataKey={region}
                  name={region}
                  stroke={REGION_COLORS[index % REGION_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default ComparisonChart;
