'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  TrendingDown, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Lock, 
  Zap,
  HelpCircle,
  BarChart3,
  Scale,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const [monthlySpend, setMonthlySpend] = useState<number>(35000);
  const estimatedSavings = Math.round(monthlySpend * 12 * 0.09); // ~9% average realistic savings

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans antialiased">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-white text-xs py-2 px-4 text-center font-medium border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Platformă Europeană B2B de Inteligență în Achiziții pentru IMM-uri din România</span>
        </div>
      </div>

      {/* Navigation */}
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-lg tracking-tighter shadow-md shadow-emerald-500/20 group-hover:bg-emerald-400 transition-colors">
              S
            </div>
            <div>
              <span className="font-bold text-zinc-900 tracking-tight text-base">SAVE</span>
              <span className="text-[10px] ml-1.5 px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-mono font-medium border border-zinc-200">
                B2B
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-600">
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">Cum funcționează</a>
            <a href="#calculator" className="hover:text-zinc-900 transition-colors">Calculator Economii</a>
            <a href="#security" className="hover:text-zinc-900 transition-colors">Securitate & RLS</a>
            <a href="#pricing" className="hover:text-zinc-900 transition-colors">No Saving, No Fee</a>
            <a href="#faq" className="hover:text-zinc-900 transition-colors">Întrebări Frecvente</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button size="sm" variant="ghost" className="text-xs">
                Autentificare
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" variant="primary" className="text-xs gap-1.5 shadow-sm">
                <span>Deschide Demo Nova Retail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-xs font-semibold text-zinc-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Puterea de negociere a marilor corporații, acum accesibilă IMM-urilor</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-zinc-950 tracking-tight leading-[1.08]">
          SAVE găsește unde firma ta plătește prea mult.
        </h1>

        <p className="text-base sm:text-xl text-zinc-600 max-w-3xl mx-auto leading-relaxed">
          Încarcă facturile și contractele. Analizăm costurile, identificăm oportunitățile de economisire și te ajutăm să obții condiții mai bune.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button size="lg" variant="emerald" className="w-full sm:w-auto text-base gap-2 px-8 h-12 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-4 h-4" />
              <span>Analizează-mi costurile</span>
            </Button>
          </Link>

          <a href="#how-it-works" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8">
              Vezi cum funcționează
            </Button>
          </a>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Fără abonament fix • Risc zero</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Extracție Zod cu verificare umană</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Securitate Row-Level Security</span>
          </div>
        </div>
      </section>

      {/* Interactive Savings Estimator */}
      <section id="calculator" className="py-16 px-6 bg-zinc-50 border-y border-zinc-200/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <Badge variant="purple" size="sm">Simulator ROI</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Cât poate economisi compania ta în primul an?
            </h2>
            <p className="text-xs text-zinc-500">
              Bazat pe optimizarea tarifelor medii din telecom, curierat, utilități și licențe software.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-zinc-700">Cheltuieli Lunare Estimative (OPEX)</label>
                  <span className="font-mono font-bold text-zinc-900 text-sm">
                    {monthlySpend.toLocaleString('ro-RO')} lei / lună
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={250000}
                  step={5000}
                  value={monthlySpend}
                  onChange={(e) => setMonthlySpend(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-1">
                  <span>5.000 lei</span>
                  <span>100.000 lei</span>
                  <span>250.000 lei</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-600">
                <p className="font-semibold text-zinc-900">Categorii vizate automat de audit:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Telecom & SIM-uri flotă</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Curierat & E-commerce</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Licențe Cloud & Workspace</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Energie & Birotică</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-950 text-white text-center space-y-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-semibold">
                Economie Anuală Estimată
              </p>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                {estimatedSavings.toLocaleString('ro-RO')} lei / an
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                *Calculat pe o reducere medie observată de 8–12% fără schimbarea calității serviciilor.
              </p>
              <div className="pt-2">
                <Link href="/dashboard">
                  <Button size="sm" variant="emerald" className="w-full font-semibold">
                    Vezi Dashboard Demo Interactiv →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="default" size="sm">Proces Simplu</Badge>
          <h2 className="text-3xl font-bold text-zinc-950 tracking-tight">
            Cum funcționează platforma SAVE
          </h2>
          <p className="text-xs text-zinc-500">
            Fără integrări complicate de ERP sau setări de luni de zile. Doar documentele tale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center font-mono font-bold text-sm text-zinc-900 border border-zinc-200">
              01
            </div>
            <h3 className="text-base font-bold text-zinc-900">Încarcă Facturile & Contractele</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Tragi fișierele PDF sau scanările. Pipeline-ul nostru AI extrage automat furnizorul, costurile, perioadele de facturare și clauzele de preaviz.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center font-mono font-bold text-sm text-emerald-800 border border-emerald-200">
              02
            </div>
            <h3 className="text-base font-bold text-zinc-900">Primești Raportul de Economii</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Comparăm tarifele tale cu benchmark-urile reale B2B din România și îți arătăm exact unde plătești peste mediana pieței și ce contracte expiră curând.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center font-mono font-bold text-sm text-white">
              03
            </div>
            <h3 className="text-base font-bold text-zinc-900">Apeși „Redu costul”</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Echipa SAVE renegociază contractele sau îți pune la dispoziție oferte alternative pre-negociate. Plătești comision doar dacă obții economii reale.
            </p>
          </div>
        </div>
      </section>

      {/* Trust, Security & Confidentiality */}
      <section id="security" className="py-16 px-6 bg-zinc-950 text-white border-t border-zinc-800">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <Badge variant="purple" size="sm">Securitate Europeană</Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Datele tale comerciale sunt strict protejate
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto">
              Știm cât de sensibile sunt prețurile de achiziție și contractele companiei tale. Am proiectat securitatea ca prioritate absolută.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <Lock className="w-4 h-4" />
                <span>Izolare Multi-Tenant & RLS</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Fiecare organizație este complet izolată prin Row-Level Security în baza de date PostgreSQL. Nicio altă companie nu poate accesa datele tale.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Scurgeri către Furnizori</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Nu trimitem facturile sau datele tale brute către furnizori concurenți. Cererile de ofertă sunt complet anonimizate volumetric.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Validare Umană (Human-in-the-loop)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Dacă o scanare este neclară sau scorul de încredere este sub 85%, sistemul cere confirmare manuală pentru a preveni erorile silențioase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Business Model Section */}
      <section id="pricing" className="py-20 px-6 max-w-4xl mx-auto text-center space-y-8">
        <Badge variant="success" size="sm">Model Transparent</Badge>
        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
          No Saving, No Fee — Risc Zero pentru Afacerea Ta
        </h2>
        <p className="text-sm text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Platforma SAVE este gratuită pentru analiza cheltuielilor și monitorizarea contractelor. Când decidem împreună să renegociem un cost și obții o economie dovedită, SAVE percepe un procentaj din economia efectivă realizată în primul an.
        </p>

        <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 max-w-lg mx-auto text-left space-y-3 text-xs">
          <div className="flex items-center justify-between font-bold text-zinc-900 text-sm">
            <span>Audit & Monitorizare Contracte</span>
            <span className="text-emerald-600">0 LEI / Gratuit</span>
          </div>
          <div className="flex items-center justify-between font-bold text-zinc-900 text-sm pt-2 border-t border-zinc-200">
            <span>Renegociere & Optimizare Reușită</span>
            <span className="text-zinc-800">Success Fee din Economie</span>
          </div>
          <p className="text-[11px] text-zinc-500 pt-1">
            Dacă nu reducem costul, nu plătești nimic. Niciun cost ascuns.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-6 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900">Întrebări Frecvente</h2>
            <p className="text-xs text-zinc-500">Răspunsuri la cele mai comune întrebări despre platforma SAVE.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1.5">
              <h4 className="font-bold text-zinc-900 text-sm">Ce tipuri de documente pot încărca?</h4>
              <p className="text-zinc-600 leading-relaxed">
                Poți încărca facturi fiscale lunare, contracte-cadru cu furnizorii, anexe de prelungire și acorduri de abonament în format PDF, PNG sau JPG.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1.5">
              <h4 className="font-bold text-zinc-900 text-sm">De unde provin benchmark-urile de preț?</h4>
              <p className="text-zinc-600 leading-relaxed">
                Sistemul păstrează proveniența exactă a fiecărui calcul: oferte oficiale cotate de parteneri SAVE, date auditate manual sau seturi agregate din piața B2B din România. Nu inventăm prețuri teoretice.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1.5">
              <h4 className="font-bold text-zinc-900 text-sm">Suntem obligați să schimbăm furnizorii existenți?</h4>
              <p className="text-zinc-600 leading-relaxed">
                Nu. În peste 70% din cazuri, optimizarea se realizează direct cu furnizorul actual prin renegocierea grilelor tarifare și alinierea la volumul real consumat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
          Preia controlul asupra achizițiilor companiei tale.
        </h2>
        <p className="text-sm text-zinc-600 max-w-xl mx-auto">
          Explorează organizația demo „Nova Retail SRL” pentru a vedea cum funcționează platforma SAVE pe date reale din România.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button size="lg" variant="emerald" className="gap-2 font-bold px-8 h-12 shadow-lg shadow-emerald-500/20">
              <span>Deschide Tabloul de Bord Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-10 px-6 text-xs text-zinc-500 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900">SAVE</span>
            <span>• B2B Procurement Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
            <span>RO / EUR</span>
            <span>•</span>
            <span>GDPR Ready</span>
            <span>•</span>
            <span>ISO27001 Aligned</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
