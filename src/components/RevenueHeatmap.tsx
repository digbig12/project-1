'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface DayData {
  date: string;
  revenue: number;
  expenses: number;
}

async function fetchHeatmapData() {
  const res = await fetch('/api/heatmap');
  return res.json();
}

function getIntensityColor(value: number, max: number): string {
  if (value === 0) return 'bg-white/[0.03]';
  const ratio = value / (max || 1);
  if (ratio > 0.75) return 'bg-emerald-500';
  if (ratio > 0.5) return 'bg-emerald-500/70';
  if (ratio > 0.25) return 'bg-emerald-500/40';
  return 'bg-emerald-500/20';
}

export function RevenueHeatmap() {
  const [data, setData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHeatmapData()
      .then(d => setData(d.days || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={18} className="text-emerald-400" />
          <h3 className="font-bold">Revenue Heatmap</h3>
        </div>
        <div className="h-[120px] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </GlassCard>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  // Group by week (last 12 weeks)
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];

  for (let i = 0; i < data.length; i++) {
    const dayOfWeek = new Date(data[i].date).getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(data[i]);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const activeDays = data.filter(d => d.revenue > 0).length;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-emerald-400" />
          <h3 className="font-bold">Revenue Heatmap</h3>
          <span className="text-[10px] font-bold text-secondary bg-white/5 px-2 py-0.5 rounded-lg">Last 90 days</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-secondary">
          <span>{activeDays} active days</span>
          <span className="font-bold text-emerald-400">₹{totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (wi * 7 + di) * 0.005 }}
                className={`w-[14px] h-[14px] rounded-[3px] ${getIntensityColor(day.revenue, maxRevenue)} cursor-pointer transition-all hover:scale-150 hover:rounded-md`}
                title={`${new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ₹${day.revenue.toLocaleString()}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-secondary">Less</span>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-white/[0.03]" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500/20" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500/40" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500/70" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500" />
        <span className="text-[10px] text-secondary">More</span>
      </div>
    </GlassCard>
  );
}
