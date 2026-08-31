'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight, Sparkles, Building2, Lock } from 'lucide-react';
import { SaveProvider, useSave } from '@/lib/context';

function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState('andrei.popescu@novaretail.ro');
  const [password, setPassword] = useState('••••••••••••');
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-xl tracking-tighter shadow-md">
            S
          </div>
          <span className="font-bold text-zinc-900 text-xl tracking-tight">SAVE</span>
        </Link>
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Autentificare în Contul Companiei
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Acces securizat la tabloul de bord și inteligența de achiziții.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-zinc-200 space-y-6">
          {/* Quick Demo Access Button */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Acces Rapid Demo</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-200/60 text-emerald-900 font-semibold">
                1-Click
              </span>
            </div>
            <p className="text-emerald-800 text-[11px]">
              Intră direct ca <strong>Director Financiar</strong> în organizația <strong>Nova Retail SRL</strong> pentru a explora platforma.
            </p>
            <Button
              type="button"
              variant="emerald"
              size="sm"
              onClick={handleDemoLogin}
              isLoading={isLoading}
              className="w-full font-bold gap-1.5"
            >
              <span>Intră cu contul Demo Nova Retail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-zinc-400 font-mono text-[10px]">sau autentificare clasică</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Email Profesional</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nume@companie.ro"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
              />
            </div>

            {!isMagicLink && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-700">Parolă</label>
                  <button
                    type="button"
                    onClick={() => setIsMagicLink(true)}
                    className="text-[11px] text-zinc-500 hover:text-emerald-600"
                  >
                    Folosește Magic Link
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full font-semibold"
            >
              {isMagicLink ? 'Trimite Magic Link pe Email' : 'Autentificare'}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-zinc-500">
            <span>Nu ai încă un cont pentru companie? </span>
            <Link href="/onboarding" className="font-semibold text-zinc-900 hover:underline">
              Creează cont în 2 minute
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sesiune Criptată TLS 1.3 • Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SaveProvider>
      <LoginContent />
    </SaveProvider>
  );
}
