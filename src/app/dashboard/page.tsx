'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSave } from '@/lib/context';
import { calculateSpendSummary } from '@/lib/analytics/spend-calculator';
import { runSaveScan } from '@/lib/analytics/save-scan-engine';
import { StatCard } from '@/components/ui/stat-card';
import { SpendChart } from '@/components/dashboard/spend-chart';
import { ProcurementRequestModal } from '@/components/opportunities/procurement-request-modal';
import { 
  DollarSign, 
  TrendingDown, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  Zap, 
  Upload, 
  Clock, 
  Sparkles, 
  ChevronRight,
  Building2,
  Users,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import clsx from 'clsx';
import { SpendCategory } from '@/lib/types';

export default function DashboardPage() {
  const { currentOrg, spendRecords, suppliers, contracts, documents, importBatches } = useSave();

  // Selected procurement modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<SpendCategory>('Telecom');
  const [modalSupplier, setModalSupplier] = useState<string>('');
  const [modalSpend, setModalSpend] = useState<number>(0);
  const [modalOppId, setModalOppId] = useState<string | undefined>(undefined);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);

  const spendSummary = calculateSpendSummary(spendRecords);
  const scanResult = runSaveScan(currentOrg.id, spendRecords, suppliers, documents, contracts);

  const isDemo = currentOrg.isDemo;
  const hasRealData = documents.length > 0 || spendRecords.length > 0 || suppliers.length > 0;

  // Real Metric Calculations
  const currentMonthKey = new Date().toISOString().substring(0, 7); // YYYY-MM
  const thisMonthRecords = spendRecords.filter((r) => r.spendDate.startsWith(currentMonthKey));
  const thisMonthSpend = thisMonthRecords.reduce((sum, r) => sum + r.amount, 0);

  const totalSpendAnalysed = spendRecords.reduce((sum, r) => sum + r.amount, 0);
  const invoiceCount = documents.length;
  const supplierCount = suppliers.length;

  const lastImportDate = importBatches && importBatches.length > 0 
    ? new Date(importBatches[0].createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : (currentOrg.efacturaConnection?.lastSyncAt 
        ? new Date(currentOrg.efacturaConnection.lastSyncAt).toLocaleDateString('ro-RO')
        : '—');

  const openProcureModal = (cat: SpendCategory, supName?: string, cost?: number, oppId?: string, title?: string) => {
    setModalCategory(cat);
    setModalSupplier(supName || '');
    setModalSpend(cost || 0);
    setModalOppId(oppId);
    setModalTitle(title);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Explicit Mode Banner */}
      {isDemo ? (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              <strong>Mod Demonstrativ Activ (Nova Retail SRL):</strong> Date simulate de achiziții pentru prezentare.
            </span>
          </div>
          <Link href="/auth/register" className="font-semibold underline text-amber-950 hover:text-amber-800">
            Creează Organizația Ta Reală →
          </Link>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>
              <strong>Producție Reală:</strong> Date financiare și fiscale izolate strict prin Supabase Row-Level Security.
            </span>
          </div>
          <Badge variant="success" size="sm">✓ Date Reale Companie</Badge>
        </div>
      )}

      {/* COMPACT COMPANIA TA CARD (Part 3) */}
      <Card className="p-5 border-zinc-200/90 shadow-xs bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm border border-zinc-800">
              {currentOrg.name ? currentOrg.name.slice(0, 2).toUpperCase() : 'CO'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-bold text-base text-zinc-950">{currentOrg.name || 'Compania Ta'}</span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200">
                  {currentOrg.cui ? `CUI: ${currentOrg.cui}` : 'CUI Neconfigurat'}
                </span>
                {currentOrg.vatRegistered && (
                  <Badge variant="success" size="sm">Plătitor TVA</Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs flex-wrap pt-0.5">
                {currentOrg.verificationStatus === 'verified' ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Date companie verificate</span>
                  </span>
                ) : (
                  <Link href="/settings/company" className="text-amber-700 font-semibold flex items-center gap-1 hover:underline">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Verifică datele companiei →</span>
                  </Link>
                )}
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-500">
                  Facturi importate: <strong className="text-zinc-900 font-mono">{invoiceCount}</strong>
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-500">
                  Furnizori identificați: <strong className="text-zinc-900 font-mono">{supplierCount}</strong>
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-500">
                  Ultimul import: <strong className="text-zinc-900 font-mono">{lastImportDate}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
            <Link href="/settings/company">
              <Button variant="emerald" size="sm" className="font-bold gap-1.5 shadow-md shadow-emerald-500/20">
                <Upload className="w-3.5 h-3.5" />
                <span>Importă e-Factura (SPV)</span>
              </Button>
            </Link>
            <Link href="/settings/company">
              <Button variant="outline" size="sm" className="font-semibold text-xs gap-1">
                <span>Profil Fiscal</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* TOP 4 REAL METRICS (Part 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cheltuieli Analizate"
          value={`${Math.round(totalSpendAnalysed).toLocaleString('ro-RO')} lei`}
          subtitle={hasRealData ? 'Total cumulativ din facturi reale' : 'Nicio factură importată'}
          badgeText="Total Real"
          badgeVariant="default"
          icon={DollarSign}
        />

        <StatCard
          title="Cheltuieli Luna Aceasta"
          value={`${Math.round(thisMonthSpend).toLocaleString('ro-RO')} lei`}
          subtitle={`${thisMonthRecords.length} facturi în ${new Date().toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}`}
          badgeText="Luna Curentă"
          badgeVariant="purple"
          icon={Zap}
        />

        <StatCard
          title="Facturi Procesate"
          value={invoiceCount}
          subtitle={invoiceCount > 0 ? `${invoiceCount} documente UBL / PDF validate` : 'Așteaptă import'}
          badgeText="Documente"
          badgeVariant="info"
          icon={FileText}
        />

        <StatCard
          title="Furnizori Unici"
          value={supplierCount}
          subtitle={supplierCount > 0 ? 'Corelați după CUI unic' : '0 furnizori'}
          badgeText="Furnizori"
          badgeVariant="success"
          icon={Building2}
        />
      </div>

      {/* EMPTY STATE IF 0 DOCUMENTS (Part 10 & 17) */}
      {!hasRealData && !isDemo && (
        <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm text-center space-y-6 max-w-3xl mx-auto my-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
            <Upload className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              Începe Analiza Cheltuielilor Companiei Tale
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Descarcă arhiva de facturi primite din <strong>ANAF SPV / RO e-Factura</strong> (sau fișiere XML individuale) și încarcă-le în SAVE. Motorul determinist va extrage furnizorii, sumele și semnalele de economisire în câteva secunde.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/settings/company">
              <Button size="lg" variant="emerald" className="font-bold gap-2 shadow-md shadow-emerald-500/20">
                <Upload className="w-4 h-4" />
                <span>Importă Facturi din SPV (ZIP / XML)</span>
              </Button>
            </Link>
            <Link href="/dashboard/documents">
              <Button size="lg" variant="outline" className="font-semibold gap-2">
                <FileText className="w-4 h-4" />
                <span>Încarcă Documente Manual</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* REAL DASHBOARD CONTENT WHEN DATA EXISTS */}
      {hasRealData && (
        <>
          {/* COSTURI CARE NECESITĂ ATENȚIE: SAVE SCAN V1 (Part 10, 11, 12, 13) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-zinc-950">SAVE Scan — Semnale & Oportunități de Cost</h2>
              </div>
              <span className="text-xs text-zinc-500">
                Calculat 100% determinist din datele reale ale companiei
              </span>
            </div>

            {scanResult.signals.length === 0 ? (
              <Card className="p-4 border-zinc-200 text-xs text-zinc-500 bg-zinc-50/50">
                Nu au fost detectate anomalii majore sau concentrări critice în facturile importate până acum.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scanResult.signals.map((sig) => (
                  <Card key={sig.id} className="p-5 border-zinc-200/90 shadow-xs flex flex-col justify-between gap-4 bg-white hover:border-zinc-300 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge 
                          variant={sig.severity === 'high' ? 'danger' : sig.severity === 'medium' ? 'warning' : 'info'}
                          size="sm"
                        >
                          {sig.severity === 'high' ? 'Atenție Sporită' : sig.severity === 'medium' ? 'Oportunitate' : 'Informație'}
                        </Badge>
                        {sig.metricValue && (
                          <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                            {sig.metricValue}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-zinc-900">{sig.title}</h3>
                      <p className="text-xs text-zinc-600 leading-relaxed">{sig.description}</p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] text-zinc-500 italic max-w-xs truncate">
                        {sig.recommendedAction}
                      </span>
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => openProcureModal(
                          sig.category || 'Telecom', 
                          sig.supplierName, 
                          sig.currentAnnualSpend, 
                          sig.id, 
                          sig.title
                        )}
                        className="font-bold text-xs gap-1.5 shrink-0 shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Cere oferte</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* CHARTS & CATEGORY BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SpendChart spendRecords={spendRecords} />
            </div>

            {/* Spend by Category */}
            <Card className="p-5 border-zinc-200/90 shadow-xs bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-900">Cheltuieli pe Categorii</h3>
                <span className="text-xs text-zinc-400 font-mono">Ponderea OPEX</span>
              </div>

              <div className="space-y-3 text-xs">
                {Object.entries(spendSummary.categoryBreakdown)
                  .filter(([_, data]) => data.amount > 0)
                  .sort((a, b) => b[1].amount - a[1].amount)
                  .map(([cat, data]) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-zinc-800">{cat}</span>
                        <span className="font-mono text-zinc-900 font-bold">
                          {Math.round(data.amount).toLocaleString('ro-RO')} lei ({data.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, data.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}

                {Object.values(spendSummary.categoryBreakdown).every((d) => d.amount === 0) && (
                  <p className="text-zinc-400 italic py-4 text-center">Nicio cheltuială clasificată încă.</p>
                )}
              </div>
            </Card>
          </div>

          {/* TOP SUPPLIERS & RECENT INVOICES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Furnizori */}
            <Card className="p-5 border-zinc-200/90 shadow-xs bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-900">Top Furnizori Identificați</h3>
                <Link href="/dashboard/spend" className="text-xs text-emerald-700 hover:underline font-semibold">
                  Vezi toți ({suppliers.length}) →
                </Link>
              </div>

              <div className="divide-y divide-zinc-100 text-xs">
                {suppliers.slice(0, 5).map((sup) => (
                  <div key={sup.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="font-bold text-zinc-900">{sup.name}</p>
                      <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
                        <span>CUI: {sup.cui || '—'}</span>
                        <span>•</span>
                        <span>{sup.invoiceCount} facturi</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-zinc-900">
                        {Math.round(sup.totalAnnualSpendRon).toLocaleString('ro-RO')} lei
                      </p>
                      <button
                        onClick={() => openProcureModal(sup.category, sup.name, sup.totalAnnualSpendRon)}
                        className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Cere oferte
                      </button>
                    </div>
                  </div>
                ))}

                {suppliers.length === 0 && (
                  <p className="text-zinc-400 italic py-4 text-center">Niciun furnizor extras încă.</p>
                )}
              </div>
            </Card>

            {/* Facturi Recente */}
            <Card className="p-5 border-zinc-200/90 shadow-xs bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-900">Facturi Importate Recent</h3>
                <Link href="/dashboard/documents" className="text-xs text-emerald-700 hover:underline font-semibold">
                  Vezi toate ({documents.length}) →
                </Link>
              </div>

              <div className="divide-y divide-zinc-100 text-xs">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="font-bold text-zinc-900 truncate max-w-[200px]">
                        {doc.extraction?.supplierName || doc.supplierName || doc.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
                        <span>{doc.extraction?.invoiceNumber || doc.fileName}</span>
                        <span>•</span>
                        <span>{doc.extraction?.invoiceDate || new Date(doc.createdAt).toLocaleDateString('ro-RO')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-zinc-900">
                        {doc.extraction?.invoiceTotal 
                          ? `${Number(doc.extraction.invoiceTotal).toLocaleString('ro-RO')} ${doc.extraction.currency || 'RON'}`
                          : '—'}
                      </p>
                      <Badge variant="success" size="sm">✓ UBL Validat</Badge>
                    </div>
                  </div>
                ))}

                {documents.length === 0 && (
                  <p className="text-zinc-400 italic py-4 text-center">Nicio factură încărcată încă.</p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Procurement Request Modal */}
      <ProcurementRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialCategory={modalCategory}
        initialSupplierName={modalSupplier}
        initialAnnualSpend={modalSpend}
        opportunityId={modalOppId}
        opportunityTitle={modalTitle}
      />
    </div>
  );
}
