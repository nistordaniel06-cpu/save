'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Upload, 
  Shield, 
  HelpCircle, 
  RotateCcw,
  Sparkles,
  FileCheck,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { useSave } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Dropzone } from '@/components/documents/dropzone';

export function TopNav() {
  const { currentOrg, currentUser, resetToDemo, supabaseUser, signOut } = useSave();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showDemoToast, setShowDemoToast] = useState(false);

  const handleResetDemo = () => {
    resetToDemo();
    setShowDemoToast(true);
    setTimeout(() => setShowDemoToast(false), 3000);
  };

  return (
    <>
      <header className="h-16 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Organization context & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 text-sm tracking-tight" suppressHydrationWarning>
              {currentOrg.name}
            </span>
            {currentOrg.isDemo && (
              <Badge variant="subtle" size="sm">
                Organizație Demo
              </Badge>
            )}
          </div>
          <span className="text-zinc-300">/</span>
          <span className="text-xs text-zinc-500 font-mono" suppressHydrationWarning>
            {currentOrg.industry}
          </span>
        </div>

        {/* Right: Actions, Quick Upload, and User Nav */}
        <div className="flex items-center gap-3">
          {/* Security Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>GDPR & RLS Activ</span>
          </div>

          {/* Reset Demo Trigger */}
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors border border-zinc-200 cursor-pointer"
            title="Reinițializează starea demo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Quick Upload CTA */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsUploadOpen(true)}
            className="gap-2"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Încarcă Document</span>
          </Button>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold text-xs border border-zinc-800">
              {currentUser.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-zinc-900 leading-tight" suppressHydrationWarning>{currentUser.fullName}</p>
              <p className="text-[10px] text-zinc-500 font-mono leading-none" suppressHydrationWarning>{currentUser.role || 'CFO'}</p>
            </div>
            {supabaseUser && (
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors ml-1 cursor-pointer"
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
