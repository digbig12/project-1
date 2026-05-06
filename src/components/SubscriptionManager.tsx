'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Trash2, 
  RefreshCw, 
  ShieldAlert,
  ArrowRight,
  Zap
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getSubscriptions } from '@/lib/actions';

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getSubscriptions();
    setSubscriptions(data);
    setLoading(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchData();
    setIsSyncing(false);
  };


  if (loading) {
    return (
      <GlassCard className="h-full flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </GlassCard>
    );
  }

  const monthlyBurn = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);

  return (
    <GlassCard className="h-full flex flex-col p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
            <RefreshCw size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Subscriptions</h3>
            <p className="text-xs text-secondary uppercase tracking-widest">Recurring Burn</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-secondary uppercase">Monthly Leak</p>
          <h4 className="text-xl font-black text-amber-500">₹{monthlyBurn.toLocaleString()}</h4>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {subscriptions.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <ShieldAlert size={32} className="mx-auto text-secondary opacity-30" />
            <p className="text-xs text-secondary">No recurring subscriptions detected yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.slice(0, 4).map((sub, i) => (
              <motion.div
                key={sub.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-secondary group-hover:text-amber-500 transition-colors">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">{sub.name}</h5>
                    <p className="text-[10px] text-secondary uppercase">{sub.category}</p>
                  </div>
                </div>
                <div className="text-right">
                <p className="text-sm font-black text-white">₹{sub.amount}</p>
                  <p className="text-[10px] text-secondary">Billed Monthly</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4">
        <Zap className="text-amber-500 shrink-0" size={20} />
        <div>
          <h4 className="text-xs font-bold text-amber-500">Optimize Detected</h4>
          <p className="text-[10px] text-secondary leading-tight">
            You have 2 overlapping software subscriptions. You could save <span className="text-white font-bold">₹22/mo</span> by consolidating.
          </p>
        </div>
        <ArrowRight className="text-amber-500 ml-auto" size={16} />
      </div>

      <button 
        onClick={handleSync}
        disabled={isSyncing}
        className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-secondary hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <RefreshCw size={14} className={isSyncing ? "animate-spin text-amber-500" : ""} />
        {isSyncing ? 'Scanning Subscriptions...' : 'Sync and Rescan All Subscriptions'}
      </button>
    </GlassCard>
  );
}
