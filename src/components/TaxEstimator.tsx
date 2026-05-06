'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Info, 
  TrendingUp, 
  Wallet,
  Calendar,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getTaxEstimation } from '@/lib/actions';

export function TaxEstimator() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const result = await getTaxEstimation();
    setData(result);
    setLoading(false);
  };

  if (loading || !data) {
    return (
      <GlassCard className="h-full flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </GlassCard>
    );
  }

  const progress = Math.min((data.netProfit / 50000) * 100, 100); 

  return (
    <GlassCard className="h-full flex flex-col p-8 overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Calculator size={22} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Tax Intelligence</h3>
            <p className="text-xs text-secondary uppercase tracking-widest">Advanced Compliance Engine</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
          FY 2024-25
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {/* Main Tax Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/30 transition-all">
            <p className="text-[10px] font-bold text-secondary uppercase mb-1 flex items-center gap-1">
              <ShieldCheck size={10} className="text-primary" />
              Income Tax (Est.)
            </p>
            <h4 className="text-2xl font-black text-white">₹{data.incomeTax.estimated.toLocaleString()}</h4>
            <div className="flex items-center justify-between mt-1">
               <p className="text-[9px] text-secondary">Effective Rate: {data.taxRate}%</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-violet-500/30 transition-all">
            <p className="text-[10px] font-bold text-secondary uppercase mb-1 flex items-center gap-1">
              <TrendingUp size={10} className="text-violet-400" />
              GST Liability
            </p>
            <h4 className="text-2xl font-black text-white">₹{data.gst.liability.toLocaleString()}</h4>
            <p className="text-[9px] text-secondary mt-1">Net after Input Credit</p>
          </div>
        </div>

        {/* GST Breakdown */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">GST Breakdown</span>
            <span className="text-[10px] font-bold text-primary">18% Standard</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-secondary">Output GST (on Sales)</span>
              <span className="font-bold text-emerald-400">+₹{data.gst.output.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-secondary">Input Tax Credit (ITC)</span>
              <span className="font-bold text-red-400">-₹{data.gst.input.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* AI Strategy Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-primary/10 border border-primary/20 relative overflow-hidden group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-primary animate-pulse" />
            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">AI Tax Optimization Strategy</h4>
          </div>
          <p className="text-[11px] font-medium text-primary-glow leading-relaxed">
            {data.aiStrategy}
          </p>
          {/* Subtle Background Glow */}
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-primary/20 blur-xl rounded-full" />
        </motion.div>

        {/* Recommended Reserve */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-secondary" />
              <span className="text-sm font-bold text-secondary">Recommended Reserve</span>
            </div>
            <span className="text-sm font-black">₹{data.suggestedReserve.toLocaleString()}</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          </div>
        </div>
      </div>

      <button className="w-full mt-8 py-3.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        <Calculator size={14} />
        Generate Compliance Report
      </button>

      {/* Decorative Blur */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
    </GlassCard>
  );
}
