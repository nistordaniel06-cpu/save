'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Briefcase, 
  FileText, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SaveProvider } from '@/lib/context';

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: '/supplier', label: 'Panou Principal', icon: Briefcase },
    { href: '/supplier/opportunities', label: 'Oportunități Agregate', icon: TrendingUp },
    { href: '/supplier/bids', label: 'Ofertele Mele Depuse', icon: FileText },
  ];

  return (
    <SaveProvider>
      <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Supplier Top Navigation */}
      <header className="bg-zinc-950 text-zinc-100 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/supplier" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                S
              </div>
              <span className="font-bold text-white tracking-tight text-base">SAVE Supplier Network</span>
              <Badge variant="purple" size="sm" className="hidden sm:inline-flex">Portal Parteneri</Badge>
            </Link>

            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-zinc-800">
              {links.map((l) => {
                const Icon = l.icon;
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                      active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{l.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protecție Confidențialitate Activă (Min. 3 companii/pool)</span>
            </div>

            <Link
              href="/dashboard"
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal Client</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      </div>
    </SaveProvider>
  );
}
