'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, ArrowLeft, Printer, IndianRupee, TrendingUp,
  TrendingDown, Calendar, Building2, Download
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { getSubscriptionAction } from '@/actions/stripe';
import { UpgradeGate } from '@/components/UpgradeGate';
import Link from 'next/link';

async function fetchPnLData(period: string) {
  const res = await fetch(`/api/pnl?period=${period}`);
  return res.json();
}

export default function PnLPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('current-fy');
  const [isPro, setIsPro] = useState(false);

  useEffect(() => { loadData(); getSubscriptionAction().then(s => setIsPro(s.isPro)); }, []);
  useEffect(() => { loadData(); }, [period]);

  async function loadData() {
    setIsLoading(true);
    try {
      const result = await fetchPnLData(period);
      setData(result);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  }

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-secondary text-sm animate-pulse">Generating Profit & Loss Statement...</p>
      </div>
    );
  }

  if (!data) return <p className="text-center text-secondary py-20">Failed to load P&L data.</p>;

  const netProfit = data.totalRevenue - data.totalExpenses;
  const margin = data.totalRevenue > 0 ? ((netProfit / data.totalRevenue) * 100).toFixed(1) : '0';
  const isProfit = netProfit >= 0;

  return (
    <UpgradeGate isPro={isPro} feature="Profit & Loss Statement" description="Auto-generated P&L report with revenue and expense breakdowns for tax filing. Upgrade to Advanced to unlock.">
    <div className="max-w-4xl mx-auto pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex flex-col gap-2">
          <Link href="/analytics" className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-bold group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Analytics
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Profit & Loss Statement</h1>
          <p className="text-secondary text-sm">Automated financial summary for tax filing</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium outline-none"
          >
            <option value="current-fy" className="bg-[#0f1729]">Current FY</option>
            <option value="last-fy" className="bg-[#0f1729]">Last FY</option>
            <option value="current-quarter" className="bg-[#0f1729]">This Quarter</option>
            <option value="current-month" className="bg-[#0f1729]">This Month</option>
          </select>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* P&L Report Body */}
      <div id="pnl-report" className="space-y-6 print:space-y-4">
        {/* Company Header */}
        <GlassCard className="p-8 print:bg-white print:border-gray-200 print:shadow-none">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black print:bg-blue-100">BA</div>
                <div>
                  <h2 className="text-xl font-black print:text-black">{data.companyName || 'BizAnalytics'}</h2>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Profit & Loss Statement</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-secondary">
                <span className="flex items-center gap-1"><Calendar size={11} /> {data.periodLabel}</span>
                <span className="flex items-center gap-1"><Building2 size={11} /> {data.companyName || 'Business Entity'}</span>
              </div>
            </div>
            <span className="text-[9px] font-black text-red-500/60 uppercase tracking-[0.3em] border border-red-500/20 px-3 py-1 rounded-lg">Confidential</span>
          </div>
        </GlassCard>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 print:gap-2">
          <GlassCard className="p-6 text-center print:bg-white print:border-gray-200">
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-emerald-400 tabular-nums mt-1 print:text-emerald-600">₹{data.totalRevenue.toLocaleString()}</p>
          </GlassCard>
          <GlassCard className="p-6 text-center print:bg-white print:border-gray-200">
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Total Expenses</p>
            <p className="text-2xl font-black text-red-400 tabular-nums mt-1 print:text-red-600">₹{data.totalExpenses.toLocaleString()}</p>
          </GlassCard>
          <GlassCard className="p-6 text-center print:bg-white print:border-gray-200">
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Net {isProfit ? 'Profit' : 'Loss'}</p>
            <p className={`text-2xl font-black tabular-nums mt-1 ${isProfit ? 'text-emerald-400 print:text-emerald-600' : 'text-red-400 print:text-red-600'}`}>
              {isProfit ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString()}
            </p>
            <p className="text-xs text-secondary mt-1">{margin}% margin</p>
          </GlassCard>
        </div>

        {/* Revenue Breakdown */}
        <GlassCard className="p-8 print:bg-white print:border-gray-200">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2 print:text-black">
            <TrendingUp size={18} className="text-emerald-400" /> Revenue Breakdown
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 print:border-gray-300">
                <th className="text-left py-3 px-2 text-xs font-black text-secondary uppercase tracking-widest">Category</th>
                <th className="text-right py-3 px-2 text-xs font-black text-secondary uppercase tracking-widest">Amount</th>
                <th className="text-right py-3 px-2 text-xs font-black text-secondary uppercase tracking-widest">% of Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 print:divide-gray-200">
              {data.revenueBreakdown?.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-foreground/5">
                  <td className="py-3 px-2 font-medium">{item.category}</td>
                  <td className="py-3 px-2 text-right font-bold tabular-nums text-emerald-400">₹{item.amount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right tabular-nums text-secondary">{item.percentage.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="font-black border-t-2 border-border">
                <td className="py-3 px-2">Total Revenue</td>
                <td className="py-3 px-2 text-right tabular-nums text-emerald-400">₹{data.totalRevenue.toLocaleString()}</td>
                <td className="py-3 px-2 text-right tabular-nums">100%</td>
              </tr>
            </tbody>
          </table>
        </GlassCard>

        {/* Expense Breakdown */}
        <GlassCard className="p-8 print:bg-white print:border-gray-200">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2 print:text-black">
            <TrendingDown size={18} className="text-red-400" /> Expense Breakdown
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 print:border-gray-300">
                <th className="text-left py-3 px-2 text-xs font-black text-secondary uppercase tracking-widest">Category</th>
                <th className="text-right py-3 px-2 text-xs font-black text-secondary uppercase tracking-widest">Amount</th>
                <th className="text-right py-3 px-2 text-xs font-black text-secondary uppercase tracking-widest">% of Expenses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 print:divide-gray-200">
              {data.expenseBreakdown?.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-foreground/5">
                  <td className="py-3 px-2 font-medium">{item.category}</td>
                  <td className="py-3 px-2 text-right font-bold tabular-nums text-red-400">₹{item.amount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right tabular-nums text-secondary">{item.percentage.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="font-black border-t-2 border-border">
                <td className="py-3 px-2">Total Expenses</td>
                <td className="py-3 px-2 text-right tabular-nums text-red-400">₹{data.totalExpenses.toLocaleString()}</td>
                <td className="py-3 px-2 text-right tabular-nums">100%</td>
              </tr>
            </tbody>
          </table>
        </GlassCard>

        {/* Bottom Line */}
        <GlassCard className={`p-8 border-2 ${isProfit ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'} print:bg-white print:border-gray-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-secondary uppercase tracking-wider">Net {isProfit ? 'Profit' : 'Loss'}</p>
              <p className={`text-4xl font-black tabular-nums mt-1 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                {isProfit ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString()}
              </p>
            </div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isProfit ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              {isProfit ? <TrendingUp size={32} className="text-emerald-400" /> : <TrendingDown size={32} className="text-red-400" />}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase">Profit Margin</p>
              <p className="font-black tabular-nums">{margin}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase">Transactions</p>
              <p className="font-black tabular-nums">{data.transactionCount}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase">Period</p>
              <p className="font-black text-sm">{data.periodLabel}</p>
            </div>
          </div>
        </GlassCard>

        {/* Footer */}
        <div className="text-center space-y-2 pt-4 border-t border-border/30 print:border-gray-200">
          <p className="text-xs text-secondary/60">Generated by BizAnalytics AI Engine · {new Date().toLocaleDateString('en-IN')}</p>
        </div>
      </div>
    </div>
    </UpgradeGate>
  );
}
