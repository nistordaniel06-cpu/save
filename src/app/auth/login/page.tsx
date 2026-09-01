'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SaveProvider, useSave } from '@/lib/context';
import { supabase } from '@/lib/supabase/client';

function LoginContent() {
  const router = useRouter();
  const { resetToDemo } = useSave();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        setSuccessMsg('Ți-am trimis un link de autentificare pe email. Verifică inbox-ul!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Eroare la autentificare. Verifică datele introduse.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    resetToDemo();
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 sm:mb-4 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-xl tracking-tighter shadow-md">
            S
          </div>
          <span className="font-bold text-zinc-900 text-xl tracking-tight">SAVE</span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          Autentificare în Contul Companiei
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Acces securizat prin Supabase Auth & Row-Level Security.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md px-2 sm:px-0">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-xl rounded-2xl border border-zinc-200 space-y-5 sm:space-y-6">
          {/* Quick Demo Access Button */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
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
              <span className="bg-white px-2 text-zinc-400 font-mono text-[10px]">sau autentificare cu credențiale</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Email Profesional</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nume@companie.ro"
                className="w-full px-3 py-2 text-sm sm:text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
              />
            </div>

            {!isMagicLink && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-700">Parolă</label>
                  <button
                    type="button"
                    onClick={() => setIsMagicLink(true)}
                    className="text-[11px] text-zinc-500 hover:text-emerald-600 cursor-pointer"
                  >
                    Folosește Magic Link
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parola ta securizată"
                  className="w-full px-3 py-2 text-sm sm:text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
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
            <Link href="/auth/register" className="font-semibold text-zinc-900 hover:underline">
              Creează cont nou
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
