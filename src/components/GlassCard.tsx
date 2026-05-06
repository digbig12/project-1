'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverGlow?: boolean;
}

export const GlassCard = ({ children, className, delay = 0, hoverGlow = false, ...props }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(
        'glass-card group/card relative overflow-hidden',
        hoverGlow && 'hover:shadow-[0_0_40px_-10px_var(--primary)]',
        className
      )}
      {...props}
    >
      {/* Subtle animated border gradient on hover */}
      <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-[-1px] rounded-[inherit] bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] p-[1px]" />
      </div>
      {children}
    </motion.div>
  );
};
