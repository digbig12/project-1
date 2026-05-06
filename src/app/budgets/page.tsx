'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Plus, AlertTriangle, CheckCircle2,
  TrendingUp, IndianRupee, Target, Trash2
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { getBudgets, setBudget, deleteBudget } from '@/lib/budget-actions';
import { getCategories } from '@/lib/actions';
import { getSubscriptionAction } from '@/actions/stripe';
import { UpgradeGate } from '@/components/UpgradeGate';
import { DynamicIcon } from '@/components/DynamicIcon';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  // Form
  const [selectedCat, setSelectedCat] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    fetchData();
    getSubscriptionAction().then(s => setIsPro(s.isPro));
  }, []);

  useEffect(() => { fetchBudgets(); }, [month, year]);

  async function fetchData() {
    const [cats] = await Promise.all([getCategories()]);
    setCategories(cats);
    fetchBudgets();
  }

  async function fetchBudgets() {
    setIsLoading(true);
    const data = await getBudgets(month, year);
    setBudgets(data);
    setIsLoading(false);
  }

  async function handleSetBudget() {
    if (!selectedCat || !limitAmount) return;
    setSaving(true);
    await setBudget(selectedCat, parseFloat(limitAmount), month, year);
    setSelectedCat('');
    setLimitAmount('');
    fetchBudgets();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteBudget(id);
    fetchBudgets();
  }

  const totalBudget = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudgetCount = budgets.filter(b => b.isOverBudget).length;
  const healthScore = totalBudget > 0 ? Math.round((1 - totalSpent / totalBudget) * 100) : 100;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <UpgradeGate isPro={isPro} feature="Budget Planner" description="Set spending limits per category, track budget vs actual spending, and get over-budget alerts. Upgrade to Advanced to unlock.">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Budget Planner</h1>
            <p className="text-secondary mt-1">Set spending limits and track your budget health</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
            <button onClick={() => setMonth(m => m === 1 ? 12 : m - 1)} className="p-2 rounded-lg hover:bg-white/10 text-secondary">←</button>
            <span className="text-sm font-bold px-3">{monthNames[month - 1]} {year}</span>
            <button onClick={() => setMonth(m => m === 12 ? 1 : m + 1)} className="p-2 rounded-lg hover:bg-white/10 text-secondary">→</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassCard className="p-5" delay={0.05}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Wallet size={18} className="text-blue-400" /></div>
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider">Total Budget</p>
                <p className="text-xl font-black tabular-nums">₹{totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5" delay={0.1}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center"><IndianRupee size={18} className="text-violet-400" /></div>
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider">Total Spent</p>
                <p className="text-xl font-black tabular-nums">₹{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5" delay={0.15}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${overBudgetCount > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                {overBudgetCount > 0 ? <AlertTriangle size={18} className="text-red-400" /> : <CheckCircle2 size={18} className="text-emerald-400" />}
              </div>
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider">Over Budget</p>
                <p className={`text-xl font-black ${overBudgetCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{overBudgetCount} categories</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5" delay={0.2}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${healthScore > 50 ? 'bg-emerald-500/10' : healthScore > 20 ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                <Target size={18} className={healthScore > 50 ? 'text-emerald-400' : healthScore > 20 ? 'text-amber-400' : 'text-red-400'} />
              </div>
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider">Health Score</p>
                <p className={`text-xl font-black ${healthScore > 50 ? 'text-emerald-400' : healthScore > 20 ? 'text-amber-400' : 'text-red-400'}`}>{Math.max(0, healthScore)}%</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Add Budget Form */}
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Category</label>
              <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50">
                <option value="" className="bg-[#0f1729]">Select category...</option>
                {categories.filter(c => c.type !== 'SALE' && !budgets.some(b => b.categoryId === c.id)).map(c => (
                  <option key={c.id} value={c.id} className="bg-[#0f1729]">{c.name}</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Monthly Limit (₹)</label>
              <input type="number" placeholder="e.g. 50000" value={limitAmount} onChange={e => setLimitAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <button onClick={handleSetBudget} disabled={saving || !selectedCat || !limitAmount} className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold disabled:opacity-50 transition-all hover:scale-[1.02] shrink-0">
              <Plus size={16} />
              Set Budget
            </button>
          </div>
        </GlassCard>

        {/* Budget Tracker */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-6">Budget Tracker — {monthNames[month - 1]} {year}</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-20">
              <Wallet className="mx-auto text-secondary/30 mb-4" size={48} />
              <p className="text-secondary font-medium">No budgets set for this month</p>
              <p className="text-xs text-secondary/60 mt-1">Add a budget above to start tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget, i) => (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-5 rounded-2xl border transition-all ${
                    budget.isOverBudget
                      ? 'bg-red-500/5 border-red-500/20'
                      : budget.percentage > 80
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: budget.categoryColor + '18' }}>
                        <DynamicIcon name={budget.categoryIcon} size={16} style={{ color: budget.categoryColor }} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{budget.categoryName}</p>
                        <p className="text-xs text-secondary">
                          ₹{budget.spent.toLocaleString()} / ₹{budget.monthlyLimit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-black tabular-nums ${
                        budget.isOverBudget ? 'text-red-400' : budget.percentage > 80 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {budget.percentage.toFixed(0)}%
                      </span>
                      {budget.isOverBudget && (
                        <span className="text-[9px] font-black text-red-400 bg-red-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                          Over Budget
                        </span>
                      )}
                      <button onClick={() => handleDelete(budget.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-secondary hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: budget.isOverBudget ? '#ef4444' : budget.percentage > 80 ? '#f59e0b' : budget.categoryColor,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
                    />
                  </div>
                  {budget.isOverBudget && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      Over budget by ₹{(budget.spent - budget.monthlyLimit).toLocaleString()}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </UpgradeGate>
  );
}
