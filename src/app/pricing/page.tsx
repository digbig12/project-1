"use client";

import { motion } from "framer-motion";
import { Check, Zap, Shield, Crown } from "lucide-react";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { GlassCard } from "@/components/GlassCard";
import { useState } from "react";
import { createCheckoutSession } from "@/actions/stripe";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_advanced_1999";
      const { url, error } = await createCheckoutSession(priceId);
      
      if (error) {
        console.error(error);
      } else if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="max-w-6xl mx-auto px-6 py-16 pt-32">
        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600 mb-6 tracking-tight">
              Upgrade Your Business Intelligence
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Unlock the full power of BizAnalytics with our Advanced AI capabilities, designed to act as your autonomous CFO.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto relative z-10">
          {/* Basic Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className="h-full border border-slate-800/50 hover:border-slate-700/50 transition-colors p-8 flex flex-col">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">BizAnalytics Basic</h3>
                <p className="text-slate-400 mb-6">For individuals and small setups.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-slate-400">/mo</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                {[
                  "Standard financial dashboards",
                  "Basic AI insights",
                  "Limited OCR receipt scanning (50/mo)",
                  "Standard AI Chat model",
                  "Community support"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button disabled className="w-full py-4 px-6 rounded-xl bg-slate-800 text-slate-300 font-medium cursor-not-allowed">
                Current Plan
              </button>
            </GlassCard>
          </motion.div>

          {/* Advanced Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative h-full">
              {/* Glow Effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[25px] blur-[2px] opacity-50"></div>
              
              <GlassCard className="relative h-full border border-blue-500/30 bg-slate-900/80 p-8 flex flex-col">
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>

                <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                    <Crown className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">BizAnalytics Advanced</h3>
                  <p className="text-slate-400 mb-6">For power users who need CFO-level insights.</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">$19.99</span>
                    <span className="text-slate-400">/mo</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  {[
                    "Access to Advanced CFO AI Models",
                    "Predictive financial forecasting",
                    "Unlimited OCR receipt scanning",
                    "Priority AI processing speed",
                    "Custom AI Persona Tones",
                    "Export reports to PDF & CSV"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-indigo-400" />
                      <span className="text-slate-200">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Preparing Checkout..." : "Upgrade to Advanced"}
                </button>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
