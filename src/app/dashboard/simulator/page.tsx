'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSave } from '@/lib/context';
import { calculateSpendSummary } from '@/lib/analytics/spend-calculator';
import { SpendCategory } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sliders, 
  ArrowLeft, 
  TrendingDown, 
  Sparkles, 
  DollarSign, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Percent,
  Calendar
} from 'lucide-react';
import { ProcurementRequestModal } from '@/components/opportunities/procurement-request-modal';

export default function BudgetSimulatorPage() {
  const { spendRecords, currentOrg } = useSave();
  const summary = calculateSpendSummary(spendRecords);

  // Fallback defaults if no spend records yet
  const telecomBaseline = summary.categoryBreakdown.Telecom?.amount || 24000;
  const curieratBaseline = summary.categoryBreakdown.Curierat?.amount || 36000;
  const softwareBaseline = summary.categoryBreakdown.Software?.amount || 18000;
  const consumabileBaseline = summary.categoryBreakdown.Consumabile?.amount || 12000;
  const energieBaseline = (summary.categoryBreakdown.Energie?.amount || 0) + (summary.categoryBreakdown.Utilități?.amount || 0) || 45000;
  const serviciiBaseline = summary.categoryBreakdown.Servicii?.amount || 20000;

  // Percentage sliders
  const [telecomDiscount, setTelecomDiscount] = useState(20);
  const [curieratDiscount, setCurieratDiscount] = useState(22);
  const [softwareDiscount, setSoftwareDiscount] = useState(15);
  const [consumabileDiscount, setConsumabileDiscount] = useState(12);
  const [energieDiscount, setEnergieDiscount] = useState(10);
  const [serviciiDiscount, setServiciiDiscount] = useState(15);

  const [isProcureModalOpen, setIsProcureModalOpen] = useState(false);

  // Calculations
  const telecomSavings = Math.round(telecomBaseline * (telecomDiscount / 100));
  const curieratSavings = Math.round(curieratBaseline * (curieratDiscount / 100));
  const softwareSavings = Math.round(softwareBaseline * (softwareDiscount / 100));
  const consumabileSavings = Math.round(consumabileBaseline * (consumabileDiscount / 100));
  const energieSavings = Math.round(energieBaseline * (energieDiscount / 100));
  const serviciiSavings = Math.round(serviciiBaseline * (serviciiDiscount / 100));

  const totalBaseline = telecomBaseline + curieratBaseline + softwareBaseline + consumabileBaseline + energieBaseline + serviciiBaseline;
  const totalAnnualSavings = telecomSavings + curieratSavings + softwareSavings + consumabileSavings + energieSavings + serviciiSavings;
  const totalOptimized = Math.max(0, totalBaseline - totalAnnualSavings);
  const monthlyCashflowReleased = Math.round(totalAnnualSavings / 12);
  const averagePercentageSaved = totalBaseline > 0 ? Number(((totalAnnualSavings / totalBaseline) * 100).toFixed(1)) : 0;
  const threeYearCumulativeSavings = totalAnnualSavings * 3;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tablou de Bord</span>
            </Link>
            <span className="text-zinc-300">•</span>
            <Badge variant="purple" size="sm">Simulator OPEX & Prognoză</Badge>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-emerald-600" />
            <span>Simulator de Buget & Prognoză OPEX pe 12 Luni</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Simulează scenarii de negociere și aliniere la benchmark-urile pieței din România. Vezi impactul direct asupra cashflow-ului și profitului net.
          </p>
        </div>

        <Button
          variant="emerald"
          size="sm"
          onClick={() => setIsProcureModalOpen(true)}
          className="gap-2 font-bold shadow-md shadow-emerald-500/20 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Activează Scenariul (Cere Oferte)</span>
        </Button>
      </div>

      {/* SIMULATED KPI RESULTS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-950 text-white border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Economie Anuală Estimată</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            +{totalAnnualSavings.toLocaleString('ro-RO')} lei
          </p>
          <span className="text-[10px] text-emerald-300/80 block font-semibold">
            -{averagePercentageSaved}% reducere medie OPEX
          </span>
        </Card>

        <Card className="p-4 bg-white border-zinc-200 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Cashflow Lunar Eliberat</span>
          <p className="text-2xl font-black text-zinc-900 font-mono">
            +{monthlyCashflowReleased.toLocaleString('ro-RO')} lei
          </p>
          <span className="text-[10px] text-zinc-400 block">Lichiditate adițională / lună</span>
        </Card>

        <Card className="p-4 bg-white border-zinc-200 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Buget OPEX Optimizat</span>
          <p className="text-2xl font-black text-purple-700 font-mono">
            {totalOptimized.toLocaleString('ro-RO')} lei
          </p>
          <span className="text-[10px] text-zinc-400 block font-mono">de la {totalBaseline.toLocaleString('ro-RO')} lei</span>
        </Card>

        <Card className="p-4 bg-white border-zinc-200 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Impact Cumulat pe 3 Ani</span>
          <p className="text-2xl font-black text-emerald-700 font-mono">
            +{threeYearCumulativeSavings.toLocaleString('ro-RO')} lei
          </p>
          <span className="text-[10px] text-zinc-400 block">Valoare adăugată totală</span>
        </Card>
      </div>

      {/* TWO COLUMNS: SLIDERS & FORECAST CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Category Sliders */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4 border-b border-zinc-100">
              <CardTitle className="text-base">Ajustează Țintele de Reducere pe Categorii</CardTitle>
              <CardDescription className="text-xs">
                Modifică procentele de discount pentru a reflecta obiectivele companiei.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-5 space-y-6">
              {/* Telecom Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-zinc-900">
                    <span>1. Telecomunicații & Date Mobile</span>
                    <Badge variant="purple" size="sm">{telecomBaseline.toLocaleString('ro-RO')} lei/an</Badge>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">
                    -{telecomDiscount}% (-{telecomSavings.toLocaleString('ro-RO')} lei)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={telecomDiscount}
                  onChange={(e) => setTelecomDiscount(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Curierat Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-zinc-900">
                    <span>2. Curierat & Expedieri Colete</span>
                    <Badge variant="purple" size="sm">{curieratBaseline.toLocaleString('ro-RO')} lei/an</Badge>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">
                    -{curieratDiscount}% (-{curieratSavings.toLocaleString('ro-RO')} lei)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={curieratDiscount}
                  onChange={(e) => setCurieratDiscount(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Software Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-zinc-900">
                    <span>3. Software, SaaS & Licențe Cloud</span>
                    <Badge variant="purple" size="sm">{softwareBaseline.toLocaleString('ro-RO')} lei/an</Badge>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">
                    -{softwareDiscount}% (-{softwareSavings.toLocaleString('ro-RO')} lei)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={softwareDiscount}
                  onChange={(e) => setSoftwareDiscount(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Energie Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-zinc-900">
                    <span>4. Energie Electrică & Utilități</span>
                    <Badge variant="purple" size="sm">{energieBaseline.toLocaleString('ro-RO')} lei/an</Badge>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">
                    -{energieDiscount}% (-{energieSavings.toLocaleString('ro-RO')} lei)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={energieDiscount}
                  onChange={(e) => setEnergieDiscount(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Consumabile Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-zinc-900">
                    <span>5. Birotică & Consumabile</span>
                    <Badge variant="purple" size="sm">{consumabileBaseline.toLocaleString('ro-RO')} lei/an</Badge>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">
                    -{consumabileDiscount}% (-{consumabileSavings.toLocaleString('ro-RO')} lei)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={consumabileDiscount}
                  onChange={(e) => setConsumabileDiscount(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Servicii Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-zinc-900">
                    <span>6. Servicii Profesionale & Altele</span>
                    <Badge variant="purple" size="sm">{serviciiBaseline.toLocaleString('ro-RO')} lei/an</Badge>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">
                    -{serviciiDiscount}% (-{serviciiSavings.toLocaleString('ro-RO')} lei)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={serviciiDiscount}
                  onChange={(e) => setServiciiDiscount(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Scenario Strategic Insights */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-zinc-800 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Strategie de Execuție SAVE</span>
              </h3>
              <Badge variant="success" size="sm">P25 Target</Badge>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                Prin agregarea cererii tale cu alte companii partenere din rețeaua SAVE, atingerea acestor ținte de discount devine o certitudine comercială, fără afectarea calității serviciilor.
              </p>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-white block">Plan de Implementare:</span>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Timp mediu negociere:</span>
                  <strong className="text-white font-mono">14–21 zile</strong>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Comision SAVE (Success fee):</span>
                  <strong className="text-emerald-400 font-mono">Doar din economia realizată</strong>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Garanție de conformitate:</span>
                  <strong className="text-white font-mono">100% SLA garantat</strong>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="emerald"
                size="md"
                onClick={() => setIsProcureModalOpen(true)}
                className="w-full font-bold gap-2 text-xs shadow-lg shadow-emerald-500/25"
              >
                <span>Aplică Scenariul în Companie</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Procurement Modal */}
      <ProcurementRequestModal
        isOpen={isProcureModalOpen}
        onClose={() => setIsProcureModalOpen(false)}
        initialAnnualSpend={totalBaseline}
      />
    </div>
  );
}
