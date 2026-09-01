'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Upload, 
  Shield, 
  RotateCcw,
  LogOut,
  Menu,
  CheckCircle2,
  Building2,
  ChevronDown,
  Plus
} from 'lucide-react';
import { useSave } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Dropzone } from '@/components/documents/dropzone';

interface TopNavProps {
  onOpenMobileMenu?: () => void;
}

export function TopNav({ onOpenMobileMenu }: TopNavProps) {
  const { currentOrg, currentUser, resetToDemo, supabaseUser, signOut, isDemoMode, organizations, switchOrganization } = useSave();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showDemoToast, setShowDemoToast] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const isDemo = Boolean(isDemoMode || currentOrg.isDemo);

  const handleResetDemo = () => {
    resetToDemo();
    setShowDemoToast(true);
    setTimeout(() => setShowDemoToast(false), 3000);
  };

  return (
    <>
      <header className="h-16 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Mobile hamburger & Organization context */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 -ml-1 rounded-xl text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Deschide meniul lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Multi-Company Dropdown Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors text-left cursor-pointer border border-transparent hover:border-zinc-200"
            >
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate max-w-[130px] sm:max-w-[200px]">
                <span className="font-semibold text-zinc-900 text-xs sm:text-sm tracking-tight block truncate" suppressHydrationWarning>
                  {currentOrg.name || 'Organizație'}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono block truncate" suppressHydrationWarning>
                  {currentOrg.cui || 'Fără CUI'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-zinc-200 py-2 z-50 animate-in fade-in">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Compania Activă
                </div>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrganization(org.id);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-zinc-50 cursor-pointer ${
                      org.id === currentOrg.id ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-zinc-700'
                    }`}
                  >
                    <div className="truncate">
                      <p className="truncate">{org.name}</p>
                      <p className="text-[10px] font-mono text-zinc-400">{org.cui || 'Fără CUI'}</p>
                    </div>
                    {org.id === currentOrg.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                ))}
                <div className="border-t border-zinc-100 mt-1 pt-1 px-2">
                  <Link
                    href="/settings/company"
                    onClick={() => setIsOrgDropdownOpen(false)}
                    className="w-full px-2 py-1.5 text-xs text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg flex items-center gap-1.5 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adaugă Firmă Nouă în Grup</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions, Quick Upload, and User Nav */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {isDemo ? (
            <>
              {/* Reset Demo Trigger */}
              <button
                onClick={handleResetDemo}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors border border-zinc-200 cursor-pointer"
                title="Reinițializează starea demo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>

              <Link href="/auth/register">
                <Button size="sm" variant="emerald" className="text-xs font-semibold">
                  Creează cont real
                </Button>
              </Link>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>GDPR & RLS Activ</span>
            </div>
          )}

          {/* Quick Upload CTA */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsUploadOpen(true)}
            className="gap-1.5 px-2.5 sm:px-3 text-xs"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Încarcă Document</span>
            <span className="sm:hidden">Încarcă</span>
          </Button>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-zinc-200">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold text-xs border border-zinc-800">
              {(currentUser?.fullName || 'Utilizator').split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-zinc-900 leading-tight" suppressHydrationWarning>{currentUser?.fullName || 'Utilizator'}</p>
              <p className="text-[10px] text-zinc-500 font-mono leading-none" suppressHydrationWarning>{currentUser?.role || 'Owner'}</p>
            </div>
            {supabaseUser && (
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                title="Deconectare cont Supabase"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Încarcă Factură sau Contract"
        description="Trage documentele sau selectează fișiere PDF, JPG, PNG pentru extracție structurată instantanee."
        maxWidth="lg"
      >
        <Dropzone onUploadComplete={() => setIsUploadOpen(false)} />
      </Modal>

      {/* Demo Reset Toast */}
      {showDemoToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium border border-zinc-800 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Datele demonstrative Nova Retail SRL au fost reîncărcate cu succes!</span>
        </div>
      )}
    </>
  );
}
