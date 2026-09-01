'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SaveProvider } from '@/lib/context';
import { supabase } from '@/lib/supabase/client';

function RegisterContent() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Director Financiar (CFO)');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        // Direct session, proceed to onboarding
        router.push('/onboarding');
      } else {
        // Confirmation email sent
        setSuccessMsg('Contul a fost creat! Te rugăm să verifici email-ul pentru confirmare.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Eroare la crearea contului.');
    } finally {
      setIsLoading(false);
    }
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
          Înregistrare Cont Companie
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Creează contul de administrator pentru organizația ta.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md px-2 sm:px-0">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-xl rounded-2xl border border-zinc-200 space-y-5 sm:space-y-6">
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
              <label className="font-semibold text-zinc-700">Nume & Prenume *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ex: Andrei Popescu"
                className="w-full px-3 py-2 text-sm sm:text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Email Profesional *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nume@companie.ro"
                className="w-full px-3 py-2 text-sm sm:text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Rol în Companie</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white cursor-pointer"
              >
                <option value="Director Financiar (CFO)">Director Financiar (CFO)</option>
                <option value="Director General / CEO">Director General / CEO</option>
                <option value="Manager Achiziții / Procurement">Manager Achiziții / Procurement</option>
                <option value="Contabil Șef">Contabil Șef</option>
                <option value="Operations Manager">Operations Manager</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Parolă (min. 6 caractere) *</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolă securizată"
                className="w-full px-3 py-2 text-sm sm:text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
              />
            </div>

            <Button
              type="submit"
              variant="emerald"
              size="md"
              isLoading={isLoading}
              className="w-full font-bold gap-1.5"
            >
              <span>Continuă către Înrolare Companie</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-zinc-500 border-t border-zinc-100">
            <span>Ai deja un cont? </span>
            <Link href="/auth/login" className="font-semibold text-zinc-900 hover:underline">
              Autentifică-te
            </Link>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-zinc-500">
          <span>Vrei doar să testezi fără cont? </span>
          <Link href="/demo" className="font-semibold text-emerald-600 hover:underline">
            Vezi demo
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Securizat prin Supabase Row-Level Security</span>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <SaveProvider>
      <RegisterContent />
    </SaveProvider>
  );
}
