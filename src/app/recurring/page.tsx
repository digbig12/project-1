'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, Plus, Trash2, Play, Pause, X,
  Calendar, IndianRupee, Zap, Clock
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { getRecurringTransactions, createRecurringTransaction, toggleRecurring, deleteRecurring, processRecurringTransactions } from '@/lib/recurring-actions';
import { getCategories } from '@/lib/actions';
import { DynamicIcon } from '@/components/DynamicIcon';

export default function RecurringPage() {
  const [recurring, setRecurring] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [nextDueDate, setNextDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setIsLoading(true);
    const [recData, catData] = await Promise.all([
      getRecurringTransactions(),
      getCategories(),
    ]);
    setRecurring(recData);
    setCategories(catData);
    setIsLoading(false);
  }

  async function handleCreate() {
    if (!amount || !description || !categoryId || !nextDueDate) return;
    setSaving(true);
    await createRecurringTransaction({
      amount: parseFloat(amount),
      type, description, categoryId, frequency, nextDueDate,
    });
    setShowCreate(false);
    resetForm();
    fetchData();
    setSaving(false);
  }

  function resetForm() {
    setAmount(''); setType('EXPENSE'); setDescription('');
    setCategoryId(''); setFrequency('MONTHLY'); setNextDueDate('');
  }

  async function handleToggle(id: string) {
    await toggleRecurring(id);
    fetchData();
  }

  async function handleDelete(id: string) {
    await deleteRecurring(id);
    fetchData();
  }

  async function handleProcess() {
    setProcessing(true);
    const result = await processRecurringTransactions();
    alert(`Processed ${result.processed} recurring transaction(s)`);
    fetchData();
    setProcessing(false);
  }

  const activeCount = recurring.filter(r => r.isActive).length;
  const monthlyTotal = recurring.filter(r => r.isActive && r.frequency === 'MONTHLY').reduce((s, r) => s + r.amount, 0);
  const dueToday = recurring.filter(r => r.isActive && new Date(r.nextDueDate) <= new Date()).length;

  const freqLabels: Record<string, string> = {
    DAILY: 'Daily', WEEKLY: 'Weekly', MONTHLY: 'Monthly', YEARLY: 'Yearly',
  };

  const freqColors: Record<string, string> = {
    DAILY: 'text-violet-400 bg-violet-500/10',
    WEEKLY: 'text-blue-400 bg-blue-500/10',
    MONTHLY: 'text-emerald-400 bg-emerald-500/10',
    YEARLY: 'text-amber-400 bg-amber-500/10',
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Recurring</h1>
          <p className="text-secondary mt-1">Automate your monthly bills, salaries, and subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          {dueToday > 0 && (
            <button onClick={handleProcess} disabled={processing} className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-500/20 transition-all disabled:opacity-50">
              {processing ? <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /> : <Zap size={16} />}
              Process {dueToday} Due
            </button>
          )}
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Plus size={18} />
            Add Recurring
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-5" delay={0.05}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><RefreshCw size={18} className="text-primary" /></div>
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-wider">Active</p>
              <p className="text-xl font-black">{activeCount} recurring</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-5" delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center"><IndianRupee size={18} className="text-violet-400" /></div>
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-wider">Monthly Commitment</p>
              <p className="text-xl font-black tabular-nums">₹{monthlyTotal.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-5" delay={0.15}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dueToday > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
              <Clock size={18} className={dueToday > 0 ? 'text-amber-400' : 'text-emerald-400'} />
            </div>
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-wider">Due Today</p>
              <p className={`text-xl font-black ${dueToday > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{dueToday} transactions</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recurring List */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-6">Scheduled Transactions</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : recurring.length === 0 ? (
          <div className="text-center py-20">
            <RefreshCw className="mx-auto text-secondary/30 mb-4" size={48} />
            <p className="text-secondary font-medium">No recurring transactions</p>
            <p className="text-xs text-secondary/60 mt-1">Add rent, salaries, or subscriptions to automate</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recurring.map((rec, i) => {
              const isDue = new Date(rec.nextDueDate) <= new Date();
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${
                    !rec.isActive ? 'opacity-50 bg-white/[0.01] border-white/5' :
                    isDue ? 'bg-amber-500/5 border-amber-500/15' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (rec.category?.color || '#3b82f6') + '18' }}>
                      <DynamicIcon name={rec.category?.icon || 'Tag'} size={18} style={{ color: rec.category?.color || '#3b82f6' }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{rec.description}</p>
                      <p className="text-xs text-secondary flex items-center gap-2">
                        <span className={rec.type === 'EXPENSE' ? 'text-red-400' : 'text-emerald-400'}>{rec.type}</span>
                        · {rec.category?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${freqColors[rec.frequency] || freqColors.MONTHLY}`}>
                      {freqLabels[rec.frequency]}
                    </span>
                    <div className="text-right">
                      <p className="font-bold tabular-nums text-sm">₹{rec.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-secondary">
                        Next: {new Date(rec.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    {isDue && rec.isActive && (
                      <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg uppercase">Due</span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleToggle(rec.id)} className={`p-2 rounded-lg transition-colors ${rec.isActive ? 'hover:bg-amber-500/10 text-amber-400' : 'hover:bg-emerald-500/10 text-emerald-400'}`} title={rec.isActive ? 'Pause' : 'Resume'}>
                        {rec.isActive ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button onClick={() => handleDelete(rec.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-bold flex items-center gap-2"><RefreshCw size={18} className="text-primary" /> New Recurring</h2>
                <button onClick={() => { setShowCreate(false); resetForm(); }} className="p-2 rounded-lg hover:bg-white/10"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <input placeholder="Description (e.g. Office Rent)" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Amount (₹)</label>
                    <input type="number" placeholder="e.g. 25000" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Type</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none">
                      <option value="EXPENSE" className="bg-[#0f1729]">Expense</option>
                      <option value="SALE" className="bg-[#0f1729]">Income</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Category</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none">
                      <option value="" className="bg-[#0f1729]">Select...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id} className="bg-[#0f1729]">{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Frequency</label>
                    <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none">
                      <option value="DAILY" className="bg-[#0f1729]">Daily</option>
                      <option value="WEEKLY" className="bg-[#0f1729]">Weekly</option>
                      <option value="MONTHLY" className="bg-[#0f1729]">Monthly</option>
                      <option value="YEARLY" className="bg-[#0f1729]">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">First Due Date</label>
                  <input type="date" value={nextDueDate} onChange={e => setNextDueDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none" />
                </div>
              </div>
              <div className="p-6 border-t border-border flex justify-end gap-3">
                <button onClick={() => { setShowCreate(false); resetForm(); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-secondary hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleCreate} disabled={saving || !amount || !description || !categoryId || !nextDueDate} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold disabled:opacity-50 transition-all hover:scale-[1.02]">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
