'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MONTH_NAMES, type SeasonalData } from '@/lib/types';

interface SeasonalChartProps {
  data: SeasonalData[];
  title?: string;
  className?: string;
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: SeasonalData }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-card">
        <p className="text-sm font-medium text-text">{data.month_name}</p>
        <p className="text-sm text-accent">
          Avg: {data.avg_temp.toFixed(2)}°C
        </p>
      </div>
    );
  }
  return null;
};

export function SeasonalChart({
  data,
  title = 'Seasonal Temperature Pattern',
  className,
}: SeasonalChartProps) {
  // Ensure we have data for all 12 months
  const chartData = MONTH_NAMES.map((name, index) => {
    const monthData = data.find((d) => d.month === index + 1);
    return {
      month: index + 1,
      month_name: name.slice(0, 3), // Abbreviated name
      avg_temp: monthData?.avg_temp ?? 0,
    };
  });

  const temps = chartData.map((d) => d.avg_temp).filter((t) => t !== 0);
  const minTemp = temps.length > 0 ? Math.min(...temps) : 0;
  const maxTemp = temps.length > 0 ? Math.max(...temps) : 30;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="#2a3a5a" />
              <PolarAngleAxis
                dataKey="month_name"
                tick={{ fill: '#a0a0a0', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[Math.floor(minTemp - 5), Math.ceil(maxTemp + 5)]}
                tick={{ fill: '#a0a0a0', fontSize: 10 }}
                tickFormatter={(value) => `${value}°`}
              />
              <Radar
                name="Temperature"
                dataKey="avg_temp"
                stroke="#4ecca3"
                fill="#4ecca3"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Seasons Legend */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
          <div className="text-center">
            <span className="text-text-muted">Winter</span>
            <p className="text-accent font-medium">Dec-Feb</p>
          </div>
          <div className="text-center">
            <span className="text-text-muted">Spring</span>
            <p className="text-accent font-medium">Mar-May</p>
          </div>
          <div className="text-center">
            <span className="text-text-muted">Summer</span>
            <p className="text-accent font-medium">Jun-Aug</p>
          </div>
          <div className="text-center">
            <span className="text-text-muted">Fall</span>
            <p className="text-accent font-medium">Sep-Nov</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SeasonalChart;
