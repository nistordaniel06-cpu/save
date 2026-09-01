'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { SaveProvider, useSave } from '@/lib/context';
import { SpendCategory } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';

function OnboardingContent() {
  const router = useRouter();
  const { createOrganization } = useSave();

  const [companyName, setCompanyName] = useState('');
  const [cui, setCui] = useState('');
  const [industry, setIndustry] = useState('Retail & E-commerce');
  const [employeeRange, setEmployeeRange] = useState('10-49 angajați');
  const [monthlyOpexRon, setMonthlyOpexRon] = useState<number>(35000);
  const [selectedCategories, setSelectedCategories] = useState<SpendCategory[]>([
    'Telecom',
    'Curierat',
    'Software',
    'Energie',
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/auth/register');
      }
    });
  }, [router]);

  const toggleCategory = (cat: SpendCategory) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg('Te rugăm să introduci denumirea companiei.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await createOrganization({
        name: companyName.trim(),
        cui: cui.trim() || undefined,
        industry,
        employeeRange,
        monthlyOpexRon: Number(monthlyOpexRon),
      });

      router.push('/dashboard/documents');
    } catch (err: any) {
      console.error('Failed to create organization:', err);
      setErrorMsg(err?.message || 'Eroare la crearea organizației. Reîncearcă.');
    } finally {
      setIsLoading(false);
    }
  };

  const categories: SpendCategory[] = [
    'Telecom',
    'Software',
    'Curierat',
    'Consumabile',
    'Energie',
    'Servicii',
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-xl tracking-tighter shadow-md">
            S
          </div>
          <span className="font-bold text-zinc-900 text-xl tracking-tight">SAVE</span>
        </Link>
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-emerald-700">
          <Clock className="w-3.5 h-3.5" />
          <span>Configurare cont real • Sub 2 minute</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          Înrolează Organizația în SAVE
        </h1>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Configurează profilul companiei pentru a calibra benchmark-urile de preț aplicabile cheltuielilor tale reale.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-8 shadow-xl rounded-2xl border border-zinc-200 space-y-5 sm:space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Company Name & CUI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Denumire Companie *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Apex Logistics SRL"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">CUI / CIF (Opțional)</label>
                <input
                  type="text"
                  placeholder="ex: RO 41920831"
                  value={cui}
                  onChange={(e) => setCui(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white font-mono"
                />
              </div>
            </div>

            {/* Industry & Employees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Industrie Principală *</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white cursor-pointer"
                >
                  <option value="Retail & E-commerce">Retail & E-commerce</option>
                  <option value="Servicii Profesionale & B2B">Servicii Profesionale & B2B</option>
                  <option value="Producție & Industrie">Producție & Industrie</option>
                  <option value="IT, Software & Tehnologie">IT, Software & Tehnologie</option>
                  <option value="Transport & Logistică">Transport & Logistică</option>
                  <option value="Construcții & Instalații">Construcții & Instalații</option>
                  <option value="HoReCa & Turism">HoReCa & Turism</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Număr Angajați *</label>
                <select
                  value={employeeRange}
                  onChange={(e) => setEmployeeRange(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white cursor-pointer"
                >
                  <option value="1-9 angajați">1–9 angajați (Microîntreprindere)</option>
                  <option value="10-49 angajați">10–49 angajați (Companie Mică)</option>
                  <option value="50-249 angajați">50–249 angajați (Companie Medie)</option>
                  <option value="250+ angajați">250+ angajați (Enterprise)</option>
                </select>
              </div>
            </div>

            {/* Monthly OPEX slider */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-zinc-700">
                  Cheltuieli Lunare Estimative (OPEX - Opțional)
                </label>
                <span className="font-mono font-bold text-zinc-900">
                  {monthlyOpexRon.toLocaleString('ro-RO')} lei / lună
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={250000}
                step={5000}
                value={monthlyOpexRon}
                onChange={(e) => setMonthlyOpexRon(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Major Categories Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <label className="font-semibold text-zinc-700 block">
                Categorii Majore de Cheltuieli de Optimizat (Opțional)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {categories.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="text-xs">{cat}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-end">
              <Button
                type="submit"
                variant="emerald"
                size="md"
                isLoading={isLoading}
                className="w-full sm:w-auto gap-2 font-bold shadow-md shadow-emerald-500/20"
              >
                <span>Finalizează Înrolarea & Deschide Tabloul de Bord</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <SaveProvider>
      <OnboardingContent />
    </SaveProvider>
  );
}
