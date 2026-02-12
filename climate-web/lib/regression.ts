// ===========================================
// Linear Regression Functions
// Used for temperature trend forecasting
// ===========================================

export interface DataPoint {
  x: number; // Independent variable (e.g., year or days since start)
  y: number; // Dependent variable (e.g., temperature)
}

export interface RegressionResult {
  slope: number;          // Rate of change per unit x
  intercept: number;      // Y-intercept
  rSquared: number;       // Coefficient of determination (0-1)
  predict: (x: number) => number; // Prediction function
}

export interface TrendAnalysis {
  slope: number;
  intercept: number;
  rSquared: number;
  warmingRatePerDecade: number;
  forecasts: {
    year: number;
    predicted: number;
    lowerBound: number;
    upperBound: number;
  }[];
}

/**
 * Performs simple linear regression on a dataset
 * Formula: y = intercept + slope * x
 */
export function linearRegression(data: DataPoint[]): RegressionResult {
  const n = data.length;

  if (n < 2) {
    return {
      slope: 0,
      intercept: data[0]?.y || 0,
      rSquared: 0,
      predict: () => data[0]?.y || 0,
    };
  }

  // Calculate sums
  const sumX = data.reduce((acc, d) => acc + d.x, 0);
  const sumY = data.reduce((acc, d) => acc + d.y, 0);
  const sumXY = data.reduce((acc, d) => acc + d.x * d.y, 0);
  const sumX2 = data.reduce((acc, d) => acc + d.x * d.x, 0);

  // Calculate slope and intercept
  const denominator = n * sumX2 - sumX * sumX;

  if (denominator === 0) {
    const avgY = sumY / n;
    return {
      slope: 0,
      intercept: avgY,
      rSquared: 0,
      predict: () => avgY,
    };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared (coefficient of determination)
  const yMean = sumY / n;
  const ssTotal = data.reduce((acc, d) => acc + Math.pow(d.y - yMean, 2), 0);
  const ssResidual = data.reduce((acc, d) => {
    const predicted = slope * d.x + intercept;
    return acc + Math.pow(d.y - predicted, 2);
  }, 0);

  const rSquared = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  return {
    slope,
    intercept,
    rSquared: Math.max(0, Math.min(1, rSquared)), // Clamp to [0, 1]
    predict: (x: number) => intercept + slope * x,
  };
}

/**
 * Calculates temperature trend analysis with forecasts
 * @param yearlyData Array of { year, avgTemp } objects
 * @param forecastYears Years to predict (e.g., [2026, 2027, 2028])
 * @param uncertaintyMargin Percentage for confidence interval (default 5%)
 */
export function calculateTrendAnalysis(
  yearlyData: { year: number; avgTemp: number }[],
  forecastYears: number[] = [2026, 2027, 2028],
  uncertaintyMargin: number = 0.05
): TrendAnalysis {
  // Convert to DataPoint format
  const dataPoints: DataPoint[] = yearlyData.map(d => ({
    x: d.year,
    y: d.avgTemp,
  }));

  const regression = linearRegression(dataPoints);

  // Calculate warming rate per decade
  const warmingRatePerDecade = regression.slope * 10;

  // Generate forecasts with confidence intervals
  const forecasts = forecastYears.map(year => {
    const predicted = regression.predict(year);
    const margin = Math.abs(predicted) * uncertaintyMargin;

    return {
      year,
      predicted: Math.round(predicted * 100) / 100,
      lowerBound: Math.round((predicted - margin) * 100) / 100,
      upperBound: Math.round((predicted + margin) * 100) / 100,
    };
  });

  return {
    slope: Math.round(regression.slope * 1000) / 1000,
    intercept: Math.round(regression.intercept * 100) / 100,
    rSquared: Math.round(regression.rSquared * 1000) / 1000,
    warmingRatePerDecade: Math.round(warmingRatePerDecade * 100) / 100,
    forecasts,
  };
}

/**
 * Aggregates monthly data to yearly averages
 */
export function aggregateToYearly(
  monthlyData: { year: number; month: number; avgTemp: number }[]
): { year: number; avgTemp: number }[] {
  const yearMap = new Map<number, { sum: number; count: number }>();

  for (const d of monthlyData) {
    const existing = yearMap.get(d.year) || { sum: 0, count: 0 };
    yearMap.set(d.year, {
      sum: existing.sum + d.avgTemp,
      count: existing.count + 1,
    });
  }

  return Array.from(yearMap.entries())
    .map(([year, { sum, count }]) => ({
      year,
      avgTemp: sum / count,
    }))
    .sort((a, b) => a.year - b.year);
}
