'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ElementType;
  delay?: number;
  accentColor?: string;
}

// Animated number counter
function AnimatedValue({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.span
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={displayed ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="inline-block"
    >
      {value}
    </motion.span>
  );
}

const accentColors: Record<string, { gradient: string; glow: string; iconBg: string; iconText: string }> = {
  blue:   { gradient: 'from-blue-500/20 to-blue-600/5',   glow: 'shadow-blue-500/10',   iconBg: 'bg-blue-500/15', iconText: 'text-blue-500' },
  green:  { gradient: 'from-emerald-500/20 to-emerald-600/5', glow: 'shadow-emerald-500/10', iconBg: 'bg-emerald-500/15', iconText: 'text-emerald-500' },
  violet: { gradient: 'from-violet-500/20 to-violet-600/5',  glow: 'shadow-violet-500/10',  iconBg: 'bg-violet-500/15', iconText: 'text-violet-500' },
  amber:  { gradient: 'from-amber-500/20 to-amber-600/5',   glow: 'shadow-amber-500/10',   iconBg: 'bg-amber-500/15', iconText: 'text-amber-500' },
};

const colorOrder = ['blue', 'green', 'violet', 'amber'];

export const StatsCard = ({ label, value, trend, trendLabel, icon: Icon, delay = 0, accentColor }: StatsCardProps) => {
  const isPositive = trend && trend > 0;
  const isLoading = value === undefined;
  
  // Pick a color based on the label for consistency
  const colorKey = accentColor || colorOrder[label.length % colorOrder.length];
  const colors = accentColors[colorKey] || accentColors.blue;

  return (
    <GlassCard delay={delay} className="flex flex-col gap-4 relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className={cn(
        "absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none bg-gradient-to-br",
        colors.gradient
      )} />
      
      {/* Subtle corner accent line */}
      <div className="absolute top-0 right-0 w-16 h-[2px] bg-gradient-to-l from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between relative">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
          colors.iconBg,
          colors.iconText,
          `group-hover:${colors.glow}`
        )}>
          <Icon size={22} strokeWidth={2} />
        </div>
        {trend !== undefined && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.4 }}
            className={cn(
              'flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full',
              isPositive
                ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15'
                : 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/15'
            )}
          >
            {isPositive ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
            {Math.abs(trend)}%
          </motion.div>
        )}
      </div>
      <div className="relative">
        <p className="text-xs font-semibold text-secondary uppercase tracking-wider">{label}</p>
        {isLoading ? (
          <div className="mt-2 space-y-2">
            <div className="h-8 w-32 bg-foreground/5 rounded-lg animate-pulse" />
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-black tracking-tight mt-1.5 tabular-nums">
              <AnimatedValue value={value} />
            </h3>
            {trendLabel && (
              <p className="text-[11px] text-secondary mt-1 font-medium">{trendLabel}</p>
            )}
          </>
        )}
      </div>
    </GlassCard>
  );
};
