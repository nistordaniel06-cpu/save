'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, ShieldAlert, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SCRAPER_MASTER_PASSWORD = 'Mutupalermo123@1';
const STORAGE_KEY = 'save_scraper_auth_token';

interface ScraperAuthGateProps {
  children: React.ReactNode;
}

export function ScraperAuthGate({ children }: ScraperAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === SCRAPER_MASTER_PASSWORD) {
        setIsAuthenticated(true);
      }
    } catch {
      // sessionStorage unavailable or restricted
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SCRAPER_MASTER_PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, SCRAPER_MASTER_PASSWORD);
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Parolă incorectă! Accesul la baza de date de prospecțiune a fost refuzat.');
      setPasswordInput('');
    }
  };

  const handleLock = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  if (isChecking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-8 space-y-6 relative overflow-hidden">
          {/* Subtle security glow */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="text-center space-y-3 relative">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-black text-white tracking-tight">
              Secțiune Confidențială — Scraper
            </h2>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Accesul la acest modul este strict privat. Introduceți parola de securitate master pentru a debloca datele de contact și instrumentele de prospecțiune.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 relative">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                <span>Parolă Master</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="••••••••••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium pt-1 animate-in fade-in">
                  {errorMsg}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="emerald"
              className="w-full h-11 text-xs font-bold gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>Deblochează Scraperul</span>
            </Button>
          </form>

          <div className="pt-2 border-t border-zinc-900 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Înapoi la Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top security status bar */}
      <div className="p-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-zinc-200">Scraper Confidențial Activ</span>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">• Sesiune Master Autentificată</span>
        </div>

        <button
          onClick={handleLock}
          className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Blochează / Deconectare</span>
        </button>
      </div>

      {children}
    </div>
  );
}
