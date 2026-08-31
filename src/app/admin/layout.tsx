'use client';

import React from 'react';
import { SaveProvider } from '@/lib/context';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SaveProvider>
      <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans antialiased text-zinc-900">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopNav />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
            {children}
          </main>
        </div>
      </div>
    </SaveProvider>
  );
}
