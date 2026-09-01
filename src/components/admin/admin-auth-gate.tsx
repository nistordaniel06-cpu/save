'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, KeyRound, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export const ADMIN_MASTER_PASSWORD = 'Mutupalermo123@1';
const STORAGE_KEY = 'save_admin_auth_token';

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        // 1. Check session storage token
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored === ADMIN_MASTER_PASSWORD) {
          setIsAuthenticated(true);
          return;
        }

        // 2. Check Supabase profile role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profile && profile.role === 'admin') {
            setIsAuthenticated(true);
            return;
          }
        }
      } catch (err) {
        console.warn('Admin auth check notice:', err);
      } finally {
        setIsChecking(false);
      }
    }

    checkAdminAuth();
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_MASTER_PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, ADMIN_MASTER_PASSWORD);
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Parolă incorectă! Accesul la panoul de administrare SAVE a fost refuzat.');
      setPasswordInput('');
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-8 space-y-6 relative overflow-hidden">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-black text-white tracking-tight">
              Panou Administrator SAVE
            </h2>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Această zonă este restricționată exclusiv echipei operaționale SAVE. Introduceți parola de autorizare pentru a accesa managementul organizațiilor și auditul documentelor.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                <span>Parolă Master Administrator</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Introduceți parola master..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-12 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="purple"
              className="w-full py-3 rounded-xl font-bold text-sm tracking-tight shadow-lg shadow-purple-500/20"
            >
              <Lock className="w-4 h-4 mr-2" />
              <span>Autorizează Accesul Admin</span>
            </Button>
          </form>

          <div className="pt-2 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Înapoi la Dashboard Client</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
