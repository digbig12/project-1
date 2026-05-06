'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Fingerprint, 
  Zap, 
  Building2, 
  RotateCw, 
  MessageSquare, 
  Scan, 
  TrendingUp, 
  Calculator,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { authenticate, register } from './actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [captchaText, setCaptchaText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [password, setPassword] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [loginState, loginDispatch] = useActionState(authenticate, undefined);
  const [registerState, registerDispatch] = useActionState(register, undefined);
  const router = useRouter();

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const getSecurityColor = () => {
    if (password.length === 0) return 'rgba(var(--primary-rgb), 0.3)';
    if (password.length < 6) return 'rgba(239, 68, 68, 0.5)'; // Red
    if (password.length < 10) return 'rgba(245, 158, 11, 0.5)'; // Amber
    return 'rgba(16, 185, 129, 0.5)'; // Emerald
  };

  const showTwoFactor = loginState?.twoFactor;

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
  };

  const refreshCaptcha = () => {
    setIsRefreshing(true);
    generateCaptcha();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    setMounted(true);
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (loginState?.success && !loginState?.twoFactor) {
      router.push('/');
    }
    // Refresh captcha on error
    if (loginState?.error || registerState?.error) {
      generateCaptcha();
    }
  }, [loginState, registerState, router]);

  return (
    <div className="w-full h-full flex items-center justify-center p-6 relative">
      {/* Content wrapper handles the centered 3D card layout */}

      {mounted && (
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side: Holographic Branding Hub */}
        <div className="hidden lg:flex flex-col items-center justify-center relative min-h-[600px]">
          {/* Orbital Paths with Glow */}
          <div className="absolute w-[500px] h-[500px] border border-white/5 rounded-full shadow-[inset_0_0_80px_rgba(var(--primary-rgb),0.1)]" />
          <div className="absolute w-[350px] h-[350px] border border-white/10 rounded-full shadow-[inset_0_0_50px_rgba(var(--primary-rgb),0.1)]" />
          
          {/* Connective Neural Lines (SVG) with Moving Pulses */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible opacity-30">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(var(--primary-rgb), 0)" />
                <stop offset="50%" stopColor="rgba(var(--primary-rgb), 0.8)" />
                <stop offset="100%" stopColor="rgba(var(--primary-rgb), 0)" />
              </linearGradient>
            </defs>
            {/* Lines with Dash Animation for "Data Pulse" - Speed increases on focus */}
            <motion.line x1="50%" y1="50%" x2="20%" y2="15%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="10 20" animate={{ strokeDashoffset: [-100, 100] }} transition={{ duration: isInputFocused ? 1.5 : 4, repeat: Infinity, ease: "linear" }} />
            <motion.line x1="50%" y1="50%" x2="85%" y2="25%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="15 25" animate={{ strokeDashoffset: [100, -100] }} transition={{ duration: isInputFocused ? 2 : 5, repeat: Infinity, ease: "linear" }} />
            <motion.line x1="50%" y1="50%" x2="15%" y2="75%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="20 30" animate={{ strokeDashoffset: [-150, 150] }} transition={{ duration: isInputFocused ? 2.5 : 6, repeat: Infinity, ease: "linear" }} />
            <motion.line x1="50%" y1="50%" x2="80%" y2="85%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="25 35" animate={{ strokeDashoffset: [200, -200] }} transition={{ duration: isInputFocused ? 3 : 7, repeat: Infinity, ease: "linear" }} />
          </svg>

          {/* Holographic Scanline Effect */}
          <div className="absolute w-[300px] h-[600px] bg-gradient-to-b from-transparent via-primary/5 to-transparent -rotate-45 translate-y-[-100%] animate-scanline pointer-events-none" />

          {/* Central Logo with Advanced Glow & Rotating Rims */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20 group"
          >
            {/* Rotating Outer Rims */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border border-primary/20 border-dashed rounded-[4rem]"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-indigo-500/10 rounded-[3.5rem]"
            />

            <div className="w-52 h-52 rounded-[3.5rem] bg-gradient-to-br from-primary via-indigo-500 to-purple-600 p-[2px] shadow-[0_0_80px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_100px_rgba(var(--primary-rgb),0.5)] transition-all duration-700 relative">
              <div className="w-full h-full bg-[#050505]/95 backdrop-blur-2xl rounded-[3.4rem] flex items-center justify-center overflow-hidden border border-white/10 relative">
                <img src="/logo.png" alt="BizAnalytics" className="w-36 h-36 object-contain drop-shadow-[0_0_25px_rgba(var(--primary-rgb),0.8)] relative z-10" />
                {/* Internal Reflections */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
              </div>
            </div>
            
            {/* Outer Atmospheric Glow */}
            <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full -z-10 animate-pulse-slow" />
          </motion.div>

          {/* Orbital Feature Bubbles - Main & Advanced BizAnalytics Features */}
          <FeatureNode 
            icon={<MessageSquare size={18} />} 
            label="AI Advisor" 
            sub="Neural Insights"
            delay={0.1}
            position="top-[2%] left-[2%]"
            orbitDelay={0}
            path={{ x: [0, 40, 0, -40, 0], y: [0, -30, 0, 30, 0] }}
          />
          <FeatureNode 
            icon={<Scan size={18} />} 
            label="Neural OCR" 
            sub="Smart Scanning"
            delay={0.3}
            position="top-[10%] right-[-15%]"
            orbitDelay={2.5}
            path={{ x: [0, -35, 0, 35, 0], y: [0, 40, 0, -40, 0] }}
          />
          <FeatureNode 
            icon={<TrendingUp size={18} />} 
            label="Predictive" 
            sub="Cashflow Analysis"
            delay={0.5}
            position="bottom-[25%] left-[-20%]"
            orbitDelay={5}
            path={{ x: [30, 0, -30, 0, 30], y: [-45, 0, 45, 0, -45] }}
          />
          <FeatureNode 
            icon={<Calculator size={18} />} 
            label="Auto Tax" 
            sub="Compliance AI"
            delay={0.7}
            position="bottom-[-10%] right-[-5%]"
            orbitDelay={1.5}
            path={{ x: [-40, 0, 40, 0, -40], y: [30, 0, -30, 0, 30] }}
          />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-24 text-center relative"
          >
            <h2 className="text-6xl font-black text-white tracking-tighter uppercase mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] bg-gradient-to-r from-white via-primary/50 to-white bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent">
              BizAnalytics
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
              <p className="text-primary font-black tracking-[0.4em] text-[10px] uppercase">Advanced AI Intelligence</p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
            </div>
          </motion.div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="w-full max-w-md mx-auto relative group/card">
          {/* Moving Spectral Border Effect - Dynamic Security Energy */}
          <div 
            className="absolute -inset-[1px] rounded-[2.5rem] opacity-40 group-hover/card:opacity-100 transition-all duration-700 blur-[2px] animate-shimmer bg-[length:200%_auto] -z-10"
            style={{ background: getSecurityColor() }}
          />
          
          <motion.div 
              style={{
                rotateX: (mousePos.y - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2) / 60,
                rotateY: (mousePos.x - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2) / -60,
                transformStyle: "preserve-3d"
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-background/80 border border-white/10 backdrop-blur-3xl p-8 lg:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
          >
            {/* Form Header (Visible on Mobile) */}
            <div className="lg:hidden flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] mb-4">
                 <div className="w-full h-full bg-background/80 rounded-[14px] flex items-center justify-center">
                   <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                 </div>
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">BizAnalytics</h1>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-foreground tracking-tight leading-tight">
                {showTwoFactor ? 'Verify Identity' : (mode === 'login' ? 'Welcome Back' : 'Join System')}
              </h3>
              <p className="text-secondary mt-2 text-sm font-medium">
                {showTwoFactor ? 'Enter your verification code.' : (mode === 'login' ? 'Authentication required.' : 'Initialize your business profile.')}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={`${mode}-${showTwoFactor}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                suppressHydrationWarning
              >
                <form 
                  action={mode === 'login' ? loginDispatch : registerDispatch} 
                  className="space-y-5"
                  suppressHydrationWarning
                >
                  {showTwoFactor ? (
                    <div className="space-y-4">
                      <input type="hidden" name="email" value={loginState?.email || ''} />
                      <input type="hidden" name="password" value={loginState?.password || ''} />
                      
                      <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-3">
                        <Zap size={16} />
                        <p>{loginState?.message}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest px-1">Access Token</label>
                        <div className="relative group" suppressHydrationWarning>
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors" size={18} />
                          <input key="input-code" name="code" onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)} suppressHydrationWarning type="text" placeholder="000000" maxLength={6} className="w-full bg-foreground/5 border border-border/50 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-foreground/10 transition-all text-xl font-black tracking-[0.5em] text-center" required autoFocus />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {mode === 'register' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-secondary uppercase tracking-widest px-1">Full Name</label>
                          <div className="relative group" suppressHydrationWarning>
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors" size={18} />
                            <input key="input-name" name="name" onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)} suppressHydrationWarning type="text" placeholder="John Doe" className="w-full bg-foreground/5 border border-border/50 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-foreground/10 transition-all text-sm font-medium" required />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest px-1">Email ID</label>
                        <div className="relative group" suppressHydrationWarning>
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors" size={18} />
                          <input key="input-email" name="email" onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)} suppressHydrationWarning type="email" placeholder="name@company.com" className="w-full bg-foreground/5 border border-border/50 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-foreground/10 transition-all text-sm font-medium" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest px-1">Secret Key</label>
                        <div className="relative group" suppressHydrationWarning>
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors" size={18} />
                          <input key="input-password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)} suppressHydrationWarning type="password" placeholder="••••••••" className="w-full bg-foreground/5 border border-border/50 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-foreground/10 transition-all text-sm font-medium" required />
                        </div>
                      </div>
                      {mode === 'register' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-secondary uppercase tracking-widest px-1">Organization</label>
                          <div className="relative group" suppressHydrationWarning>
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors" size={18} />
                            <input key="input-company" name="companyName" onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)} suppressHydrationWarning type="text" placeholder="Company Ltd." className="w-full bg-foreground/5 border border-border/50 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-foreground/10 transition-all text-sm font-medium" />
                          </div>
                        </div>
                      )}

                        {/* CAPTCHA Section */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Security Verification</label>
                            <button type="button" onClick={refreshCaptcha} className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                              Refresh
                            </button>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="flex-1 h-14 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden select-none group" suppressHydrationWarning>
                              {/* Tactical Grid Overlay */}
                              <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb),0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb),0.1)_1px,transparent_1px)] bg-[size:4px_4px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000,transparent)] pointer-events-none" />
                              <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
                              <div className="absolute inset-0 flex items-center justify-around px-4 pointer-events-none opacity-20">
                                {[...Array(6)].map((_, i) => (
                                  <div key={i} className="w-px h-full bg-primary/40 rotate-[25deg]" />
                                ))}
                              </div>
                              <span className="text-2xl font-black tracking-[0.3em] text-white italic skew-x-[-12deg] drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] z-10">
                                {mounted ? captchaText : ''}
                              </span>
                              <input type="hidden" name="captchaExpected" value={captchaText} />
                            </div>
                            
                            <div className="w-[120px] relative group" suppressHydrationWarning>
                              <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors" size={16} />
                              <input name="captcha" suppressHydrationWarning type="text" placeholder="Code" maxLength={6} className="w-full h-14 bg-foreground/5 border border-border/50 rounded-xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-foreground/10 transition-all text-center font-bold tracking-widest uppercase text-sm" required />
                            </div>
                          </div>
                        </div>
                    </>
                  )}

                  {(loginState?.error || registerState?.error) && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-start gap-3">
                      <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                      <span>{loginState?.error || registerState?.error}</span>
                    </motion.div>
                  )}

                  <SubmitButton mode={mode} isTwoFactor={!!showTwoFactor} />
                </form>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-border/50 flex flex-col gap-4">
              {!showTwoFactor && (
                <button 
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-xs font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors"
                  suppressHydrationWarning
                >
                  {mode === 'login' ? "Don't have an account? Register" : "Already registered? Sign In"}
                </button>
              )}
              <Link href="/forgot-password" className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest hover:text-foreground transition-colors self-center">
                Forgot Security Credentials?
              </Link>
            </div>
          </motion.div>
        </div>
        </div>
      )}
    </div>
  );
}

function FeatureNode({ icon, label, sub, delay, position, orbitDelay, path }: { icon: React.ReactNode, label: string, sub: string, delay: number, position: string, orbitDelay: number, path: { x: number[], y: number[] } }) {
  const [isPopped, setIsPopped] = useState(false);
  const [isShivering, setIsShivering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePop = () => {
    if (isPopped) return;
    setIsShivering(true);
    // Tiny shiver before the burst
    setTimeout(() => {
      setIsPopped(true);
      setIsShivering(false);
      setTimeout(() => setIsPopped(false), 3000);
    }, 50);
  };

  return (
    <div className={`absolute ${position} z-30 cursor-pointer`} onClick={handlePop}>
      <AnimatePresence mode="wait">
        {!isPopped ? (
          <motion.div 
            key="bubble"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: isShivering ? 1.1 : 1,
              x: isShivering ? [0, -2, 2, -2, 0] : 0
            }}
            exit={{ scale: 1.4, opacity: 0, transition: { duration: 0.1 } }}
            transition={{ 
              default: { delay: isShivering ? 0 : delay, type: "spring", stiffness: 100, damping: 15 },
              x: { duration: 0.1, repeat: isShivering ? 2 : 0, ease: "linear" }
            }}
          >
            <motion.div
              animate={{ 
                x: path.x,
                y: path.y,
                scale: [1, 1.05, 0.98, 1.02, 1],
                borderRadius: ["50% 50% 50% 50%", "45% 55% 48% 52%", "55% 45% 52% 48%", "50% 50% 50% 50%"]
              }}
              transition={{ 
                duration: 12, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: orbitDelay 
              }}
              className="relative group/bubble flex flex-col items-center justify-center gap-2"
            >
              <div className="w-32 h-32 rounded-full bg-primary/5 backdrop-blur-3xl border border-white/20 flex flex-col items-center justify-center p-3 shadow-[0_15px_50px_rgba(var(--primary-rgb),0.25)] group-hover/bubble:border-primary/50 transition-all duration-500 relative overflow-hidden">
                {/* Oily Surface Refraction */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(var(--primary-rgb),0.1),#818cf810,#c084fc10,transparent)] opacity-60"
                />
                <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full pointer-events-none z-10" />
                
                {/* Internal Refractive Glow */}
                <div className="absolute inset-4 rounded-full bg-primary/5 blur-2xl animate-pulse-slow" />
                
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2 border border-primary/20 shadow-inner z-20">
                  {React.cloneElement(icon as React.ReactElement, { size: 18 })}
                </div>
                <span className="text-[11px] font-black uppercase tracking-tighter text-white text-center px-2 leading-tight z-20 drop-shadow-md">{label}</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-secondary opacity-60 text-center z-20">{sub}</span>
              </div>
              <div className="w-16 h-3 bg-black/40 blur-lg rounded-full mt-2" />
            </motion.div>
          </motion.div>
        ) : (
          <div key="pop" className="relative flex items-center justify-center w-32 h-32">
             {/* Optical Lens Flare Impact */}
             <motion.div 
               initial={{ scale: 0, opacity: 1 }}
               animate={{ scale: [0, 4, 0], opacity: [0, 1, 0] }}
               transition={{ duration: 0.3 }}
               className="absolute w-20 h-1 bg-white blur-xl z-50 rotate-45"
             />
             <motion.div 
               initial={{ scale: 0, opacity: 1 }}
               animate={{ scale: [0, 4, 0], opacity: [0, 1, 0] }}
               transition={{ duration: 0.3 }}
               className="absolute w-1 h-20 bg-white blur-xl z-50 rotate-45"
             />

             {/* Chromatic Aberration Rings */}
             <motion.div 
               initial={{ scale: 0.8, opacity: 0.5 }}
               animate={{ scale: 2.5, opacity: 0 }}
               transition={{ duration: 0.4 }}
               className="absolute inset-0 rounded-full border-2 border-red-500/50 blur-[1px]"
             />
             <motion.div 
               initial={{ scale: 0.8, opacity: 0.5 }}
               animate={{ scale: 2.3, opacity: 0 }}
               transition={{ duration: 0.4, delay: 0.05 }}
               className="absolute inset-0 rounded-full border-2 border-blue-500/50 blur-[1px]"
             />

             {/* Character Shatter System */}
             {isMounted && label.split('').map((char, index) => (
               <motion.span
                 key={index}
                 initial={{ x: 0, y: 0, opacity: 1 }}
                 animate={{ 
                   x: (Math.random() - 0.5) * 150,
                   y: (Math.random() - 0.5) * 150 + 50,
                   rotate: (Math.random() - 0.5) * 720,
                   opacity: 0
                 }}
                 transition={{ duration: 0.6, ease: "easeOut" }}
                 className="absolute text-[10px] font-black text-white pointer-events-none"
               >
                 {char}
               </motion.span>
             ))}

             {/* Icon Burst */}
             <motion.div
               initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
               animate={{ x: -60, y: -80, opacity: 0, rotate: -180, scale: 0 }}
               transition={{ duration: 0.5, ease: "easeOut" }}
               className="absolute text-primary"
             >
               {icon}
             </motion.div>

             {/* Physics-Based Particle System (Air Resistance & Gravity) */}
             {isMounted && [...Array(32)].map((_, i) => {
               const angle = (i * (Math.PI * 2)) / 32;
               const speed = 80 + Math.random() * 100;
               return (
                 <motion.div
                   key={i}
                   initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                   animate={{ 
                     x: [0, Math.cos(angle) * speed * 0.8, Math.cos(angle) * speed],
                     y: [0, Math.sin(angle) * speed * 0.8, (Math.sin(angle) * speed) + 60],
                     opacity: [1, 0.8, 0],
                     scale: [1, 0.5, 0]
                   }}
                   transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                   className={`absolute ${i % 4 === 0 ? 'w-2 h-2' : 'w-1 h-1'} bg-primary rounded-full blur-[0.5px]`}
                 />
               );
             })}

             {/* Final Rainbow Fade */}
             <motion.div 
               initial={{ scale: 0.8, opacity: 1, border: "4px solid white" }}
               animate={{ scale: 3, opacity: 0, borderWidth: "0px" }}
               transition={{ duration: 0.4 }}
               className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-white/20 to-transparent blur-md"
             />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubmitButton({ mode, isTwoFactor }: { mode: 'login' | 'register', isTwoFactor: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full h-16 relative overflow-hidden bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center group shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] mt-4"
      suppressHydrationWarning
    >
      {/* Background Glow on Hover */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center justify-center gap-4 relative z-10">
        {pending ? <Loader2 size={20} className="animate-spin" /> : (isTwoFactor ? <Fingerprint size={20} /> : <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />)}
        <span>{pending ? 'Processing...' : (isTwoFactor ? 'Verify' : (mode === 'login' ? 'Access System' : 'Create Profile'))}</span>
      </div>
    </button>
  );
}
