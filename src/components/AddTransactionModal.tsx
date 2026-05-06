'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  IndianRupee, 
  Calendar as CalendarIcon, 
  Tag, 
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { createTransaction, getCategories } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { DynamicIcon } from './DynamicIcon';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
    // Auto-select first category if none selected
    if (data.length > 0 && !formData.categoryId) {
      setFormData(prev => ({ ...prev, categoryId: data[0].id }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.categoryId) {
      setError('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createTransaction({
        amount: parseFloat(formData.amount),
        type: formData.type as 'SALE' | 'EXPENSE',
        description: formData.description,
        categoryId: formData.categoryId,
        date: new Date(formData.date),
      });

      if (result.success) {
        onSuccess();
        onClose();
        setFormData({
          amount: '',
          type: 'EXPENSE',
          description: '',
          categoryId: categories[0]?.id || '',
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        setError(result.error || 'Failed to save transaction');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group categories by parent
  const parentCategories = categories.filter(c => !c.parentId);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg"
      >
        <GlassCard className="p-0 border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display">New Transaction</h3>
                <p className="text-xs text-secondary">Manually add financial records</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-secondary transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 p-1 bg-white/5 rounded-2xl border border-white/10">
              {['EXPENSE', 'SALE'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={cn(
                    "py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                    formData.type === type 
                      ? type === 'SALE' ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "text-secondary hover:text-white"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <label className="absolute left-4 top-3 text-[10px] font-bold text-secondary uppercase tracking-[0.15em] transition-all group-focus-within:text-primary">
                  Amount (₹)
                </label>
                <div className="flex items-center">
                  <span className="absolute left-4 top-[26px] text-lg text-secondary"><IndianRupee size={20} /></span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pt-8 pb-3 px-10 outline-none focus:ring-2 focus:ring-primary/50 text-xl font-bold transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="absolute left-4 top-3 text-[10px] font-bold text-secondary uppercase tracking-[0.15em] transition-all group-focus-within:text-primary">
                    Date
                  </label>
                  <div className="flex items-center">
                    <span className="absolute left-4 top-[26px] text-secondary"><CalendarIcon size={18} /></span>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pt-8 pb-3 px-10 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="absolute left-4 top-3 text-[10px] font-bold text-secondary uppercase tracking-[0.15em] transition-all group-focus-within:text-primary">
                    Category
                  </label>
                  <div className="flex items-center">
                    <span className="absolute left-4 top-[26px] text-secondary"><Tag size={18} /></span>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pt-8 pb-3 px-10 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium transition-all appearance-none cursor-pointer"
                    >
                      {parentCategories.map(parent => (
                        <React.Fragment key={parent.id}>
                          <option value={parent.id} className="bg-slate-900 font-bold">{parent.name}</option>
                          {categories
                            .filter(c => c.parentId === parent.id)
                            .map(child => (
                              <option key={child.id} value={child.id} className="bg-slate-900 pl-4 py-2">
                                &nbsp;&nbsp;↳ {child.name}
                              </option>
                            ))
                          }
                        </React.Fragment>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <label className="absolute left-4 top-3 text-[10px] font-bold text-secondary uppercase tracking-[0.15em] transition-all group-focus-within:text-primary">
                  Description
                </label>
                <div className="flex items-center">
                  <span className="absolute left-4 top-[26px] text-secondary"><FileText size={18} /></span>
                  <input
                    type="text"
                    placeholder="What was this for?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pt-8 pb-3 px-10 outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl",
                formData.type === 'SALE' 
                  ? "bg-green-600 hover:bg-green-500 shadow-green-600/20" 
                  : "bg-primary hover:bg-primary/90 shadow-primary/20",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
              <span>{isSubmitting ? 'Saving...' : `Add ${formData.type === 'SALE' ? 'Income' : 'Expense'}`}</span>
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
