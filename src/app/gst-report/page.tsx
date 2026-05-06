'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, ArrowLeft, Download, IndianRupee, Calendar,
  Building2, Receipt, TrendingUp, TrendingDown, AlertCircle
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { getSubscriptionAction } from '@/actions/stripe';
import { UpgradeGate } from '@/components/UpgradeGate';
import Link from 'next/link';

async function fetchGSTData(period: string) {
  const res = await fetch(`/api/gst?period=${period}`);
  return res.json();
}

export default function GSTReportPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('current-quarter');
  const [isPro, setIsPro] = useState(false);

  useEffect(() => { loadData(); getSubscriptionAction().then(s => setIsPro(s.isPro)); }, []);
  useEffect(() => { loadData(); }, [period]);

  async function loadData() {
    setIsLoading(true);
    try {
      const result = await fetchGSTData(period);
      setData(result);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-secondary text-sm animate-pulse">Calculating GST Liability...</p>
      </div>
    );
  }

  if (!data) return <p className="text-center text-secondary py-20">Failed to load GST data.</p>;

  const netGST = data.outputGST - data.inputGST;

  return (
    <UpgradeGate isPro={isPro} feature="GST Report" description="Auto-calculate CGST/SGST/IGST from your transactions. View monthly GST breakdowns and slab-wise summaries. Upgrade to Advanced to unlock.">
    <div className="max-w-4xl mx-auto pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex flex-col gap-2">
          <Link href="/analytics" className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-bold group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Analytics
          </Link>
          <h1 className="text-3xl font-black tracking-tight">GST Report</h1>
          <p className="text-secondary text-sm">Auto-calculated GST liability from your transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium outline-none">
            <option value="current-month" className="bg-[#0f1729]">This Month</option>
            <option value="current-quarter" className="bg-[#0f1729]">This Quarter</option>
            <option value="current-fy" className="bg-[#0f1729]">Current FY</option>
          </select>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* GST Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6 text-center" delay={0.05}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <p className="text-xs font-bold text-secondary uppercase tracking-wider">Output GST (Sales)</p>
          <p className="text-2xl font-black text-emerald-400 tabular-nums mt-1">₹{data.outputGST.toLocaleString()}</p>
          <p className="text-[10px] text-secondary mt-1">GST collected on ₹{data.totalSales.toLocaleString()} sales</p>
        </GlassCard>

        <GlassCard className="p-6 text-center" delay={0.1}>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
            <TrendingDown size={18} className="text-blue-400" />
          </div>
          <p className="text-xs font-bold text-secondary uppercase tracking-wider">Input GST (Purchases)</p>
          <p className="text-2xl font-black text-blue-400 tabular-nums mt-1">₹{data.inputGST.toLocaleString()}</p>
          <p className="text-[10px] text-secondary mt-1">GST paid on ₹{data.totalExpenses.toLocaleString()} expenses</p>
        </GlassCard>

        <GlassCard className={`p-6 text-center border-2 ${netGST > 0 ? 'border-amber-500/20' : 'border-emerald-500/20'}`} delay={0.15}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${netGST > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
            <IndianRupee size={18} className={netGST > 0 ? 'text-amber-400' : 'text-emerald-400'} />
          </div>
          <p className="text-xs font-bold text-secondary uppercase tracking-wider">
            {netGST > 0 ? 'GST Payable' : 'GST Refundable'}
          </p>
          <p className={`text-2xl font-black tabular-nums mt-1 ${netGST > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            ₹{Math.abs(netGST).toLocaleString()}
          </p>
          <p className="text-[10px] text-secondary mt-1">
            {netGST > 0 ? 'Amount to pay to government' : 'Eligible for Input Tax Credit'}
          </p>
        </GlassCard>
      </div>

      {/* GST Slab Breakdown */}
      <GlassCard className="p-8">
        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
          <Receipt size={18} className="text-primary" /> GST Slab-wise Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { slab: '5%', rate: 0.05 },
            { slab: '12%', rate: 0.12 },
            { slab: '18%', rate: 0.18 },
            { slab: '28%', rate: 0.28 },
          ].map((item, i) => {
            const slabAmount = data.totalSales * item.rate * 0.25; // Estimated distribution
            return (
              <motion.div
                key={item.slab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center"
              >
                <p className="text-2xl font-black text-primary">{item.slab}</p>
                <p className="text-xs text-secondary mt-1">GST Slab</p>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-secondary">CGST: <span className="font-bold text-white">₹{Math.round(slabAmount / 2).toLocaleString()}</span></p>
                  <p className="text-xs text-secondary">SGST: <span className="font-bold text-white">₹{Math.round(slabAmount / 2).toLocaleString()}</span></p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Monthly GST Table */}
      <GlassCard className="p-8">
        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
          <Calendar size={18} className="text-primary" /> Monthly GST Breakdown
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-3 px-2 text-xs font-black text-secondary uppercase tracking-widest">Month</th>
              <th className="text-right py-3 px-2 text-xs font-black text-secondary uppercase tracking-widest">Sales</th>
              <th className="text-right py-3 px-2 text-xs font-black text-secondary uppercase tracking-widest">Output GST</th>
              <th className="text-right py-3 px-2 text-xs font-black text-secondary uppercase tracking-widest">Input GST</th>
              <th className="text-right py-3 px-2 text-xs font-black text-secondary uppercase tracking-widest">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {data.monthlyBreakdown?.map((m: any, i: number) => (
              <tr key={i} className="hover:bg-foreground/5">
                <td className="py-3 px-2 font-medium">{m.month}</td>
                <td className="py-3 px-2 text-right tabular-nums">₹{m.sales.toLocaleString()}</td>
                <td className="py-3 px-2 text-right tabular-nums text-emerald-400">₹{m.outputGST.toLocaleString()}</td>
                <td className="py-3 px-2 text-right tabular-nums text-blue-400">₹{m.inputGST.toLocaleString()}</td>
                <td className={`py-3 px-2 text-right font-bold tabular-nums ${m.net > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {m.net > 0 ? '+' : ''}₹{m.net.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-400">Disclaimer</p>
          <p className="text-xs text-secondary mt-1">This is an estimated GST calculation based on your transaction data using a default 18% rate. Consult your chartered accountant for accurate GST filing. Actual slab distribution depends on your product/service category.</p>
        </div>
      </div>
    </div>
    </UpgradeGate>
  );
}
