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

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  React.useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            router.replace('/auth/register');
            return;
          }
        }
      } catch (e) {
        console.warn('Auth check in onboarding:', e);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    check();
  }, [router]);

  const toggleCategory = (cat: SpendCategory) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupNotice, setLookupNotice] = useState<string | null>(null);

  const handleCuiLookup = async (cuiToLookup: string) => {
    const clean = cuiToLookup.trim();
    if (!clean || clean.length < 2) {
      setLookupResult(null);
      setLookupNotice(null);
      return;
    }

    setLookupLoading(true);
    setLookupNotice(null);

    try {
      const res = await fetch('/api/company-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cui: clean }),
      });

      const data = await res.json();
      if (data.success && data.company) {
        setLookupResult(data.company);
        setLookupNotice(null);
        // Autofill company name if empty or previously autofilled
        if (!companyName || companyName === '' || companyName.startsWith('Companie Nouă')) {
          setCompanyName(data.company.name);
        }
      } else {
        setLookupResult(null);
        setLookupNotice(data.error?.userMessage || 'Nu am găsit automat compania. Poți completa datele manual.');
      }
    } catch (err) {
      console.warn('Company lookup error:', err);
      setLookupResult(null);
      setLookupNotice('Serviciul de verificare nu este disponibil momentan. Poți continua și completa datele manual.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Debounced auto-lookup on CUI change
  React.useEffect(() => {
    const raw = cui.trim().replace(/^RO\s*/i, '').replace(/\D/g, '');
    if (raw.length >= 6 && raw.length <= 10) {
      const timer = setTimeout(() => {
        handleCuiLookup(cui);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [cui]);

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
        verificationStatus: lookupResult ? 'verified' : 'unverified',
        verifiedAt: lookupResult ? new Date().toISOString() : undefined,
        verifiedBy: lookupResult ? 'ANAF API Registry' : undefined,
        companyLookupSource: lookupResult?.source || undefined,
        companyLookupCheckedAt: lookupResult?.checkedAt || undefined,
        companyLookupStatus: lookupResult?.status || undefined,
        address: lookupResult?.address || undefined,
        city: lookupResult?.city || undefined,
        county: lookupResult?.county || undefined,
        postalCode: lookupResult?.postalCode || undefined,
        vatRegistered: lookupResult?.vatRegistered,
        roEfacturaStatus: lookupResult?.roEfacturaRegistered ? 'inregistrat' : undefined,
      } as any);

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
            {/* CUI Lookup & Company Name */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-700">CUI / CIF Companie</label>
                  <span className="text-[10px] text-zinc-400">Verificare automată date publice</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ex: 14399840 sau RO14399840"
                    value={cui}
                    onChange={(e) => setCui(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm sm:text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={lookupLoading || !cui.trim()}
                    onClick={() => handleCuiLookup(cui)}
                    className="shrink-0 text-xs px-3 border-zinc-300 hover:bg-zinc-100"
                  >
                    {lookupLoading ? 'Verificăm compania…' : 'Verifică firma'}
                  </Button>
                </div>
              </div>

              {lookupLoading && (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Verificăm compania în registrul public ANAF…</span>
                </div>
              )}

              {lookupNotice && !lookupLoading && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  {lookupNotice}
                </div>
              )}

              {lookupResult && !lookupLoading && (
                <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ✓ Companie identificată
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono">
                      Sursă: {lookupResult.source}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Denumire:</span>
                      <span className="font-semibold text-zinc-900">{lookupResult.name}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">CUI:</span>
                      <span className="font-mono font-semibold text-zinc-900">{lookupResult.cui}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Status:</span>
                      <span className="font-semibold text-emerald-700">
                        {lookupResult.status === 'active' ? 'Activă' : 'Inactivă'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">TVA:</span>
                      <span className="font-semibold text-zinc-900">
                        {lookupResult.vatRegistered ? 'Plătitoare TVA' : 'Neplătitoare TVA'}
                      </span>
                    </div>
                    {lookupResult.roEfacturaRegistered && (
                      <div>
                        <span className="text-zinc-500 block text-[10px]">RO e-Factura:</span>
                        <span className="font-semibold text-emerald-700">Înregistrată</span>
                      </div>
                    )}
                    {lookupResult.registrationNumber && (
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Nr. Reg. Com.:</span>
                        <span className="font-semibold text-zinc-900">{lookupResult.registrationNumber}</span>
                      </div>
                    )}
                  </div>
                  {lookupResult.address && (
                    <div className="text-[11px] pt-1.5 border-t border-emerald-100">
                      <span className="text-zinc-500 block text-[10px]">Adresă:</span>
                      <span className="text-zinc-800">{lookupResult.address}</span>
                    </div>
                  )}
                </div>
              )}

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
