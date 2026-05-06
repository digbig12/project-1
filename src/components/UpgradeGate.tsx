"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, ArrowRight, Crown, Shield, Zap, Check } from "lucide-react";
import Link from "next/link";

interface UpgradeGateProps {
  feature: string;
  description?: string;
  children: React.ReactNode;
  isPro: boolean;
}

export function UpgradeGate({ feature, description, children, isPro }: UpgradeGateProps) {
  if (isPro) return <>{children}</>;

  return (
    <div className="relative min-h-[70vh]">
      {/* Blurred preview of the content */}
      <div className="blur-[8px] opacity-20 pointer-events-none select-none overflow-hidden max-h-[80vh]" aria-hidden="true">
        {children}
      </div>

      {/* Animated gradient background */}
      <div className="absolute inset-0" style={{ zIndex: 45 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </div>

      {/* Overlay lock card */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 50 }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
          className="relative bg-card/95 backdrop-blur-2xl border border-border rounded-3xl p-10 max-w-lg text-center shadow-2xl overflow-hidden"
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 2 }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-12"
            />
          </div>

          {/* Crown icon with glow */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-2xl blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <Crown size={36} className="text-blue-400" />
              </motion.div>
            </div>
          </div>

          <h3 className="text-2xl font-black mb-3 relative">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {feature}
            </span>
          </h3>
          <p className="text-sm text-secondary mb-8 leading-relaxed max-w-sm mx-auto relative">
            {description || "This feature is available exclusively for Advanced plan users. Upgrade to unlock."}
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 mb-8 relative">
            {[
              { icon: Zap, label: "AI Analytics" },
              { icon: Shield, label: "Predictive AI" },
              { icon: Sparkles, label: "CFO Reports" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <item.icon size={18} className="text-blue-400" />
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <Link
            href="/pricing"
            className="relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-[1.03] shadow-[0_0_30px_rgba(79,70,229,0.4)] active:scale-[0.98] text-base group"
          >
            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
            Upgrade to Advanced
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-xs text-secondary mt-5 relative">
            Starting at <span className="font-bold text-foreground">$19.99/month</span> · Cancel anytime
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Animated PRO badge for sidebar
export function ProBadge() {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="ml-auto relative"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-[6px] opacity-50" />
      <span className="relative text-[8px] font-black bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-0.5">
        <Crown size={8} />
        PRO
      </span>
    </motion.span>
  );
}

// Upgrade nudge banner for dashboard
export function UpgradeNudge({ isPro }: { isPro: boolean }) {
  if (isPro) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-violet-500/5 p-4 flex items-center justify-between gap-4"
    >
      {/* Background shimmer */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear", repeatDelay: 3 }}
        className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent skew-x-12"
      />

      <div className="flex items-center gap-3 relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Crown size={18} className="text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-bold">Unlock Advanced Intelligence</p>
          <p className="text-xs text-secondary">Get CFO reports, predictive analytics & more</p>
        </div>
      </div>
      <Link
        href="/pricing"
        className="shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:scale-[1.03] transition-all shadow-lg shadow-blue-500/20 relative"
      >
        <Sparkles size={12} />
        Upgrade
      </Link>
    </motion.div>
  );
}

// Plan status indicator for header/profile
export function PlanBadge({ isPro }: { isPro: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
      isPro
        ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/20"
        : "bg-white/5 text-secondary border border-white/10"
    }`}>
      {isPro ? <Crown size={10} /> : <Lock size={10} />}
      {isPro ? "Advanced" : "Basic"}
    </span>
  );
}
