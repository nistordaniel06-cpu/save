'use client';

import React from 'react';
import Link from 'next/link';
import { useSave } from '@/lib/context';
import { calculateSpendSummary } from '@/lib/analytics/spend-calculator';
import { runSaveScan } from '@/lib/analytics/save-scan-engine';
import { 
  Printer, 
  ArrowLeft, 
  Building2, 
  ShieldCheck, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  FileText, 
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ExecutiveReportPage() {
  const { currentOrg, spendRecords, suppliers, documents, contracts } = useSave();

  const summary = calculateSpendSummary(spendRecords);
  const scanResult = runSaveScan(currentOrg.id, spendRecords, suppliers, documents, contracts);

  const nowFormatted = new Date().toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans print:p-0 print:m-0 print:max-w-none">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-200 print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Înapoi la Tablou de Bord</span>
          </Link>
          <span className="text-zinc-300">•</span>
          <Badge variant="purple" size="sm">Raport Executiv CFO / Management</Badge>
        </div>

        <Button
          variant="emerald"
          size="sm"
          onClick={handlePrint}
          className="gap-2 font-bold shadow-md shadow-emerald-500/20"
        >
          <Printer className="w-4 h-4" />
          <span>Tipărește / Salvează ca PDF</span>
        </Button>
      </div>

      {/* PRINTABLE EXECUTIVE REPORT CONTAINER */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-zinc-200 shadow-sm print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-2 border-zinc-900">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 text-emerald-400 font-black text-sm flex items-center justify-center font-mono">
                S
              </div>
              <span className="font-black text-lg text-zinc-950 tracking-tight">SAVE Spend Intelligence</span>
            </div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
              Raport de Audit & Optimizare Cheltuieli Operaționale (OPEX)
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Document confidențial generat automat pentru conducerea executivă și departamentul financiar.
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs">
            <p className="font-mono text-zinc-400 uppercase text-[10px]">Data Emiterii</p>
            <p className="font-bold text-zinc-900">{nowFormatted}</p>
            <div className="pt-1">
              <Badge variant="success" size="sm">✓ Date Verificate e-Factura</Badge>
            </div>
          </div>
        </div>

        {/* Company Identity Section */}
        <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Companie</span>
            <p className="font-bold text-zinc-900 text-sm">{currentOrg.name || 'Companie Client'}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">CUI / Identificator Fiscal</span>
            <p className="font-mono font-bold text-zinc-900 text-sm">{currentOrg.cui || '—'}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Sector / Domeniu</span>
            <p className="font-medium text-zinc-800">{currentOrg.industry || 'Servicii & Comerț'}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Sediu Social</span>
            <p className="font-medium text-zinc-800">{currentOrg.city ? `${currentOrg.city}, ${currentOrg.county || ''}` : 'România'}</p>
          </div>
        </div>

        {/* Financial Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Cheltuieli Totale Rulate</span>
            <p className="text-lg font-black text-zinc-900 font-mono">
              {summary.totalAnnualSpendRon.toLocaleString('ro-RO')} lei
            </p>
            <span className="text-[10px] text-zinc-400 block">Rulaj anualizat</span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Cost Lunar Mediu</span>
            <p className="text-lg font-black text-zinc-900 font-mono">
              {summary.monthlyRunRateRon.toLocaleString('ro-RO')} lei
            </p>
            <span className="text-[10px] text-zinc-400 block">Rată lunară curentă</span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Cheltuieli Recurente</span>
            <p className="text-lg font-black text-emerald-700 font-mono">
              {summary.recurringPercentage}%
            </p>
            <span className="text-[10px] text-zinc-400 block">{summary.recurringSpendRon.toLocaleString('ro-RO')} lei/an</span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Furnizori Analizați</span>
            <p className="text-lg font-black text-purple-700 font-mono">
              {suppliers.length}
            </p>
            <span className="text-[10px] text-zinc-400 block">{documents.length} facturi procesate</span>
          </div>
        </div>

        {/* Top 10 Suppliers Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Top Furnizori după Rulajul Anualizat</span>
            </h3>
            <span className="text-xs text-zinc-400 font-mono">Pondere în OPEX</span>
          </div>

          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-zinc-100 text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Furnizor</th>
                <th className="px-3 py-2">CUI</th>
                <th className="px-3 py-2">Categorie</th>
                <th className="px-3 py-2 text-right">Rulaj Anual (RON)</th>
                <th className="px-3 py-2 text-right">Pondere</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {summary.supplierBreakdown.slice(0, 10).map((sup, idx) => {
                const match = suppliers.find((s) => s.name.toLowerCase() === sup.supplierName.toLowerCase());
                return (
                  <tr key={sup.supplierName}>
                    <td className="px-3 py-2.5 font-mono text-zinc-400 font-bold">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-bold text-zinc-900">{sup.supplierName}</td>
                    <td className="px-3 py-2.5 font-mono text-zinc-500">{match?.cui || '—'}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="default" size="sm">{sup.category}</Badge>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-zinc-900 text-right">
                      {sup.annualSpend.toLocaleString('ro-RO')} lei
                    </td>
                    <td className="px-3 py-2.5 font-mono text-zinc-700 font-bold text-right">
                      {sup.percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SAVE Scan Signals & Risk Anomalies */}
        <div className="space-y-3 pt-2">
          <div className="border-b border-zinc-200 pb-2">
            <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Semnale de Atenție & Anomalii de Cost (SAVE Scan)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {scanResult.signals.map((sig) => (
              <div key={sig.id} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">{sig.title}</span>
                  <Badge variant={sig.severity === 'high' ? 'danger' : 'warning'} size="sm">
                    {sig.severity === 'high' ? 'Risc Ridicat' : 'Optimizare'}
                  </Badge>
                </div>
                <p className="text-zinc-600 leading-relaxed text-[11px]">{sig.description}</p>
                <p className="text-[10px] font-semibold text-emerald-800 pt-1">
                  Recomandare: {sig.recommendedAction}
                </p>
              </div>
            ))}

            {scanResult.signals.length === 0 && (
              <p className="text-zinc-400 italic py-2">Nu au fost detectate anomalii majore în facturile analizate.</p>
            )}
          </div>
        </div>

        {/* 12-Month Optimization Action Plan */}
        <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3 text-xs">
          <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Plan Recomandat de Acțiune pe 12 Luni</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-900">Etapa 1: Zilele 1–30</span>
              <p className="text-zinc-600 text-[11px] leading-relaxed">
                Lansarea cererilor de ofertă agregate pentru furnizorii dominanți și categoriile cu creșteri anormale de preț.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-900">Etapa 2: Zilele 31–60</span>
              <p className="text-zinc-600 text-[11px] leading-relaxed">
                Evaluarea ofertelor comparate în SAVE Compare și transmiterea notificărilor de renegociere către furnizorii actuali.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-900">Etapa 3: Zilele 61–90</span>
              <p className="text-zinc-600 text-[11px] leading-relaxed">
                Semnarea noilor acorduri comerciale la tarife P25 și monitorizarea economiilor efective realizate lună de lună.
              </p>
            </div>
          </div>
        </div>

        {/* Footer & Disclaimer */}
        <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-zinc-400 gap-2">
          <span>Raport generat de SAVE Spend Intelligence • Confidential & Proprietary</span>
          <span>contact@save.ro • www.save.ro</span>
        </div>
      </div>
    </div>
  );
}
