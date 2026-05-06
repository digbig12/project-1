'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useRouter } from 'next/navigation';
import { getAIInsights } from '@/lib/actions';

export function AIAlerts() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getAIInsights();
        if (result.success && result.insights && result.insights.length > 0) {
          setAlerts(result.insights);
        } else {
          setAlerts([{
            type: 'warning',
            title: 'Analysis Unavailable',
            description: (result as any).error || 'Failed to detect financial anomalies.',
            deepLink: 'Why did the anomaly detection fail?'
          }]);
        }
      } catch (err: any) {
        setAlerts([{
          type: 'warning',
          title: 'System Error',
          description: err.message || 'Could not connect to the AI engine.',
          deepLink: 'Check system status'
        }]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'warning':
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/8', border: 'border-amber-500/15', accentBar: 'bg-amber-500' };
      case 'success':
        return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', accentBar: 'bg-emerald-500' };
      default:
        return { icon: Info, color: 'text-primary', bg: 'bg-primary/8', border: 'border-primary/15', accentBar: 'bg-primary' };
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-6 h-full">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-foreground/5 rounded" />
            <div className="h-4 w-32 bg-foreground/5 rounded" />
          </div>
          <div className="space-y-3">
            <div className="h-20 bg-foreground/5 rounded-2xl" />
            <div className="h-20 bg-foreground/5 rounded-2xl" />
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-0 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={14} />
          </div>
          <h3 className="font-bold text-sm tracking-tight">AI Insights & Alerts</h3>
          {alerts.length > 0 && (
            <span className="ml-1 text-[10px] font-black bg-primary/15 text-primary px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {alerts.map((alert, i) => {
            const config = getAlertConfig(alert.type);
            const Icon = config.icon;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                onClick={() => router.push(`/chat?q=${encodeURIComponent(alert.deepLink || `Tell me more about: ${alert.title}`)}`)}
                className={`relative p-4 rounded-xl ${config.bg} border ${config.border} group cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 overflow-hidden`}
              >
                {/* Left accent bar */}
                <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${config.accentBar} opacity-60`} />
                
                <div className="flex items-start gap-3 pl-2">
                  <div className={`p-1.5 rounded-lg bg-foreground/5 ${config.color} shrink-0 mt-0.5`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-foreground truncate">{alert.title}</h4>
                      <ArrowRight size={12} className="text-secondary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0" />
                    </div>
                    <p className="text-[11px] text-secondary mt-1 leading-relaxed line-clamp-2">{alert.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <button className="w-full p-3.5 text-[11px] font-bold text-secondary hover:text-foreground hover:bg-foreground/5 transition-all flex items-center justify-center gap-2 border-t border-border/50">
        <Radio size={12} />
        View All Intelligence Logs
      </button>
    </GlassCard>
  );
}
