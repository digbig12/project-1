'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { BackgroundEffects } from './BackgroundEffects';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Conditionally hide the sidebar on auth-related pages
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';

  if (isAuthPage) {
    return (
      <main className="w-full h-screen overflow-hidden m-0 p-0 relative">
        <BackgroundEffects intensity="high" showHUD={true} />
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-foreground relative">
      <BackgroundEffects intensity="subtle" showHUD={true} />
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto p-8 lg:p-12 scroll-smooth custom-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}
