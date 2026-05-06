'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BackgroundEffectsProps {
  intensity?: 'high' | 'subtle';
  showHUD?: boolean;
}

export function BackgroundEffects({ intensity = 'high', showHUD = false }: BackgroundEffectsProps) {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background" suppressHydrationWarning>
      {/* Neural Flashlight */}
      <div 
        className="absolute inset-0 z-0 opacity-40 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(${intensity === 'high' ? '800px' : '1200px'} circle at ${mousePos.x}px ${mousePos.y}px, rgba(var(--primary-rgb), ${intensity === 'high' ? '0.15' : '0.08'}), transparent 80%)`
        }}
      />

      {/* Atmospheric Depth Fog */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-background via-background/80 to-transparent z-10 opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent z-10 opacity-80" />

      {/* Dynamic Data Particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(intensity === 'high' ? 20 : 10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%", 
              opacity: Math.random() * 0.3 
            }}
            animate={{ 
              y: ["-10%", "110%"], 
              opacity: [0, 0.3, 0] 
            }}
            transition={{ 
              duration: 20 + Math.random() * 30, 
              repeat: Infinity, 
              ease: "linear", 
              delay: Math.random() * -30 
            }}
            className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* Tactical Grid Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" 
      />

      {/* HUD Metadata Overlay */}
      {showHUD && (
        <>
          <div className="absolute top-8 left-8 z-50 flex flex-col gap-1 font-mono text-[8px] text-primary/40 uppercase tracking-[0.2em] hidden lg:flex">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-primary/40 rounded-full animate-pulse" /> 
              SYSTEM: {intensity === 'high' ? 'AUTHENTICATION_GATE' : 'OPERATIONAL'}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-primary/40 rounded-full" /> 
              SECURE_LINK: ACTIVE
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-primary/40 rounded-full" /> 
              ENCRYPTION: AES-256
            </div>
          </div>
          <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-1 font-mono text-[8px] text-primary/40 uppercase tracking-[0.2em] text-right hidden lg:flex">
            <div>CORE_LOAD: 14%</div>
            <div>LATENCY: 12ms</div>
            <div>UPTIME: 99.9%</div>
          </div>
        </>
      )}

      {/* Edge Scanlines (Premium Detail) */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />
    </div>
  );
}
