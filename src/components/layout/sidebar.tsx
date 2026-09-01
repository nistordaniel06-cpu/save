'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PieChart, 
  Sparkles, 
  FileText, 
  FileCheck, 
  ArrowRightLeft, 
  ShieldCheck, 
  Building2, 
  ChevronDown, 
  RotateCcw,
  Plus,
  Zap,
  Users,
  X
} from 'lucide-react';
import { useSave } from '@/lib/context';
import { calculateSaveScore } from '@/lib/analytics/savings-calculator';
import { clsx } from 'clsx';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentOrg, contracts, opportunities, spendRecords, resetToDemo, organizations, switchOrganization } = useSave();
  const [orgDropdownOpen, setOrgDropdownOpen] = React.useState(false);

  const totalCalculatedSpend = spendRecords.reduce((sum, s) => sum + s.amount, 0);
  const totalAnnualSpend = totalCalculatedSpend > 0 
    ? totalCalculatedSpend * (spendRecords.length >= 6 ? 2 : 12) 
    : (currentOrg.isDemo ? 428500 : 0);

  const isDemo = pathname.startsWith('/demo') || currentOrg.isDemo;
  const basePath = pathname.startsWith('/demo') ? '/demo' : '/dashboard';

  const saveScoreData = calculateSaveScore(totalAnnualSpend, contracts, opportunities);

  const navItems = [
    {
      label: 'Prezentare Generală',
      href: basePath,
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      label: 'Putere de Cumpărare',
      href: `${basePath}/demand`,
      icon: Users,
      badge: 'Demand Pools',
      badgeVariant: 'purple' as const,
    },
    {
      label: 'Analiză Cheltuieli',
      href: `${basePath}/spend`,
      icon: PieChart,
      badge: totalAnnualSpend > 0 ? `${Math.round(totalAnnualSpend / 1000)}k lei` : undefined,
    },
    {
      label: 'Oportunități Economii',
      href: `${basePath}/opportunities`,
      icon: Sparkles,
      badge: `${opportunities.filter((o) => o.status === 'open').length}`,
      badgeVariant: 'warning' as const,
    },
    {
      label: 'Documente & Extracție',
      href: `${basePath}/documents`,
      icon: FileText,
      badge: undefined,
    },
    {
      label: 'Contracte & Reînnoiri',
      href: `${basePath}/contracts`,
      icon: FileCheck,
      badge: `${contracts.filter((c) => c.status === 'in_renewal_window').length} active`,
      badgeVariant: 'danger' as const,
    },
    {
      label: 'Cereri Optimizare',
      href: `${basePath}/requests`,
      icon: ArrowRightLeft,
      badge: undefined,
    },
    {
      label: 'Profil & RO e-Factura',
      href: '/settings/company',
      icon: Building2,
      badge: currentOrg.roEfacturaStatus || currentOrg.efacturaConnection?.status === 'connected' ? 'e-Factura' : undefined,
      badgeVariant: 'purple' as const,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 pb-4 border-b border-zinc-800/80 flex items-center justify-between">
        <Link href="/" onClick={onClose} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-lg tracking-tighter shadow-md shadow-emerald-500/20 group-hover:bg-emerald-400 transition-colors">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-base">SAVE</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono font-medium border border-zinc-700">
                B2B
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Procurement Intel</p>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Închide meniul"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Organization Switcher */}
      <div className="px-3 py-3 border-b border-zinc-800/60 relative">
        <button
          onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-100 truncate" suppressHydrationWarning>{currentOrg.name}</p>
              <p className="text-[10px] text-zinc-400 font-mono truncate" suppressHydrationWarning>{currentOrg.cui || 'Fără CIF'}</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
        </button>

        {orgDropdownOpen && (
          <div className="absolute top-14 left-3 right-3 z-30 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl p-1.5 space-y-1">
            <div className="px-2 py-1 text-[10px] font-mono uppercase text-zinc-400">Organizații Active</div>
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  switchOrganization(org.id);
                  setOrgDropdownOpen(false);
                }}
                className={clsx(
                  'w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors',
                  currentOrg.id === org.id
                    ? 'bg-emerald-500/10 text-emerald-300 font-medium border border-emerald-500/20'
                    : 'text-zinc-300 hover:bg-zinc-800'
                )}
              >
                <span className="truncate">{org.name}</span>
                {org.isDemo && <Badge variant="subtle" size="sm">Demo</Badge>}
              </button>
            ))}
            <div className="border-t border-zinc-800 pt-1 mt-1">
              <Link
                href="/onboarding"
                onClick={() => setOrgDropdownOpen(false)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-400" />
                <span>Adaugă Organizație Nouă</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
          Meniu Principal
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
                isActive
                  ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={clsx(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-300'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={clsx(
                    'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold',
                    item.badgeVariant === 'danger'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.badgeVariant === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
          Administrare & Sistem
        </div>

        <Link
          href="/admin"
          onClick={onClose}
          className={clsx(
            'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
            pathname === '/admin'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
          )}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span>Panou Administrator</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Internal
          </span>
        </Link>
      </div>

      {/* SAVE Score Quick Widget */}
      <div className="p-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-zinc-200">SAVE Score</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {saveScoreData.totalScore}/100
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden mb-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${saveScoreData.totalScore}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight line-clamp-2">
            Grad {saveScoreData.grade}: {saveScoreData.headline}
          </p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        {isDemo ? (
          <>
            <button
              onClick={resetToDemo}
              title="Reîncarcă datele demo Nova Retail SRL"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer text-[11px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Reset Demo</span>
            </button>
            <Link
              href="/"
              className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
            >
              Ieși din demo →
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Supabase Sync</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">RLS Protejat</span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-zinc-950 text-zinc-300 flex-col h-screen border-r border-zinc-800 shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Slide-out */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xs"
            onClick={onClose}
          />
          {/* Drawer Panel */}
          <aside className="relative z-50 w-72 max-w-[85vw] bg-zinc-950 text-zinc-300 flex flex-col h-full border-r border-zinc-800 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
