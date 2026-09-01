'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { SaveProvider } from '@/lib/context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SaveProvider>
      <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans antialiased text-zinc-900">
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
    </SaveProvider>
  );
}
