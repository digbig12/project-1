'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, ArrowRight, Loader2, Key, RefreshCw, Zap } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { requestPasswordReset } from './actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [captchaText, setCaptchaText] = useState('');
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [requestState, requestDispatch] = useActionState(requestPasswordReset, undefined);
  const router = useRouter();

  useEffect(() => {
    setCaptchaText(Math.random().toString(36).substring(2, 7).toUpperCase());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (requestState?.error) {
      setCaptchaText(Math.random().toString(36).substring(2, 7).toUpperCase());
    } else if (requestState?.success) {
      setTimeout(() => {
         router.push(`/reset-password?mockToken=${requestState.token}`);
      }, 5000);
    }
  }, [requestState, router]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const refreshCaptcha = () => {
    setCaptchaText(Math.random().toString(36).substring(2, 7).toUpperCase());
  };

  if (!mounted) return null;

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full flex items-center justify-center p-6 relative"
    >
      <div className="w-full max-w-md relative z-10 group/card">
        {/* Moving Spectral Border Effect */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-indigo-500 to-purple-600 rounded-[2.5rem] opacity-30 group-hover/card:opacity-100 transition-opacity duration-700 blur-[2px] animate-shimmer bg-[length:200%_auto] -z-10" />
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              rotateX: (mousePos.y - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2) / 60,
              rotateY: (mousePos.x - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2) / -60,
              transformStyle: "preserve-3d"
            }}
            className="bg-background/80 border border-white/10 backdrop-blur-3xl p-8 lg:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          {/* Header Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]">
               <div className="w-full h-full bg-background/80 rounded-[14px] flex items-center justify-center">
                 <Key className="text-primary" size={24} />
               </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-foreground tracking-tight leading-tight uppercase">
              Reset Access
            </h3>
            <p className="text-secondary mt-2 text-sm font-medium">
              Initialize secure recovery protocol.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!requestState?.success ? (
               <motion.form 
                 key="form" 
                 action={requestDispatch} 
                 className="space-y-6" 
                 initial={{ opacity: 0, scale: 0.95 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 exit={{ opacity: 0, scale: 0.95 }} 
                 transition={{ duration: 0.3 }}
                 suppressHydrationWarning
               >
                 <div className="space-y-2">
                   <label className="text-[10px] font-bold text-secondary uppercase tracking-widest px-1">Recovery Email</label>
                   <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors" size={18} />
                     <input 
                       key="forgot-email"
                       name="email"
                       type="email" 
                       onFocus={() => setIsInputFocused(true)}
                       onBlur={() => setIsInputFocused(false)}
                       placeholder="name@company.com" 
                       className="w-full bg-foreground/5 border border-border/50 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-foreground/10 transition-all text-sm font-medium" 
                       required
                       autoFocus
                     />
                   </div>
                 </div>

                 {/* Security CAPTCHA */}
                 <div className="space-y-3">
                   <div className="flex items-center justify-between px-1">
                     <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Verification</label>
                     <button type="button" onClick={refreshCaptcha} className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                       <RefreshCw size={12} />
                       Refresh
                     </button>
                   </div>
                   
                   <div className="flex gap-3">
                     <div className="flex-1 h-14 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden select-none">
                       <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb),0.1)_1px,transparent_1px)] bg-[size:4px_4px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000,transparent)] pointer-events-none" />
                       <span className="text-xl font-black tracking-widest text-white italic skew-x-[-12deg] drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] z-10">
                        {captchaText}
                       </span>
                       <input type="hidden" name="captchaExpected" value={captchaText} />
                     </div>
                     <div className="w-[120px] relative group">
                       <input 
                         key="forgot-captcha"
                         name="captcha"
                         type="text" 
                         placeholder="Code" 
                         className="w-full h-14 bg-foreground/5 border border-border/50 rounded-xl px-4 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-foreground/10 transition-all text-center font-bold tracking-widest uppercase text-sm" 
                         required
                       />
                     </div>
                   </div>
                 </div>

                 {requestState?.error && (
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold flex items-start gap-3">
                     <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                     <span className="leading-relaxed uppercase tracking-tight">{requestState.error}</span>
                   </motion.div>
                 )}

                 <SubmitButton />
               </motion.form>
            ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center py-4">
                   <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                     <ShieldCheck className="text-emerald-400 w-10 h-10" />
                   </div>
                   
                   <div className="space-y-3">
                     <h4 className="text-2xl font-black text-foreground tracking-tight uppercase">Protocol Initialized</h4>
                     <p className="text-xs text-secondary font-medium px-4">System has verified your identity. Secure recovery token generated below.</p>
                   </div>
                   
                   <div className="p-8 bg-white/[0.02] border border-primary/20 rounded-[2rem] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                      <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mb-4 relative">Recovery Token</p>
                      <p className="text-5xl font-black tracking-[0.3em] text-white relative drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">{requestState.token}</p>
                   </div>
                   
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-1 bg-foreground/5 rounded-full overflow-hidden">
                        <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-full h-full bg-primary" />
                      </div>
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Redirecting to reset terminal...</p>
                   </div>
                </motion.div>
            )}
          </AnimatePresence>
          
          {!requestState?.success && (
            <div className="mt-10 text-center">
              <Link href="/login" className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] hover:text-primary transition-all flex items-center justify-center gap-2 group">
                <ArrowRight size={12} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Authentication
              </Link>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full relative overflow-hidden bg-primary text-primary-foreground py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70 flex items-center justify-center group shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]`}
    >
      <div className="flex items-center justify-center gap-3 relative z-10">
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
        <span>{pending ? 'Processing...' : 'Authorize Recovery'}</span>
      </div>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
