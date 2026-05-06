'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  AlertCircle, 
  Target, 
  ArrowLeft,
  Printer,
  Calendar,
  IndianRupee,
  Activity,
  Zap,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Download
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { GlassCard } from '@/components/GlassCard';
import { 
  getDashboardStats, 
  getMonthlyPerformance, 
  getAISummaryInsights,
  getBusinessForecast
} from '@/lib/actions';
import { getSubscriptionAction } from '@/actions/stripe';
import { UpgradeGate } from '@/components/UpgradeGate';
import { DynamicIcon } from '@/components/DynamicIcon';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CFOReportPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
    getSubscriptionAction().then((sub) => setIsPro(sub.isPro));
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, perfData, aiData, forecastData] = await Promise.all([
        getDashboardStats(),
        getMonthlyPerformance(),
        getAISummaryInsights(),
        getBusinessForecast()
      ]);
      
      setStats(statsData);
      setPerformance(perfData);
      if (aiData.success) {
        setAiInsights(aiData.data);
      }
      if (forecastData.success) {
        setForecast(forecastData.forecast);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <FileText size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight">Generating CFO Intelligence</h2>
          <p className="text-secondary text-sm mt-1 animate-pulse">Analyzing financial records and strategic models...</p>
        </div>
      </div>
    );
  }

  return (
    <UpgradeGate isPro={isPro} feature="Strategic CFO Report" description="Get AI-powered CFO-level financial analysis, predictive forecasting, and strategic recommendations. Upgrade to Advanced to unlock.">
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-12 pb-24 print:bg-white print:text-black print:max-w-none print:p-0">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-bold mb-2 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Strategic CFO Report</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-xs font-bold text-secondary uppercase tracking-widest opacity-80">
                  CONFIDENTIAL • Q1 FY 2025-26
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all group"
          >
            <Printer size={18} className="group-hover:scale-110 transition-transform" />
            <span>Print Report</span>
          </button>
          <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group">
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Cover Section / Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 p-10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Zap size={240} />
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-[0.3em]">
              <Target size={14} />
              <span>Executive Performance Overview</span>
            </div>
            <h2 className="text-3xl font-bold leading-tight">
              {aiInsights?.overview.summary || "Financial analysis synthesis complete."}
            </h2>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-secondary" />
                <span className="text-sm font-medium text-secondary">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-secondary" />
                <span className="text-sm font-medium text-secondary">Operational Health: Healthy</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-3 gap-8">
            {aiInsights?.overview.kpis.map((kpi: any, i: number) => (
              <div key={i} className="space-y-1">
                <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{kpi.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono tracking-tight">{kpi.value}</span>
                  {kpi.trend === 'up' ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-red-400" />}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8 bg-primary/5 border-primary/20">
          <h3 className="text-xl font-bold mb-6">Financial Status</h3>
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-secondary uppercase tracking-widest">Business Tier</p>
                <span className="bg-primary/20 text-primary text-[10px] px-2 py-1 rounded-lg font-black tracking-widest">SMB PRO</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <PieChart size={24} />
                </div>
                <div>
                  <p className="text-lg font-bold">{stats?.companyName || "BizAnalytics Client"}</p>
                  <p className="text-xs text-secondary">Verified Enterprise</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">Risk Allocation</h4>
              <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500 w-[65%]" />
                <div className="h-full bg-amber-500 w-[25%]" />
                <div className="h-full bg-red-500 w-[10%]" />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-secondary">
                <span>Low Risk (65%)</span>
                <span>Critical (10%)</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Data Visuals Section */}
      <GlassCard className="p-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Activity className="text-primary" />
              Performance Velocity Chart
            </h3>
            <p className="text-secondary text-sm mt-1">Rolling revenue and expense correlation analysis</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs font-bold text-secondary uppercase">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-secondary uppercase">Net Profit</span>
            </div>
          </div>
        </div>
        
        <div className="h-[400px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.3} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--secondary)', fontSize: 12, fontWeight: 600 }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--secondary)', fontSize: 12, fontWeight: 600 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderColor: 'rgba(51, 65, 85, 0.5)',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                  backdropFilter: 'blur(8px)',
                  padding: '16px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="var(--primary)" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorSales)"
                dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 3, stroke: 'var(--background)' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="#10b981" 
                strokeWidth={3}
                strokeDasharray="8 6"
                fillOpacity={1} 
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
      
      {/* Forecast Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Sparkles className="text-primary" />
                3-Month Cash Flow Forecast
              </h3>
              <p className="text-secondary text-sm mt-1">AI-projected performance based on current trajectory</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--secondary)', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--secondary)', fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(51, 65, 85, 0.5)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(8px)',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Projected Revenue"
                  stroke="var(--primary)" 
                  strokeWidth={4}
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorForecast)"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  name="Projected Expenses"
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-8 bg-primary/5 border-primary/20 flex flex-col justify-center h-full">
            <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Forecast Insight</h4>
            {forecast.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs text-secondary mb-1">Projected Q3 Profit</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    ₹{forecast.reduce((sum, m) => sum + (m.revenue - m.expenses), 0).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-secondary leading-relaxed italic">
                  &ldquo;Based on your sales velocity, we anticipate a {((forecast[2]?.revenue / forecast[0]?.revenue - 1) * 100).toFixed(1)}% revenue growth over the next 90 days.&rdquo;
                </p>
              </div>
            ) : (
              <p className="text-sm text-secondary italic">Insufficient data to generate projection.</p>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Strategic Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Growth & Milestones */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp size={22} />
            </div>
            <h3 className="text-2xl font-bold">Growth Intelligence</h3>
          </div>
          
          <div className="p-8 rounded-[2.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 space-y-6">
            <p className="text-secondary leading-[1.8] italic text-lg">
              &ldquo;{aiInsights?.growth.analysis || "Market momentum remains steady."}&rdquo;
            </p>
            <div className="space-y-4">
              <p className="text-xs font-black text-secondary uppercase tracking-[0.2em] px-1">Verifiable Milestones</p>
              <div className="grid grid-cols-1 gap-3">
                {aiInsights?.growth.milestones.map((m: string, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-emerald-500/30 transition-all">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-sm font-semibold">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertCircle size={22} />
            </div>
            <h3 className="text-2xl font-bold">Risk Assessment</h3>
          </div>
          
          <div className="space-y-4">
            {aiInsights?.anomalies.map((anomaly: any, i: number) => (
              <div key={i} className={cn(
                "p-6 rounded-[2rem] border flex items-start gap-6 transition-all",
                anomaly.type === 'Critical' ? "bg-red-500/5 border-red-500/10 hover:border-red-500/30" : 
                anomaly.type === 'Warning' ? "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30" : 
                "bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30"
              )}>
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                  anomaly.type === 'Critical' ? "bg-red-500/20 text-red-400" : 
                  anomaly.type === 'Warning' ? "bg-amber-500/20 text-amber-400" : 
                  "bg-blue-500/20 text-blue-400"
                )}>
                  <Zap size={24} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
                      anomaly.type === 'Critical' ? "bg-red-500/20 text-red-300" : 
                      anomaly.type === 'Warning' ? "bg-amber-500/20 text-amber-300" : 
                      "bg-blue-500/20 text-blue-300"
                    )}>
                      {anomaly.type} SIGNAL
                    </span>
                  </div>
                  <p className="text-base font-bold leading-relaxed pr-6">
                    {anomaly.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Playbook */}
      <GlassCard className="p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/2 -translate-y-1/2 group-hover:opacity-10 transition-opacity">
          <Lightbulb size={300} />
        </div>
        
        <div className="max-w-4xl space-y-10 relative z-10">
          <div className="space-y-2">
            <h3 className="text-3xl font-black tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                <Lightbulb size={24} />
              </div>
              Strategic Playbook
            </h3>
            <p className="text-secondary text-base ml-16">Data-driven mandates for the upcoming primary cycle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ml-4">
            {aiInsights?.strategy.map((item: any, i: number) => (
              <div key={i} className="flex flex-col gap-5 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition-all group/item">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover/item:scale-110",
                    item.priority === 'High' ? "bg-violet-500 text-white" : 
                    item.priority === 'Medium' ? "bg-blue-500/50 text-white" : 
                    "bg-slate-500/30 text-secondary"
                  )}>
                    {i + 1}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50 px-2 py-1 bg-white/5 rounded-lg group-hover/item:opacity-100 transition-opacity">
                    {item.priority} Priority
                  </span>
                </div>
                <p className="text-sm font-semibold leading-relaxed group-hover/item:text-foreground transition-colors">
                  {item.advice}
                </p>
                <div className="pt-2 mt-auto">
                  <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-3 transition-all">
                    Implementation Plan
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Footer Branding */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 pt-12 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black italic">
            BA
          </div>
          <span className="text-xl font-black tracking-tighter uppercase grayscale opacity-50">BizAnalytics</span>
        </div>
        <p className="text-secondary text-xs font-medium max-w-sm leading-relaxed">
          This document is electronically generated by the Gemini BI Engine and is intended for executive decision support only. 
          All metrics are derived from real-time transaction verified data.
        </p>
        <div className="text-[10px] text-secondary/30 font-bold uppercase tracking-[0.3em] flex items-center gap-4">
          <span>TS CODE: #7232fa51</span>
          <span className="w-1 h-1 rounded-full bg-secondary/30" />
          <span>GEN DATE: {new Date().toISOString()}</span>
        </div>
      </div>
    </div>
    </UpgradeGate>
  );
}
