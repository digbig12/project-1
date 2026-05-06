'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  LineChart as RechartsLineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Download, 
  Filter,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { TaxEstimator } from '@/components/TaxEstimator';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { 
  getMonthlyPerformance, 
  getExpenseBreakdown, 
  getBusinessForecast,
  exportTransactionsToCSV
} from '@/lib/actions';
import { cn } from '@/lib/utils';
import { DynamicIcon } from '@/components/DynamicIcon';
import { getSubscriptionAction } from '@/actions/stripe';
import { UpgradeGate } from '@/components/UpgradeGate';

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
    getSubscriptionAction().then((sub) => setIsPro(sub.isPro));
  }, []);

  const fetchData = async () => {
    try {
      const [perf, expense] = await Promise.all([
        getMonthlyPerformance(),
        getExpenseBreakdown()
      ]);
      setPerformanceData(perf);
      setExpenseData(expense);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    const csvData = await exportTransactionsToCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biz_analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateForecast = async () => {
    setIsForecasting(true);
    setForecastError(null);
    try {
      const result = await getBusinessForecast();
      if (result.success) {
        setForecastData(result.forecast || []);
      } else {
        setForecastError(result.error || 'Failed to generate forecast');
      }
    } catch (error: any) {
      console.error('Forecasting failed:', error);
      setForecastError(error.message || 'An unexpected error occurred during forecasting.');
    } finally {
      setIsForecasting(false);
    }
  };

  // Merge historical and forecast data
  const chartData = [
    ...performanceData.map(d => ({ ...d, type: 'historical' })),
    ...forecastData.map(d => ({ 
      ...d, 
      sales: d.revenue, 
      expenses: d.expenses, 
      type: 'forecast' 
    }))
  ];

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
          <p className="text-secondary mt-1">Deep-dive into your business performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={isPro ? handleGenerateForecast : undefined}
            disabled={isForecasting || !isPro}
            title={!isPro ? 'Upgrade to Advanced to unlock AI Forecasting' : ''}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border shadow-lg relative",
              !isPro
                ? "bg-white/5 text-secondary/50 border-white/10 cursor-not-allowed"
                : forecastData.length > 0 
                  ? "bg-white/5 text-secondary border-white/10 hover:text-white" 
                  : "bg-primary text-white border-primary/20 hover:shadow-primary/20"
            )}
          >
            {isForecasting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            <span>{!isPro ? 'AI Forecast' : forecastData.length > 0 ? 'Update Forecast' : 'AI Forecast'}</span>
            {!isPro && (
              <span className="text-[8px] font-black bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                PRO
              </span>
            )}
          </button>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-card/30 backdrop-blur-md border border-border px-4 py-2.5 rounded-xl text-secondary hover:text-white transition-all shadow-lg"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Forecast Error or Loading State */}
      <AnimatePresence>
        {(forecastError || isForecasting) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {forecastError ? (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between gap-4 animate-shake">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} />
                  <div>
                    <p className="font-black text-[10px] uppercase tracking-widest mb-0.5">Forecasting Error</p>
                    <p className="text-sm opacity-80">{forecastError}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setForecastError(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Calendar size={16} />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-primary flex items-center gap-3 shadow-inner">
                <Loader2 size={18} className="animate-spin" />
                <p className="text-sm font-bold tracking-wide uppercase italic">Gemini 1.5 is calculating future projections based on your sales velocity...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards — Dynamic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(() => {
          // Compute Growth Rate from last 2 months of performance data
          const recentMonths = performanceData.slice(-3);
          let growthRate = 0;
          if (recentMonths.length >= 2) {
            const current = recentMonths[recentMonths.length - 1]?.sales || 0;
            const previous = recentMonths[recentMonths.length - 2]?.sales || 1;
            growthRate = ((current - previous) / previous) * 100;
          }
          const isPositiveGrowth = growthRate >= 0;

          // Compute Expense Ratio
          const totalSales = performanceData.reduce((s: number, m: any) => s + (m.sales || 0), 0);
          const totalExpenses = performanceData.reduce((s: number, m: any) => s + (m.expenses || 0), 0);
          const expenseRatio = totalSales > 0 ? (totalExpenses / totalSales) * 100 : 0;

          // Efficiency Score
          const efficiency = expenseRatio < 60 ? 'Optimal' : expenseRatio < 80 ? 'Good' : expenseRatio < 95 ? 'Moderate' : 'Critical';
          const efficiencyColor = expenseRatio < 60 ? 'text-violet-400' : expenseRatio < 80 ? 'text-blue-400' : expenseRatio < 95 ? 'text-amber-400' : 'text-red-400';

          return (
            <>
              <GlassCard delay={0.1} className="flex items-center gap-6 p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <TrendingUp size={32} />
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary uppercase tracking-widest">Growth Rate</p>
                  <h3 className="text-3xl font-black mt-1 flex items-center gap-2 tabular-nums">
                    {isPositiveGrowth ? '+' : ''}{growthRate.toFixed(1)}%
                    {isPositiveGrowth 
                      ? <ArrowUpRight className="text-green-500 w-6 h-6" /> 
                      : <ArrowDownRight className="text-red-500 w-6 h-6" />
                    }
                  </h3>
                  <p className="text-[10px] text-secondary mt-1">vs. previous month</p>
                </div>
              </GlassCard>
              <GlassCard delay={0.2} className="flex items-center gap-6 p-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                  <Target size={32} />
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary uppercase tracking-widest">Expense Ratio</p>
                  <h3 className="text-3xl font-black mt-1 tabular-nums">{expenseRatio.toFixed(1)}%</h3>
                  <p className="text-[10px] text-secondary mt-1">of total revenue</p>
                </div>
              </GlassCard>
              <GlassCard delay={0.3} className="flex items-center gap-6 p-8">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-500">
                  <Zap size={32} />
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary uppercase tracking-widest">Efficiency</p>
                  <h3 className="text-3xl font-black mt-1 flex items-center gap-2">
                    {efficiency}
                    <ShieldCheck className={`${efficiencyColor} w-6 h-6`} />
                  </h3>
                  <p className="text-[10px] text-secondary mt-1">operational health</p>
                </div>
              </GlassCard>
            </>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue vs. Expenses Chart */}
        <GlassCard delay={0.4}>
          <div className="mb-8">
            <h3 className="text-xl font-bold">Revenue vs. Expenses</h3>
            <p className="text-sm text-secondary">History and AI-projected cash flow</p>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)' }} />
                <Tooltip 
                  cursor={{ fill: 'white', opacity: 0.05 }}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                />
                <Legend iconType="circle" />
                <Bar 
                  dataKey="sales" 
                  name="Revenue" 
                  radius={[4, 4, 0, 0]} 
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-sales-${index}`} 
                      fill={entry.type === 'forecast' ? 'var(--primary-glow)' : 'var(--primary)'} 
                      fillOpacity={entry.type === 'forecast' ? 0.6 : 1}
                    />
                  ))}
                </Bar>
                <Bar 
                  dataKey="expenses" 
                  name="Expenses" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Profitability Trajectory */}
        <GlassCard delay={0.5}>
          <div className="mb-8">
            <h3 className="text-xl font-bold">Profitability Trajectory</h3>
            <p className="text-sm text-secondary">Net profit trend with AI projection</p>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--secondary)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="var(--primary)" 
                  strokeWidth={4} 
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.type === 'forecast') {
                      return <circle cx={cx} cy={cy} r={6} fill="white" stroke="var(--primary)" strokeWidth={2} />;
                    }
                    return <circle cx={cx} cy={cy} r={6} fill="var(--primary)" />;
                  }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Expense Composition — Advanced */}
        <GlassCard delay={0.6}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Expense Composition</h3>
              <p className="text-sm text-secondary">Capital allocation with month-over-month trends</p>
            </div>
            {expenseData.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.15em] bg-foreground/5 px-3 py-1.5 rounded-lg">
                  {expenseData.length} cost centers
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Donut Chart with Center Total */}
            <div className="relative h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
                    paddingAngle={3}
                    dataKey="value"
                    cornerRadius={8}
                    strokeWidth={0}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer" 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderColor: 'var(--border)', 
                      borderRadius: '14px',
                      fontSize: '12px',
                      boxShadow: '0 10px 30px -5px rgb(0 0 0 / 0.3)',
                      padding: '12px 16px'
                    }} 
                    formatter={(value: any, name: any, props: any) => {
                      const entry = props.payload;
                      return [`₹${entry.amount?.toLocaleString('en-IN') || value} (${value}%)`, entry.name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Total */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Total Spend</p>
                  <p className="text-2xl font-black tabular-nums tracking-tight mt-1">
                    ₹{expenseData.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-secondary mt-0.5">{expenseData.length} categories</p>
                </div>
              </div>
            </div>

            {/* Right: Detailed Category Table */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
              {expenseData.map((item, i) => (
                <motion.div 
                  key={item.name}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.04 }}
                  className="group hover:bg-foreground/5 p-3 rounded-xl transition-all cursor-default"
                >
                  {/* Row: Icon + Name + Amount + Trend */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" 
                        style={{ backgroundColor: item.color + '18' }}
                      >
                        <DynamicIcon name={item.icon || 'Tag'} size={14} style={{ color: item.color }} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">{item.name}</span>
                        <span className="text-[10px] text-secondary ml-2 tabular-nums">{item.value}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* MoM Trend */}
                      {item.trend && item.trend !== 'flat' && (
                        <span className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                          item.trend === 'up' 
                            ? 'text-red-400 bg-red-500/10' 
                            : 'text-emerald-400 bg-emerald-500/10'
                        }`}>
                          {item.trend === 'up' ? '↑' : '↓'}
                          {Math.abs(item.trendPct || 0)}% MoM
                        </span>
                      )}
                      {item.trend === 'flat' && (
                        <span className="text-[9px] font-black text-secondary/40 px-1.5 py-0.5 rounded-md bg-foreground/5">
                          — Stable
                        </span>
                      )}
                      <span className="font-bold text-sm tabular-nums">₹{(item.amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ delay: 0.7 + i * 0.05, duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              ))}
              {expenseData.length === 0 && (
                <div className="h-full flex items-center justify-center py-16">
                  <p className="text-sm text-secondary italic">No expense data available. Add transactions to see your cost distribution.</p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Growth Forecast Insight */}
        <GlassCard delay={0.7} className="flex flex-col justify-center p-12 bg-primary/5">
          <div className="max-w-md">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-3xl font-bold mb-4">You're on track for a record Q3.</h2>
            <p className="text-lg text-secondary leading-relaxed mb-8">
              Based on your current sales velocity and expense optimization, your net profit is projected to increase by <span className="text-white font-bold">18-22%</span> in the next quarter.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <TrendingUp className="text-green-500" />
              <p className="text-sm font-medium">Recommended: Maintain current Marketing budget while scaling R&D efficiency.</p>
            </div>
          </div>
        </GlassCard>

        {/* Business Resilience Row */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <TaxEstimator />
          <SubscriptionManager />
        </div>
      </div>
    </div>
  );
}
