'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  PieChart, 
  Sparkles, 
  FileText 
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSave } from '@/lib/context';

export function BottomNav() {
  const pathname = usePathname();
  const { opportunities } = useSave();
  const openOppsCount = opportunities.filter((o) => o.status === 'open').length;

  const basePath = pathname?.startsWith('/demo') ? '/demo' : '/dashboard';

  const items = [
    {
      label: 'Tablou',
      href: basePath,
      icon: LayoutDashboard,
    },
    {
      label: 'Pools',
      href: `${basePath}/demand`,
      icon: Users,
    },
    {
      label: 'Cheltuieli',
      href: `${basePath}/spend`,
      icon: PieChart,
    },
    {
      label: 'Economii',
      href: `${basePath}/opportunities`,
      icon: Sparkles,
      badge: openOppsCount > 0 ? openOppsCount : undefined,
    },
    {
      label: 'Documente',
      href: `${basePath}/documents`,
      icon: FileText,
    },
  ];

  return (
    <nav 
      aria-label="Navigare Mobilă" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
    >
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== basePath && pathname?.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative select-none touch-manipulation',
              isActive
                ? 'text-emerald-400 font-bold bg-zinc-900/60'
                : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            <div className="relative">
              <Icon className={clsx('w-5 h-5 transition-transform', isActive && 'scale-110')} />
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-amber-500 text-zinc-950 font-bold text-[9px] rounded-full flex items-center justify-center border-2 border-zinc-950">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
