'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { SaveProvider } from '@/lib/context';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function DemoLayoutInner({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans antialiased text-zinc-900 flex-col">
      {/* Persistent Demo Banner */}
      <div className="bg-amber-400 text-zinc-950 text-xs py-2 px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 font-medium shadow-xs border-b border-amber-500/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-950 animate-pulse" />
          <span>
            <strong>Mod Demonstrativ:</strong> Date simulate de achiziții pentru <strong>Nova Retail SRL</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/auth/register">
            <Button size="sm" variant="primary" className="h-7 text-[11px] px-2.5 bg-zinc-950 hover:bg-zinc-800 text-white gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Creează organizația ta</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
          <Link href="/" className="text-zinc-900 hover:text-zinc-950 underline font-semibold text-[11px] hidden sm:inline">
            Ieși din demo
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop & Mobile Slide-out Sidebar */}
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopNav onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 pb-24 md:pb-8">
            {children}
          </main>
        </div>

        {/* Mobile Thumb Navigation Bar */}
        <BottomNav />
      </div>
    </div>
  );
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <SaveProvider isDemoMode={true}>
      <DemoLayoutInner>{children}</DemoLayoutInner>
    </SaveProvider>
  );
}
