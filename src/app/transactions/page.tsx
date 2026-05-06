'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Tag,
  MoreVertical,
  ScanLine,
  Plus,
  Receipt
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { OCRModal } from '@/components/OCRModal';
import { CSVImportModal } from '@/components/CSVImportModal';
import { getTransactions } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { Database } from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';
import { AddTransactionModal } from '@/components/AddTransactionModal';

export default function TransactionsPage() {
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Transactions</h1>
          <p className="text-secondary mt-1">Manage and track all financial activities</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-secondary hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl font-bold transition-all"
          >
            <Database size={18} />
            <span>Bulk Import</span>
          </button>

          <button 
            onClick={() => setIsOCRModalOpen(true)}
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-xl font-bold hover:bg-primary/20 transition-all border border-primary/20"
          >
            <ScanLine size={18} />
            <span>Scan Receipt</span>
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={18} />
            <span>New Transaction</span>
          </button>

          <div className="flex items-center gap-1 bg-card/30 backdrop-blur-md border border-border p-1 rounded-xl ml-2">
            <button 
              onClick={() => setView('table')}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                view === 'table' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-secondary hover:text-white"
              )}
            >
              <TableIcon size={18} />
            </button>
            <button 
              onClick={() => setView('cards')}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                view === 'cards' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-secondary hover:text-white"
              )}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      <OCRModal 
        isOpen={isOCRModalOpen} 
        onClose={() => setIsOCRModalOpen(false)} 
        onSuccess={() => fetchData()}
      />
      
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => fetchData()}
      />

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchData} 
      />

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card/30 backdrop-blur-md border border-border rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
          />
        </div>
        <button className="flex items-center gap-2 bg-card/30 backdrop-blur-md border border-border px-6 py-3 rounded-2xl text-secondary hover:text-white transition-all">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-20"
          >
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'table' ? (
              <TabularView transactions={filteredTransactions} />
            ) : (
              <CardView transactions={filteredTransactions} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabularView({ transactions }: { transactions: any[] }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-card/20 backdrop-blur-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border/50">
            <th className="px-6 py-5 text-sm font-semibold text-secondary">Date</th>
            <th className="px-6 py-5 text-sm font-semibold text-secondary">Description</th>
            <th className="px-6 py-5 text-sm font-semibold text-secondary">Category</th>
            <th className="px-6 py-5 text-sm font-semibold text-secondary">Type</th>
            <th className="px-6 py-5 text-sm font-semibold text-secondary">Tax Status</th>
            <th className="px-6 py-5 text-sm font-semibold text-secondary text-right">Amount</th>
            <th className="px-6 py-5 text-sm font-semibold text-secondary text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-border/30 hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-secondary" />
                  <span className="text-sm font-medium">{new Date(t.date).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-semibold text-white">{t.description}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center" 
                    style={{ backgroundColor: t.category.color + '15' }}
                  >
                    <DynamicIcon name={t.category.icon || 'Tag'} size={12} style={{ color: t.category.color }} />
                  </div>
                  <span className="text-xs font-medium text-secondary">{t.category.name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  t.type === 'SALE' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {t.type}
                </span>
              </td>
              <td className="px-6 py-4">
                {t.isTaxDeductible ? (
                  <div className="group relative flex items-center gap-1.5 cursor-help">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-amber-500/20">
                      <Receipt size={12} />
                      Deductible
                    </span>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[200px] bg-black/90 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                      {t.taxReason || "Standard business deduction"}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-secondary/50 font-bold uppercase">--</span>
                )}
              </td>
              <td className={cn(
                "px-6 py-4 text-right text-sm font-bold",
                t.type === 'SALE' ? "text-green-400" : "text-red-400"
              )}>
                {t.type === 'SALE' ? '+' : '-'}₹{t.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-center">
                <button className="p-2 text-secondary hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardView({ transactions }: { transactions: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {transactions.map((t, i) => (
        <GlassCard key={t.id} delay={i * 0.05} className="group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button className="text-secondary hover:text-white transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical size={18} />
            </button>
          </div>
          
          <div className="flex items-start gap-4 mb-6">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300",
              t.type === 'SALE' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-400"
            )}>
              <DynamicIcon name={t.category.icon || (t.type === 'SALE' ? 'ArrowDownLeft' : 'ArrowUpRight')} size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest">{t.category.name}</p>
              <h4 className="text-lg font-bold text-white mt-1 leading-tight">{t.description}</h4>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-secondary">
                <Calendar size={14} />
                <span className="text-xs font-medium">{new Date(t.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-secondary">
                <Tag size={14} />
                <span className="text-xs font-medium uppercase">{t.type}</span>
              </div>
              {t.isTaxDeductible && (
                <div className="flex items-center gap-1.5 text-amber-500 mt-1 cursor-help group/tax relative">
                  <Receipt size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Tax Deductible</span>
                  <div className="absolute left-0 bottom-full mb-2 w-max max-w-[150px] bg-black/90 text-white text-xs p-2 rounded-lg opacity-0 group-hover/tax:opacity-100 transition-opacity pointer-events-none z-10 text-left leading-tight hidden md:block">
                    {t.taxReason || "Standard business deduction"}
                  </div>
                </div>
              )}
            </div>
            <div className={cn(
              "text-2xl font-black text-right",
              t.type === 'SALE' ? "text-green-400" : "text-red-400"
            )}>
              {t.type === 'SALE' ? '+' : '-'}₹{t.amount.toLocaleString()}
            </div>
          </div>
          
          {/* Accent Glow */}
          <div 
            className="absolute -bottom-10 -right-10 w-32 h-32 blur-[80px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
            style={{ backgroundColor: t.type === 'SALE' ? '#10b981' : '#ef4444' }}
          />
        </GlassCard>
      ))}
    </div>
  );
}
