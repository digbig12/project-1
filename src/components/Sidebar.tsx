'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut,
  ListOrdered,
  LineChart,
  FileText,
  Search,
  Crown,
  Receipt,
  RefreshCw,
  Wallet,
  Scale,
  Calculator
} from 'lucide-react';
import { motion } from 'framer-motion';

import { signOut } from 'next-auth/react';
import { getSubscriptionAction } from '@/actions/stripe';
import { ProBadge } from '@/components/UpgradeGate';

import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/', pro: false },
  { name: 'Transactions', icon: ListOrdered, href: '/transactions', pro: false },
  { name: 'Invoices', icon: Receipt, href: '/invoices', pro: false },
  { name: 'Recurring', icon: RefreshCw, href: '/recurring', pro: false },
  { name: 'Analytics', icon: BarChart3, href: '/analytics', pro: false },
  { name: 'Budgets', icon: Wallet, href: '/budgets', pro: true },
  { name: 'P&L Statement', icon: Scale, href: '/pnl', pro: true },
  { name: 'GST Report', icon: Calculator, href: '/gst-report', pro: true },
  { name: 'Executive Report', icon: FileText, href: '/executive-report', pro: true },
  { name: 'CFO Report', icon: Crown, href: '/cfo-report', pro: true },
  { name: 'AI Chat', icon: MessageSquare, href: '/chat', pro: false },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    getSubscriptionAction().then((sub) => setIsPro(sub.isPro));
  }, []);

  return (
    <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-xl h-screen sticky top-0 flex flex-col pt-8">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border/30 flex items-center justify-center shadow-lg group">
            <img src="/logo.png" alt="BizAnalytics" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight block">BizAnalytics</span>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-[0.2em]",
              isPro ? "text-blue-400" : "text-secondary/50"
            )}>
              {isPro ? "✦ Advanced" : "Basic Plan"}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-secondary hover:bg-secondary/5 hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-primary" : "group-hover:text-foreground"
              )} />
              <span className="font-medium">{item.name}</span>
              {item.pro && !isPro && (
                <ProBadge />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-border pt-6 px-4 pb-6">
        {/* Quick Search Hint */}
        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
            window.dispatchEvent(event);
          }}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 mb-2 text-sm font-medium text-secondary transition-colors hover:bg-foreground/5 hover:text-foreground border border-border/50 bg-foreground/[0.02]"
        >
          <Search size={16} />
          <span className="flex-1 text-left text-xs">Quick Search</span>
          <kbd className="text-[10px] font-bold bg-foreground/5 px-1.5 py-0.5 rounded border border-border/50 text-secondary/60">Ctrl+K</kbd>
        </button>
        <div className="flex items-center justify-between gap-2 mb-2">
          <Link
            href="/settings"
            className="flex-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-secondary/10 hover:text-foreground"
          >
            <Settings size={20} />
            Settings
          </Link>
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          suppressHydrationWarning
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

