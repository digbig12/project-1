'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  ShoppingBag, 
  Target,
  IndianRupee,
  Activity,
  Clock,
  Zap,
  CalendarDays
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { StatsCard } from '@/components/StatsCard';
import { AIBusinessSummary } from '@/components/AIBusinessSummary';
import { AIAlerts } from '@/components/AIAlerts';
import { UpgradeNudge, PlanBadge } from '@/components/UpgradeGate';
import { RevenueHeatmap } from '@/components/RevenueHeatmap';
import { getDashboardStats, getMonthlyPerformance, getExpenseBreakdown } from '@/lib/actions';
import { getSubscriptionAction } from '@/actions/stripe';
import { DynamicIcon } from '@/components/DynamicIcon';

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, salesCount: 0, netProfit: 0, conversion: 0, displayName: '' });
  const [monthlyPerformance, setMonthlyPerformance] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('12months');
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
    getSubscriptionAction().then((sub) => setIsPro(sub.isPro));
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, perfData, expenseData] = await Promise.all([
        getDashboardStats(),
        getMonthlyPerformance(),
        getExpenseBreakdown()
      ]);
      
      setStats(statsData);
      setMonthlyPerformance(perfData);
      setExpenseBreakdown(expenseData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section - Enhanced */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-widest"
          >
            <CalendarDays size={14} />
            <span>{today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tight"
          >
            {greeting}, <span className="gradient-text">{stats.displayName || 'there'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-secondary text-sm flex items-center gap-2"
          >
            Here&apos;s your business intelligence overview.
            <PlanBadge isPro={isPro} />
          </motion.p>
        </div>
        
        {/* Live Status Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 bg-card/50 backdrop-blur-md border border-border/50 px-4 py-2.5 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Live</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-secondary">
            <Activity size={14} />
            <span className="text-xs font-medium">All systems operational</span>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid - Enhanced with unique accent colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard 
          label="Total Revenue" 
          value={isLoading ? undefined : `₹${stats.revenue.toLocaleString()}`} 
          trend={12.5} 
          trendLabel="vs last month"
          icon={IndianRupee}
          delay={0.1}
          accentColor="blue"
        />
        <StatsCard 
          label="New Sales" 
          value={isLoading ? undefined : stats.salesCount.toLocaleString()} 
          trend={8.2} 
          trendLabel="vs last month"
          icon={ShoppingBag}
          delay={0.15}
          accentColor="green"
        />
        <StatsCard 
          label="Net Profit" 
          value={isLoading ? undefined : `₹${stats.netProfit.toLocaleString()}`} 
          trend={-2.4} 
          trendLabel="vs last month"
          icon={TrendingUp}
          delay={0.2}
          accentColor="violet"
        />
        <StatsCard 
          label="Conversion" 
          value={isLoading ? undefined : `${stats.conversion}%`} 
          trend={4.1} 
          trendLabel="vs last month"
          icon={Target}
          delay={0.25}
          accentColor="amber"
        />
      </div>

      {/* Upgrade Nudge */}
      <UpgradeNudge isPro={isPro} />

      {/* Insights & Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIBusinessSummary stats={stats} />
        </div>
        <div className="lg:col-span-1">
          <AIAlerts />
        </div>
      </div>

      {/* Revenue Heatmap */}
      <RevenueHeatmap />

      {/* Charts Grid - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <GlassCard delay={0.3} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Activity size={16} />
                </div>
                <h3 className="text-lg font-bold tracking-tight">Monthly Performance</h3>
              </div>
              <p className="text-xs text-secondary ml-10">Revenue flow and growth trends</p>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-foreground/5 border border-border/50 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none cursor-pointer transition-colors hover:bg-foreground/10"
              >
                <option value="6months">6 Months</option>
                <option value="12months">12 Months</option>
              </select>
            </div>
          </div>
          <div className="h-[320px] w-full">
            {isMounted && !isLoading && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={timeRange === '6months' ? monthlyPerformance.slice(-6) : monthlyPerformance} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--secondary)', fontSize: 11, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--secondary)', fontSize: 11, fontWeight: 500 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderColor: 'var(--border)',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.2)',
                      padding: '12px 16px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ fontWeight: 700, marginBottom: 4 }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    name="Revenue"
                    stroke="var(--primary)" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorSales)"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--background)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    name="Profit"
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    fillOpacity={1} 
                    fill="url(#colorProfit)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
            {isLoading && (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {/* Chart legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-[3px] rounded-full bg-primary" />
              <span className="text-xs font-medium text-secondary">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-[3px] rounded-full bg-emerald-500 opacity-70" style={{ borderTop: '2px dashed #10b981' }} />
              <span className="text-xs font-medium text-secondary">Profit</span>
            </div>
          </div>
        </GlassCard>

        {/* Expense Breakdown - Advanced Financial Intelligence */}
        <GlassCard delay={0.35} className="lg:col-span-1">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Expense Breakdown</h3>
                  <p className="text-[11px] text-secondary">Distribution by category</p>
                </div>
              </div>
              {expenseBreakdown.length > 0 && (
                <span className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.15em] bg-foreground/5 px-2.5 py-1 rounded-lg">
                  {expenseBreakdown.length} categories
                </span>
              )}
            </div>
          </div>

          {/* Donut Chart with Center Total */}
          <div className="relative h-[200px] w-full">
            {isMounted && !isLoading && expenseBreakdown.length > 0 && (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      cornerRadius={6}
                      strokeWidth={0}
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      wrapperStyle={{ zIndex: 50 }}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 10px 30px -5px rgb(0 0 0 / 0.2)'
                      }}
                      formatter={(value: any, name: any, props: any) => {
                        const entry = props.payload;
                        return [`₹${entry.amount?.toLocaleString()} (${value}%)`, entry.name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Total */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Total</p>
                    <p className="text-lg font-black tabular-nums tracking-tight">
                      ₹{expenseBreakdown.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString('en-IN', { notation: 'compact', maximumFractionDigits: 1 })}
                    </p>
                  </div>
                </div>
              </>
            )}
            {isLoading && (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!isLoading && expenseBreakdown.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-secondary italic">No expense data yet</p>
              </div>
            )}
          </div>

          {/* Category List with Progress Bars & Trends */}
          <div className="space-y-1.5 mt-3 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
            {expenseBreakdown.map((item, i) => (
              <motion.div 
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                className="group/item hover:bg-foreground/5 px-3 py-2.5 rounded-xl transition-all cursor-default"
              >
                {/* Row 1: Icon + Name + Percentage */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110" 
                      style={{ backgroundColor: item.color + '18' }} 
                    >
                      <DynamicIcon name={item.icon || 'Tag'} size={12} style={{ color: item.color }} />
                    </div>
                    <span className="text-xs font-semibold text-foreground truncate" title={item.name}>{item.name}</span>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-foreground shrink-0 ml-2">{item.value}%</span>
                </div>
                {/* Row 2: Progress bar + Amount + Trend */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.trend && item.trend !== 'flat' && (
                      <span className={`text-[8px] font-black px-1 py-0.5 rounded ${
                        item.trend === 'up' 
                          ? 'text-red-400 bg-red-500/10' 
                          : 'text-emerald-400 bg-emerald-500/10'
                      }`}>
                        {item.trend === 'up' ? '↑' : '↓'}{Math.abs(item.trendPct || 0)}%
                      </span>
                    )}
                    <span className="text-[10px] font-bold tabular-nums text-secondary">₹{(item.amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Bottom Quick Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl px-6 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Last synced just now</p>
            <p className="text-[11px] text-secondary">Data refreshes automatically every 5 minutes</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="text-xs font-bold text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-xl hover:bg-primary/10"
        >
          Refresh Now
        </button>
      </motion.div>
    </div>
  );
}
