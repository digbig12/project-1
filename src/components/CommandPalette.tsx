'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  ListOrdered,
  BarChart3,
  MessageSquare,
  Settings,
  FileText,
  Plus,
  Download,
  Zap,
  ArrowRight,
  Command,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  X,
  IndianRupee,
  Tag,
  Clock
} from 'lucide-react';
import { getTransactions } from '@/lib/actions';

interface SearchResult {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: 'Navigation' | 'Transactions' | 'Quick Actions';
  action: () => void;
}

const PAGES: Omit<SearchResult, 'action'>[] = [
  { id: 'nav-dashboard', label: 'Dashboard', description: 'Financial overview & KPIs', icon: <LayoutDashboard size={16} />, category: 'Navigation' },
  { id: 'nav-transactions', label: 'Transactions', description: 'All income & expenses', icon: <ListOrdered size={16} />, category: 'Navigation' },
  { id: 'nav-analytics', label: 'Analytics', description: 'Charts, forecasts & trends', icon: <BarChart3 size={16} />, category: 'Navigation' },
  { id: 'nav-chat', label: 'AI Chat', description: 'Ask your AI CFO anything', icon: <MessageSquare size={16} />, category: 'Navigation' },
  { id: 'nav-executive', label: 'Executive Report', description: 'Board-ready PDF summary', icon: <FileText size={16} />, category: 'Navigation' },
  { id: 'nav-cfo', label: 'CFO Report', description: 'Strategic intelligence brief', icon: <Zap size={16} />, category: 'Navigation' },
  { id: 'nav-settings', label: 'Settings', description: 'Profile, categories & data', icon: <Settings size={16} />, category: 'Navigation' },
];

const QUICK_ACTIONS: Omit<SearchResult, 'action'>[] = [
  { id: 'qa-add-expense', label: 'Add Expense', description: 'Record a new expense', icon: <Plus size={16} />, category: 'Quick Actions' },
  { id: 'qa-add-sale', label: 'Add Sale', description: 'Record a new sale', icon: <Plus size={16} />, category: 'Quick Actions' },
  { id: 'qa-export', label: 'Export to CSV', description: 'Download transaction data', icon: <Download size={16} />, category: 'Quick Actions' },
  { id: 'qa-forecast', label: 'Generate Forecast', description: 'AI-powered 3-month projection', icon: <Zap size={16} />, category: 'Quick Actions' },
  { id: 'qa-report', label: 'Download Executive Report', description: 'Print-ready PDF', icon: <FileText size={16} />, category: 'Quick Actions' },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build results
  const buildResults = useCallback((): SearchResult[] => {
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Pages
    const pageResults = PAGES.filter(p =>
      !q || p.label.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q))
    ).map(p => ({
      ...p,
      action: () => {
        const routes: Record<string, string> = {
          'nav-dashboard': '/',
          'nav-transactions': '/transactions',
          'nav-analytics': '/analytics',
          'nav-chat': '/chat',
          'nav-executive': '/executive-report',
          'nav-cfo': '/cfo-report',
          'nav-settings': '/settings',
        };
        router.push(routes[p.id] || '/');
        setIsOpen(false);
      }
    }));
    results.push(...pageResults);

    // Quick Actions
    const qaResults = QUICK_ACTIONS.filter(qa =>
      !q || qa.label.toLowerCase().includes(q) || (qa.description?.toLowerCase().includes(q))
    ).map(qa => ({
      ...qa,
      action: () => {
        switch (qa.id) {
          case 'qa-add-expense':
          case 'qa-add-sale':
            router.push('/transactions');
            break;
          case 'qa-export':
            router.push('/analytics');
            break;
          case 'qa-forecast':
            router.push('/analytics');
            break;
          case 'qa-report':
            router.push('/executive-report');
            break;
        }
        setIsOpen(false);
      }
    }));
    results.push(...qaResults);

    // Transactions (only when there's a query)
    if (q && transactions.length > 0) {
      const txnResults = transactions
        .filter(t => 
          t.description?.toLowerCase().includes(q) ||
          t.category?.name?.toLowerCase().includes(q) ||
          t.amount?.toString().includes(q)
        )
        .slice(0, 5)
        .map((t: any) => ({
          id: `txn-${t.id}`,
          label: t.description || 'Transaction',
          description: `₹${t.amount?.toLocaleString()} • ${t.type} • ${t.category?.name || 'General'}`,
          icon: <IndianRupee size={16} />,
          category: 'Transactions' as const,
          action: () => {
            router.push('/transactions');
            setIsOpen(false);
          }
        }));
      results.push(...txnResults);
    }

    return results;
  }, [query, transactions, router]);

  const results = buildResults();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input on open + load transactions
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Load transactions in background
      if (transactions.length === 0) {
        setIsLoadingTxns(true);
        getTransactions()
          .then((txns: any) => setTransactions(txns.slice(0, 50)))
          .catch(() => {})
          .finally(() => setIsLoadingTxns(false));
      }
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation within the palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      results[selectedIndex].action();
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Group results by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-[640px]"
          >
            <div className="bg-card/95 backdrop-blur-2xl border border-border/60 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                <Search size={18} className="text-secondary shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search pages, transactions, or actions..."
                  className="flex-1 bg-transparent text-foreground text-sm font-medium placeholder:text-secondary/60 outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-foreground/5 border border-border/50 text-[10px] font-bold text-secondary tracking-wider">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[400px] overflow-y-auto custom-scrollbar py-2">
                {results.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <Search size={32} className="mx-auto text-secondary/30 mb-3" />
                    <p className="text-sm font-bold text-secondary">No results found</p>
                    <p className="text-xs text-secondary/60 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <div className="px-5 py-2">
                        <p className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em]">{category}</p>
                      </div>
                      {items.map(item => {
                        flatIndex++;
                        const currentIdx = flatIndex;
                        const isSelected = currentIdx === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            data-index={currentIdx}
                            onClick={item.action}
                            onMouseEnter={() => setSelectedIndex(currentIdx)}
                            className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all duration-100 group ${
                              isSelected
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground hover:bg-foreground/5'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'bg-primary/20 text-primary' : 'bg-foreground/5 text-secondary'
                            }`}>
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{item.label}</p>
                              {item.description && (
                                <p className="text-[11px] text-secondary truncate">{item.description}</p>
                              )}
                            </div>
                            <ArrowRight size={14} className={`shrink-0 transition-all ${
                              isSelected ? 'opacity-100 text-primary' : 'opacity-0'
                            }`} />
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-foreground/[0.02]">
                <div className="flex items-center gap-4 text-[10px] font-bold text-secondary/50 tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <ArrowUp size={10} />
                    <ArrowDown size={10} />
                    Navigate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CornerDownLeft size={10} />
                    Select
                  </span>
                  <span className="flex items-center gap-1.5">
                    <X size={10} />
                    Close
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-secondary/40">
                  <Command size={10} />
                  <span>BizAnalytics</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
