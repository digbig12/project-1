'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  Minus,
  AlertCircle, 
  Lightbulb, 
  RefreshCw,
  ChevronRight,
  Database,
  Bot,
  PieChart,
  Target,
  Zap,
  ArrowRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getAISummaryInsights } from '@/lib/actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Tab = 'overview' | 'growth' | 'anomalies' | 'strategy';

export function AIBusinessSummary({ stats }: { stats: any }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAISummaryInsights();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch insights');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (stats.revenue > 0 || stats.salesCount > 0) {
      fetchInsights();
    }
  }, []);

  if (stats.revenue === 0 && stats.salesCount === 0) {
    return (
      <GlassCard className="p-8 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
          <Sparkles size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-2">Ready for Intelligence?</h3>
        <p className="text-secondary max-w-md mb-6 leading-relaxed">
          I've calibrated my financial engine, but I need some data to start giving you insights. Try scanning a receipt or importing a CSV to begin.
        </p>
        <button 
          onClick={() => window.location.href = '/transactions'}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          <Database size={18} />
          Go to Transactions
        </button>
      </GlassCard>
    );
  }

  const tabItems = [
    { id: 'overview' as Tab, label: 'Overview', icon: PieChart },
    { id: 'growth' as Tab, label: 'Growth', icon: TrendingUp },
    { id: 'anomalies' as Tab, label: 'Anomalies', icon: AlertCircle },
    { id: 'strategy' as Tab, label: 'Strategy', icon: Target },
  ];

  return (
    <GlassCard className="overflow-hidden border-primary/20 shadow-primary/5">
      <div className="p-1 pb-0 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between p-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={20} className={cn(isLoading && "animate-pulse")} />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Executive Summary</h3>
              <p className="text-[10px] text-secondary uppercase tracking-[0.2em] font-bold opacity-60">
                AI Financial Intelligence
              </p>
            </div>
          </div>
          <button 
            onClick={fetchInsights}
            disabled={isLoading}
            className="p-2 hover:bg-white/5 rounded-xl text-secondary hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={cn(isLoading && "animate-spin")} />
          </button>
        </div>
        
        <div className="flex gap-2 px-6 overflow-x-auto no-scrollbar">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 relative whitespace-nowrap",
                activeTab === tab.id 
                  ? "text-primary border-primary" 
                  : "text-secondary border-transparent hover:text-white"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/5 -z-10 rounded-t-xl"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 min-h-[350px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-6"
            >
              <div className="relative">
                <Loader2 size={48} className="animate-spin text-primary opacity-20" />
                <Bot size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <span className="font-bold text-xs uppercase tracking-[0.3em] text-primary">Synthesizing Data</span>
                <p className="text-secondary text-[11px] animate-pulse italic">Connecting to Gemini for CFO analysis...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle size={32} />
              </div>
              <div>
                <h4 className="font-bold text-red-400">Analysis Failed</h4>
                <p className="text-secondary text-sm max-w-sm mx-auto">{error}</p>
              </div>
              <button 
                onClick={fetchInsights}
                className="mt-2 text-primary text-xs font-bold hover:underline"
              >
                Try Again
              </button>
            </motion.div>
          ) : data ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-2xl font-bold tracking-tight">{data.overview.title}</h4>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        data.overview.status === 'Profitable' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      )}>
                        {data.overview.status}
                      </span>
                    </div>
                    <p className="text-secondary text-sm leading-relaxed max-w-2xl">
                      {data.overview.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.overview.kpis.map((kpi: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">
                          {kpi.label}
                        </p>
                        <div className="flex items-end justify-between">
                          <h5 className="text-xl font-bold">{kpi.value}</h5>
                          <div className={cn(
                            "p-1.5 rounded-lg",
                            kpi.trend === 'up' ? "bg-emerald-500/10 text-emerald-400" : 
                            kpi.trend === 'down' ? "bg-red-500/10 text-red-400" : 
                            "bg-white/10 text-secondary"
                          )}>
                            {kpi.trend === 'up' ? <TrendingUp size={14} /> : 
                             kpi.trend === 'down' ? <TrendingDown size={14} /> : 
                             <Minus size={14} />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'growth' && (
                <div className="space-y-8">
                  <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <TrendingUp size={120} />
                    </div>
                    <h4 className="text-lg font-bold mb-3 relative z-10">Growth Velocity</h4>
                    <p className="text-secondary text-sm leading-relaxed relative z-10 italic">
                      &ldquo;{data.growth.analysis}&rdquo;
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-secondary uppercase tracking-widest px-1">Key Milestones</h5>
                    <div className="space-y-3">
                      {data.growth.milestones.map((milestone: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                            <CheckCircle2 size={12} />
                          </div>
                          <p className="text-sm font-medium">{milestone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'anomalies' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <h4 className="text-lg font-bold">Financial Signals</h4>
                  </div>
                  
                  <div className="grid gap-4">
                    {data.anomalies.map((anomaly: any, i: number) => (
                      <div key={i} className={cn(
                        "p-5 rounded-3xl border flex items-start gap-5 transition-all",
                        anomaly.type === 'Critical' ? "bg-red-500/5 border-red-500/20" : 
                        anomaly.type === 'Warning' ? "bg-amber-500/5 border-amber-500/20" : 
                        "bg-blue-500/5 border-blue-500/20"
                      )}>
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                          anomaly.type === 'Critical' ? "bg-red-500/20 text-red-400" : 
                          anomaly.type === 'Warning' ? "bg-amber-500/20 text-amber-400" : 
                          "bg-blue-500/20 text-blue-400"
                        )}>
                          <Zap size={20} />
                        </div>
                        <div className="space-y-1">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            anomaly.type === 'Critical' ? "text-red-400" : 
                            anomaly.type === 'Warning' ? "text-amber-400" : 
                            "text-blue-400"
                          )}>
                            {anomaly.type} Signal
                          </span>
                          <p className="text-sm font-semibold leading-relaxed text-foreground/90">
                            {anomaly.message}
                          </p>
                        </div>
                      </div>
                    ))}
                    {data.anomalies.length === 0 && (
                      <div className="py-12 text-center border border-dashed border-white/10 rounded-3xl">
                        <p className="text-secondary text-xs">No active anomalies detected.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'strategy' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold">Strategic Playbook</h4>
                    <span className="text-[10px] font-bold text-secondary bg-white/5 px-2 py-1 rounded-lg">Next 90 Days</span>
                  </div>

                  <div className="space-y-4">
                    {data.strategy.map((item: any, i: number) => (
                      <div key={i} className="group cursor-default">
                        <div className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 group-hover:border-primary/30 transition-all">
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                            item.priority === 'High' ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : 
                            item.priority === 'Medium' ? "bg-blue-500/50 text-white" : 
                            "bg-slate-500/30 text-secondary"
                          )}>
                            <Lightbulb size={18} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                                Priority {item.priority}
                              </span>
                              {item.priority === 'High' && <span className="w-1 h-1 rounded-full bg-violet-400" />}
                            </div>
                            <p className="text-sm font-medium leading-relaxed">
                              {item.advice}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6">
                    <Link 
                      href="/cfo-report"
                      className="w-full py-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/20 transition-all group"
                    >
                      Open Full CFO Report
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <Bot size={40} className="mx-auto text-secondary/20 mb-4" />
              <p className="text-secondary text-sm">Analyze your data to see insights.</p>
              <button 
                onClick={fetchInsights}
                className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold"
              >
                Start Analysis
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
