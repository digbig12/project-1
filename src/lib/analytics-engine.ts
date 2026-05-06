/**
 * BizAnalytics Statistical Engine
 * ================================
 * Pure TypeScript computation module — no AI dependency.
 * Computes moving averages, growth rates, seasonality,
 * forecasts, and confidence intervals from raw transaction data.
 */

export interface MonthlyAggregate {
  key: string;        // "2026-04"
  label: string;      // "Apr"
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
  txnCount: number;
}

export interface ForecastPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface BusinessMetrics {
  // Growth
  revenueGrowthMoM: number;       // % month-over-month
  expenseGrowthMoM: number;
  revenueGrowthQoQ: number;       // % quarter-over-quarter
  profitMargin: number;           // %

  // Health
  burnRate: number;               // months of runway
  expenseToRevenueRatio: number;  // %

  // Averages
  avgMonthlyRevenue: number;
  avgMonthlyExpenses: number;
  avgMonthlyProfit: number;

  // Trends
  revenueDirection: 'growing' | 'declining' | 'stable';
  expenseDirection: 'growing' | 'declining' | 'stable';

  // Risk
  topExpenseCategory: string;
  topExpensePct: number;
  fastestGrowingCost: string;
  fastestGrowingCostRate: number;

  // Data quality
  monthsOfData: number;
  totalTransactions: number;
}

// ─── Core: Aggregate transactions by month ───

export function aggregateByMonth(transactions: any[]): MonthlyAggregate[] {
  const map: Record<string, MonthlyAggregate> = {};

  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short' });

    if (!map[key]) {
      map[key] = { key, label, year: d.getFullYear(), month: d.getMonth(), revenue: 0, expenses: 0, profit: 0, txnCount: 0 };
    }

    if (t.type === 'SALE') {
      map[key].revenue += t.amount;
    } else {
      map[key].expenses += t.amount;
    }
    map[key].txnCount++;
  }

  // Compute profit and sort chronologically
  return Object.values(map)
    .map(m => ({ ...m, profit: m.revenue - m.expenses }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

// ─── Weighted Moving Average ───

export function weightedMovingAverage(values: number[], window: number = 3): number {
  if (values.length === 0) return 0;
  const recent = values.slice(-window);
  // Weights: most recent gets highest weight
  // e.g., for window=3: weights [1, 2, 3] → latest is 3x more important
  let weightSum = 0;
  let valueSum = 0;
  for (let i = 0; i < recent.length; i++) {
    const weight = i + 1;
    valueSum += recent[i] * weight;
    weightSum += weight;
  }
  return weightSum > 0 ? valueSum / weightSum : 0;
}

// ─── Growth Rate (%) ───

export function growthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// ─── Seasonality Index ───
// Returns a multiplier for each month (1.0 = average)

export function seasonalityIndex(aggregates: MonthlyAggregate[]): Record<number, number> {
  const monthTotals: Record<number, number[]> = {};

  for (const agg of aggregates) {
    if (!monthTotals[agg.month]) monthTotals[agg.month] = [];
    monthTotals[agg.month].push(agg.revenue);
  }

  const overallAvg = aggregates.reduce((s, a) => s + a.revenue, 0) / (aggregates.length || 1);
  const index: Record<number, number> = {};

  for (let m = 0; m < 12; m++) {
    const values = monthTotals[m] || [];
    if (values.length === 0) {
      index[m] = 1.0; // No data → neutral
    } else {
      const monthAvg = values.reduce((s, v) => s + v, 0) / values.length;
      index[m] = overallAvg > 0 ? monthAvg / overallAvg : 1.0;
    }
  }

  return index;
}

// ─── Category Trends ───

export function categoryTrends(transactions: any[]): { name: string; growth: number; total: number }[] {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentMonth: Record<string, number> = {};
  const prevMonth: Record<string, number> = {};
  const totals: Record<string, number> = {};

  for (const t of transactions) {
    if (t.type !== 'EXPENSE') continue;
    const catName = t.category?.name || 'General';
    const d = new Date(t.date);

    totals[catName] = (totals[catName] || 0) + t.amount;

    if (d >= currentMonthStart) {
      currentMonth[catName] = (currentMonth[catName] || 0) + t.amount;
    } else if (d >= prevMonthStart && d < currentMonthStart) {
      prevMonth[catName] = (prevMonth[catName] || 0) + t.amount;
    }
  }

  return Object.keys(totals).map(name => ({
    name,
    total: totals[name],
    growth: prevMonth[name] ? growthRate(currentMonth[name] || 0, prevMonth[name]) : 0
  })).sort((a, b) => b.total - a.total);
}

// ─── Statistical Forecast ───

export function forecastNextMonths(
  aggregates: MonthlyAggregate[],
  months: number = 3
): ForecastPoint[] {
  if (aggregates.length < 2) {
    // Not enough data — return flat projection
    const last = aggregates[aggregates.length - 1] || { revenue: 0, expenses: 0, profit: 0 };
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return Array.from({ length: months }, (_, i) => ({
      month: names[(now.getMonth() + 1 + i) % 12],
      revenue: Math.round(last.revenue),
      expenses: Math.round(last.expenses),
      profit: Math.round(last.profit),
      confidence: 'low' as const
    }));
  }

  const revenues = aggregates.map(a => a.revenue);
  const expenses = aggregates.map(a => a.expenses);

  // Compute trends from recent data
  const recentRevenues = revenues.slice(-6);
  const recentExpenses = expenses.slice(-6);

  // Weighted moving averages
  const revWMA = weightedMovingAverage(recentRevenues);
  const expWMA = weightedMovingAverage(recentExpenses);

  // MoM growth rates (average of last 3 months)
  const revGrowthRates: number[] = [];
  const expGrowthRates: number[] = [];
  for (let i = Math.max(1, recentRevenues.length - 3); i < recentRevenues.length; i++) {
    if (recentRevenues[i - 1] > 0) {
      revGrowthRates.push((recentRevenues[i] - recentRevenues[i - 1]) / recentRevenues[i - 1]);
    }
    if (recentExpenses[i - 1] > 0) {
      expGrowthRates.push((recentExpenses[i] - recentExpenses[i - 1]) / recentExpenses[i - 1]);
    }
  }

  const avgRevGrowth = revGrowthRates.length > 0
    ? revGrowthRates.reduce((s, g) => s + g, 0) / revGrowthRates.length
    : 0;
  const avgExpGrowth = expGrowthRates.length > 0
    ? expGrowthRates.reduce((s, g) => s + g, 0) / expGrowthRates.length
    : 0;

  // Seasonality adjustment
  const seasonal = seasonalityIndex(aggregates);

  // Generate forecasts
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const forecast: ForecastPoint[] = [];

  for (let i = 0; i < months; i++) {
    const targetMonth = (now.getMonth() + 1 + i) % 12;
    const seasonalFactor = seasonal[targetMonth] || 1.0;

    // Base: WMA × (1 + growth)^step × seasonal factor
    const revBase = revWMA * Math.pow(1 + avgRevGrowth, i + 1) * seasonalFactor;
    const expBase = expWMA * Math.pow(1 + avgExpGrowth, i + 1);

    // Clamp: don't allow negative or unreasonably large swings
    const revForecast = Math.max(0, Math.round(revBase));
    const expForecast = Math.max(0, Math.round(expBase));

    // Confidence based on data quality
    const confidence = aggregates.length >= 6 ? 'high' : aggregates.length >= 3 ? 'medium' : 'low';

    forecast.push({
      month: monthNames[targetMonth],
      revenue: revForecast,
      expenses: expForecast,
      profit: revForecast - expForecast,
      confidence: confidence as any
    });
  }

  return forecast;
}

// ─── Confidence Intervals ───

export function confidenceIntervals(
  aggregates: MonthlyAggregate[],
  months: number = 3
): { month: string; low: number; mid: number; high: number }[] {
  const baseForecast = forecastNextMonths(aggregates, months);
  const revenues = aggregates.map(a => a.revenue);

  // Standard deviation of recent revenues for interval width
  const mean = revenues.reduce((s, v) => s + v, 0) / (revenues.length || 1);
  const variance = revenues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (revenues.length || 1);
  const stdDev = Math.sqrt(variance);
  const coeffOfVariation = mean > 0 ? stdDev / mean : 0.2;

  return baseForecast.map((f, i) => {
    const spread = f.revenue * Math.min(coeffOfVariation * (i + 1) * 0.5, 0.4); // Wider as further out
    return {
      month: f.month,
      low: Math.round(f.revenue - spread),
      mid: f.revenue,
      high: Math.round(f.revenue + spread)
    };
  });
}

// ─── Compute Full Business Metrics ───

export function computeBusinessMetrics(
  transactions: any[],
  aggregates: MonthlyAggregate[],
  expenseBreakdown: any[]
): BusinessMetrics {
  const recent3 = aggregates.slice(-3);
  const prev3 = aggregates.slice(-6, -3);

  // MoM Growth (last 2 months)
  const last = aggregates[aggregates.length - 1];
  const secondLast = aggregates[aggregates.length - 2];
  const revenueGrowthMoM = secondLast ? growthRate(last?.revenue || 0, secondLast.revenue) : 0;
  const expenseGrowthMoM = secondLast ? growthRate(last?.expenses || 0, secondLast.expenses) : 0;

  // QoQ Growth
  const q1Rev = recent3.reduce((s, a) => s + a.revenue, 0);
  const q0Rev = prev3.reduce((s, a) => s + a.revenue, 0);
  const revenueGrowthQoQ = growthRate(q1Rev, q0Rev);

  // Averages
  const avgMonthlyRevenue = aggregates.length > 0
    ? aggregates.reduce((s, a) => s + a.revenue, 0) / aggregates.length : 0;
  const avgMonthlyExpenses = aggregates.length > 0
    ? aggregates.reduce((s, a) => s + a.expenses, 0) / aggregates.length : 0;
  const avgMonthlyProfit = avgMonthlyRevenue - avgMonthlyExpenses;

  // Margin & Ratios
  const totalRev = aggregates.reduce((s, a) => s + a.revenue, 0);
  const totalExp = aggregates.reduce((s, a) => s + a.expenses, 0);
  const profitMargin = totalRev > 0 ? ((totalRev - totalExp) / totalRev) * 100 : 0;
  const expenseToRevenueRatio = totalRev > 0 ? (totalExp / totalRev) * 100 : 0;

  // Burn Rate (months of runway at current monthly profit)
  const lastProfit = last?.profit || 0;
  const burnRate = lastProfit > 0 ? 999 : lastProfit < 0 ? Math.abs(totalRev / Math.abs(lastProfit)) : 0;

  // Trends
  const revDirection = revenueGrowthMoM > 3 ? 'growing' : revenueGrowthMoM < -3 ? 'declining' : 'stable';
  const expDirection = expenseGrowthMoM > 3 ? 'growing' : expenseGrowthMoM < -3 ? 'declining' : 'stable';

  // Category risks
  const catTrends = categoryTrends(transactions);
  const topCat = catTrends[0] || { name: 'N/A', total: 0, growth: 0 };
  const totalCatExpense = catTrends.reduce((s, c) => s + c.total, 0);
  const topExpensePct = totalCatExpense > 0 ? (topCat.total / totalCatExpense) * 100 : 0;

  const fastestGrowing = catTrends.filter(c => c.growth > 0).sort((a, b) => b.growth - a.growth)[0];

  return {
    revenueGrowthMoM: Math.round(revenueGrowthMoM * 10) / 10,
    expenseGrowthMoM: Math.round(expenseGrowthMoM * 10) / 10,
    revenueGrowthQoQ: Math.round(revenueGrowthQoQ * 10) / 10,
    profitMargin: Math.round(profitMargin * 10) / 10,
    burnRate: Math.round(burnRate),
    expenseToRevenueRatio: Math.round(expenseToRevenueRatio * 10) / 10,
    avgMonthlyRevenue: Math.round(avgMonthlyRevenue),
    avgMonthlyExpenses: Math.round(avgMonthlyExpenses),
    avgMonthlyProfit: Math.round(avgMonthlyProfit),
    revenueDirection: revDirection,
    expenseDirection: expDirection,
    topExpenseCategory: topCat.name,
    topExpensePct: Math.round(topExpensePct),
    fastestGrowingCost: fastestGrowing?.name || 'N/A',
    fastestGrowingCostRate: Math.round(fastestGrowing?.growth || 0),
    monthsOfData: aggregates.length,
    totalTransactions: transactions.length
  };
}

// ─── Format metrics for AI prompts ───

export function formatMetricsForPrompt(metrics: BusinessMetrics, forecast: ForecastPoint[]): string {
  return `
COMPUTED BUSINESS METRICS (Statistical — verified from transaction data):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Revenue Growth: ${metrics.revenueGrowthMoM > 0 ? '+' : ''}${metrics.revenueGrowthMoM}% MoM | ${metrics.revenueGrowthQoQ > 0 ? '+' : ''}${metrics.revenueGrowthQoQ}% QoQ
• Expense Growth: ${metrics.expenseGrowthMoM > 0 ? '+' : ''}${metrics.expenseGrowthMoM}% MoM
• Revenue Trend: ${metrics.revenueDirection} | Expense Trend: ${metrics.expenseDirection}
• Profit Margin: ${metrics.profitMargin}% | Expense-to-Revenue Ratio: ${metrics.expenseToRevenueRatio}%
• Avg Monthly Revenue: ₹${metrics.avgMonthlyRevenue.toLocaleString()}
• Avg Monthly Expenses: ₹${metrics.avgMonthlyExpenses.toLocaleString()}
• Avg Monthly Profit: ₹${metrics.avgMonthlyProfit.toLocaleString()}
• Burn Rate: ${metrics.burnRate > 900 ? 'Profitable (no burn)' : metrics.burnRate + ' months runway'}
• Top Expense: ${metrics.topExpenseCategory} (${metrics.topExpensePct}% of total)
• Fastest Growing Cost: ${metrics.fastestGrowingCost} (+${metrics.fastestGrowingCostRate}% MoM)
• Data Coverage: ${metrics.monthsOfData} months, ${metrics.totalTransactions} transactions

STATISTICAL FORECAST (pre-computed baseline — refine, do NOT replace):
${forecast.map(f => `• ${f.month}: Revenue ₹${f.revenue.toLocaleString()} | Expenses ₹${f.expenses.toLocaleString()} | Profit ₹${f.profit.toLocaleString()} [${f.confidence} confidence]`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}
