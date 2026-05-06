'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  AlertTriangle,
  ArrowLeft,
  Printer,
  Calendar,
  IndianRupee,
  Zap,
  Lightbulb,
  Building2,
  PieChart,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import {
  getDashboardStats,
  getMonthlyPerformance,
  getExpenseBreakdown,
  getAISummaryInsights,
  getBusinessForecast
} from '@/lib/actions';
import { getSubscriptionAction } from '@/actions/stripe';
import { UpgradeGate } from '@/components/UpgradeGate';

export default function ExecutiveReportPage() {
  const [stats, setStats] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedAt] = useState(new Date());
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    fetchData();
    getSubscriptionAction().then((sub) => setIsPro(sub.isPro));
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, perfData, expData, forecastData, aiData] = await Promise.all([
        getDashboardStats(),
        getMonthlyPerformance(),
        getExpenseBreakdown(),
        getBusinessForecast(),
        getAISummaryInsights(),
      ]);

      setStats(statsData);
      setPerformance(perfData);
      setExpenses(expData);
      if (forecastData.success) setForecast(forecastData.forecast || []);
      if (aiData.success) setAiInsights(aiData.data);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const totalExpenses = stats ? stats.revenue - stats.netProfit : 0;
  const margin = stats?.revenue > 0 ? ((stats.netProfit / stats.revenue) * 100).toFixed(1) : '0';
  const marginHealth = parseFloat(margin) > 20 ? 'Excellent' : parseFloat(margin) > 10 ? 'Good' : parseFloat(margin) > 0 ? 'Needs Attention' : 'Critical';
  const marginColor = parseFloat(margin) > 20 ? 'text-emerald-500' : parseFloat(margin) > 10 ? 'text-blue-500' : parseFloat(margin) > 0 ? 'text-amber-500' : 'text-red-500';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <FileText size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight">Generating Executive Report</h2>
          <p className="text-secondary text-sm mt-1 animate-pulse">Compiling financial intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <UpgradeGate isPro={isPro} feature="Executive Report" description="Generate board-ready executive financial summaries with AI analysis. Upgrade to Advanced to unlock.">
    <div className="max-w-5xl mx-auto pb-24 space-y-10">
      {/* Screen-only Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-bold group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Executive Report</h1>
          <p className="text-secondary text-sm">One-click board-ready financial summary</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Printer size={18} />
          Download PDF
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PRINTABLE REPORT BODY
          ═══════════════════════════════════════════════════════════════ */}
      <div id="executive-report-body" className="space-y-8 print:space-y-6">

        {/* Cover / Header */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-10 print:bg-white print:border print:border-gray-200 print:rounded-none print:p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg print:bg-blue-100">
                  BA
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight print:text-black">BizAnalytics</h2>
                  <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Executive Financial Summary</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs font-medium text-secondary">
                <span className="flex items-center gap-1.5"><Building2 size={12} /> {stats?.displayName || 'Business Entity'}</span>
                <span className="flex items-center gap-1.5"><Calendar size={12} /> {generatedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="flex items-center gap-1.5"><Clock size={12} /> {generatedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block text-[9px] font-black text-red-500/60 uppercase tracking-[0.3em] border border-red-500/20 px-3 py-1 rounded-lg">
                Confidential
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Financial Summary */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 print:bg-white print:border print:border-gray-200 print:rounded-none">
          <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3 print:text-black">
            <IndianRupee size={20} className="text-primary print:text-blue-600" />
            Financial Summary
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 print:border-gray-300">
                  <th className="text-left py-3 px-4 text-xs font-black text-secondary uppercase tracking-widest">Metric</th>
                  <th className="text-right py-3 px-4 text-xs font-black text-secondary uppercase tracking-widest">Value</th>
                  <th className="text-right py-3 px-4 text-xs font-black text-secondary uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 print:divide-gray-200">
                <tr className="hover:bg-foreground/5 print:hover:bg-transparent">
                  <td className="py-3 px-4 font-semibold">Total Revenue</td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums">₹{stats?.revenue?.toLocaleString() || '0'}</td>
                  <td className="py-3 px-4 text-right"><span className="text-emerald-500 font-bold">● Active</span></td>
                </tr>
                <tr className="hover:bg-foreground/5 print:hover:bg-transparent">
                  <td className="py-3 px-4 font-semibold">Total Expenses</td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums">₹{totalExpenses?.toLocaleString() || '0'}</td>
                  <td className="py-3 px-4 text-right"><span className="text-amber-500 font-bold">● Monitored</span></td>
                </tr>
                <tr className="hover:bg-foreground/5 print:hover:bg-transparent">
                  <td className="py-3 px-4 font-semibold">Net Profit</td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums">₹{stats?.netProfit?.toLocaleString() || '0'}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-bold ${stats?.netProfit > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ● {stats?.netProfit > 0 ? 'Positive' : 'Negative'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-foreground/5 print:hover:bg-transparent">
                  <td className="py-3 px-4 font-semibold">Profit Margin</td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums">{margin}%</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-bold ${marginColor}`}>● {marginHealth}</span>
                  </td>
                </tr>
                <tr className="hover:bg-foreground/5 print:hover:bg-transparent">
                  <td className="py-3 px-4 font-semibold">Sales Volume</td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums">{stats?.salesCount || 0} transactions</td>
                  <td className="py-3 px-4 text-right"><span className="text-blue-500 font-bold">● Tracked</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Expense Distribution */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 print:bg-white print:border print:border-gray-200 print:rounded-none">
          <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3 print:text-black">
            <PieChart size={20} className="text-accent print:text-purple-600" />
            Expense Distribution
          </h3>
          
          {expenses.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {expenses.map((exp, i) => (
                <div key={i} className="p-4 rounded-xl bg-foreground/[0.03] border border-border/30 print:border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: exp.color }} />
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">{exp.name}</span>
                  </div>
                  <p className="text-2xl font-black tabular-nums">{exp.value}%</p>
                  {/* Visual bar */}
                  <div className="mt-2 h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden print:bg-gray-100">
                    <div className="h-full rounded-full transition-all" style={{ width: `${exp.value}%`, backgroundColor: exp.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary italic">No expense data available.</p>
          )}
        </div>

        {/* Section 3: Risk Assessment */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 print:bg-white print:border print:border-gray-200 print:rounded-none">
          <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3 print:text-black">
            <AlertTriangle size={20} className="text-amber-500" />
            Risk Assessment
          </h3>

          <div className="space-y-3">
            {aiInsights?.anomalies?.map((anomaly: any, i: number) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${
                anomaly.type === 'Critical' ? 'bg-red-500/5 border-red-500/15' :
                anomaly.type === 'Warning' ? 'bg-amber-500/5 border-amber-500/15' :
                'bg-blue-500/5 border-blue-500/15'
              } print:border-gray-200 print:bg-gray-50`}>
                <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                  anomaly.type === 'Critical' ? 'bg-red-500/20 text-red-500' :
                  anomaly.type === 'Warning' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-blue-500/20 text-blue-500'
                } print:bg-gray-200 print:text-gray-700`}>
                  {anomaly.type}
                </span>
                <p className="text-sm font-medium leading-relaxed">{anomaly.message}</p>
              </div>
            )) || (
              <p className="text-sm text-secondary italic">No risks detected in current cycle.</p>
            )}
          </div>
        </div>

        {/* Section 4: 3-Month Forecast */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 print:bg-white print:border print:border-gray-200 print:rounded-none">
          <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3 print:text-black">
            <Zap size={20} className="text-primary print:text-blue-600" />
            3-Month Forecast
          </h3>

          {forecast.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 print:border-gray-300">
                    <th className="text-left py-3 px-4 text-xs font-black text-secondary uppercase tracking-widest">Month</th>
                    <th className="text-right py-3 px-4 text-xs font-black text-secondary uppercase tracking-widest">Revenue</th>
                    <th className="text-right py-3 px-4 text-xs font-black text-secondary uppercase tracking-widest">Expenses</th>
                    <th className="text-right py-3 px-4 text-xs font-black text-secondary uppercase tracking-widest">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 print:divide-gray-200">
                  {forecast.map((f, i) => (
                    <tr key={i} className="hover:bg-foreground/5 print:hover:bg-transparent">
                      <td className="py-3 px-4 font-semibold">{f.month}</td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums text-emerald-500">₹{f.revenue?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums text-red-400">₹{f.expenses?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums">₹{f.profit?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-secondary">Forecast data unavailable. Configure Gemini API key or add more transaction history.</p>
            </div>
          )}
        </div>

        {/* Section 5: Strategic Recommendations */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 print:bg-white print:border print:border-gray-200 print:rounded-none">
          <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3 print:text-black">
            <Lightbulb size={20} className="text-violet-500" />
            Strategic Recommendations
          </h3>

          <div className="space-y-4">
            {aiInsights?.strategy?.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-foreground/[0.03] border border-border/30 print:border-gray-200">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-sm ${
                  item.priority === 'High' ? 'bg-violet-500 text-white' :
                  item.priority === 'Medium' ? 'bg-blue-500/50 text-white' :
                  'bg-foreground/10 text-secondary'
                } print:bg-gray-200 print:text-gray-700`}>
                  {i + 1}
                </div>
                <div>
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{item.priority} Priority</span>
                  <p className="text-sm font-semibold leading-relaxed mt-1">{item.advice}</p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-secondary italic">No strategic recommendations available.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3 pt-6 border-t border-border/30 print:border-gray-200">
          <p className="text-xs text-secondary/60 font-medium">
            This report was electronically generated by BizAnalytics AI Engine. All metrics are derived from real-time transaction data.
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-secondary/30 font-bold uppercase tracking-[0.3em]">
            <span>Report ID: ER-{generatedAt.getTime().toString(36).toUpperCase()}</span>
            <span className="w-1 h-1 rounded-full bg-secondary/30" />
            <span>Generated: {generatedAt.toISOString()}</span>
          </div>
        </div>
      </div>
    </div>
    </UpgradeGate>
  );
}
