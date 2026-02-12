import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateTrendAnalysis, aggregateToYearly } from '@/lib/regression';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TemperatureRecord {
  avg_temperature: number;
  dim_date: {
    year: number;
    month: number;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const yearStart = parseInt(searchParams.get('yearStart') || '1900');
  const yearEnd = parseInt(searchParams.get('yearEnd') || '2015');
  const monthsParam = searchParams.get('months');

  if (!country) {
    return NextResponse.json(
      { error: 'Country parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Build the query
    let query = supabase
      .from('fact_temperature')
      .select(`
        avg_temperature,
        dim_date!inner(year, month),
        dim_location!inner(country)
      `)
      .eq('dim_location.country', country)
      .gte('dim_date.year', yearStart)
      .lte('dim_date.year', yearEnd)
      .not('avg_temperature', 'is', null);

    // Apply month filter if provided
    if (monthsParam) {
      const months = monthsParam.split(',').map(Number).filter(m => m >= 1 && m <= 12);
      if (months.length > 0 && months.length < 12) {
        query = query.in('dim_date.month', months);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: `No temperature data found for ${country}` },
        { status: 404 }
      );
    }

    // Transform data for analysis
    const monthlyData = (data as unknown as TemperatureRecord[]).map(d => ({
      year: d.dim_date.year,
      month: d.dim_date.month,
      avgTemp: d.avg_temperature,
    }));

    // Calculate historical stats
    const temperatures = monthlyData.map(d => d.avgTemp);
    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);

    // Aggregate to yearly averages for regression
    const yearlyData = aggregateToYearly(monthlyData);

    // Calculate trend analysis with forecasts for 2026-2028
    const trendAnalysis = calculateTrendAnalysis(yearlyData, [2026, 2027, 2028]);

    // Build time series for charting
    const timeSeries = yearlyData.map(d => ({
      year: d.year,
      temperature: Math.round(d.avgTemp * 100) / 100,
      trendLine: Math.round(trendAnalysis.intercept + trendAnalysis.slope * d.year * 100) / 100,
    }));

    return NextResponse.json({
      country,
      period: {
        start: yearStart,
        end: yearEnd,
      },
      historical: {
        avg_temp: Math.round(avgTemp * 100) / 100,
        max_temp: Math.round(maxTemp * 100) / 100,
        min_temp: Math.round(minTemp * 100) / 100,
        data_points: data.length,
        years_covered: yearlyData.length,
      },
      trend: {
        slope: trendAnalysis.slope,
        intercept: trendAnalysis.intercept,
        r_squared: trendAnalysis.rSquared,
        warming_rate_per_decade: trendAnalysis.warmingRatePerDecade,
        interpretation: trendAnalysis.warmingRatePerDecade > 0.1
          ? `Warming trend of +${trendAnalysis.warmingRatePerDecade}°C per decade`
          : trendAnalysis.warmingRatePerDecade < -0.1
          ? `Cooling trend of ${trendAnalysis.warmingRatePerDecade}°C per decade`
          : 'Relatively stable temperature trend',
      },
      forecast: trendAnalysis.forecasts,
      timeSeries,
      source: 'supabase',
    });
  } catch (error) {
    console.error('Error calculating trend:', error);
    return NextResponse.json(
      { error: 'Failed to calculate temperature trend' },
      { status: 500 }
    );
  }
}
