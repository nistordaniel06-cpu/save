'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { SaveProvider, useSave } from '@/lib/context';
import { supabase } from '@/lib/supabase/client';

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isHydrated, currentOrg, organizations, supabaseUser } = useSave();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    let isMounted = true;

    async function checkAuthAndOrg() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user && !supabaseUser) {
          router.replace('/auth/login');
          return;
        }

        const activeUser = user || supabaseUser;

        // Check if user has real organizations in state
        const realOrgs = organizations.filter((o) => !o.isDemo && o.id);
        if (realOrgs.length > 0 || (currentOrg && !currentOrg.isDemo && currentOrg.id)) {
          if (isMounted) setIsAuthorized(true);
          return;
        }

        // Query Supabase directly to verify organization membership
        const { data: members } = await supabase
          .from('organization_members')
          .select('organization_id, organizations(*)')
          .eq('user_id', activeUser.id);

        const realDbOrgs = (members || []).filter((m: any) => m.organizations && !m.organizations.is_demo);

        if (realDbOrgs.length === 0) {
          router.replace('/onboarding');
          return;
        }

        if (isMounted) setIsAuthorized(true);
      } catch (err) {
        console.error('Auth verification notice:', err);
        router.replace('/auth/login');
      }
    }

    checkAuthAndOrg();

    return () => {
      isMounted = false;
    };
  }, [isHydrated, currentOrg, organizations, supabaseUser, router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-xl tracking-tighter shadow-md animate-pulse">
            S
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Securizare sesiune & încărcare date...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <DashboardGuard>
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
    </DashboardGuard>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SaveProvider isDemoMode={false}>
      <DashboardInner>{children}</DashboardInner>
    </SaveProvider>
  );
}
