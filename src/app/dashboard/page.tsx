'use client';

import React from 'react';
import Link from 'next/link';
import { useSave } from '@/lib/context';
import { calculateSpendSummary } from '@/lib/analytics/spend-calculator';
import { calculateSavingsSummary, calculateSaveScore } from '@/lib/analytics/savings-calculator';
import { calculateContractRadar } from '@/lib/analytics/contract-calculator';
import { StatCard } from '@/components/ui/stat-card';
import { SpendChart } from '@/components/dashboard/spend-chart';
import { SaveScoreCard } from '@/components/dashboard/save-score-card';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { 
  DollarSign, 
  TrendingDown, 
  CheckCircle2, 
  FileCheck, 
  AlertTriangle, 
  Zap, 
  ArrowRight,
  Upload,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { currentOrg, spendRecords, contracts, opportunities, verifiedSavings, documents } = useSave();

  const spendSummary = calculateSpendSummary(spendRecords);
  const savingsSummary = calculateSavingsSummary(opportunities, verifiedSavings, spendSummary.totalAnnualSpendRon);
  const contractRadar = calculateContractRadar(contracts);
  const scoreData = calculateSaveScore(spendSummary.totalAnnualSpendRon, contracts, opportunities);

  const isDemo = currentOrg.isDemo;
  const hasRealData = (documents && documents.length > 0) || (contracts && contracts.length > 0) || (spendRecords && spendRecords.length > 0);

  const saveScoreDisplay = hasRealData ? `${scoreData.totalScore}/100` : '—';
  const saveScoreSubtitle = hasRealData ? `Grad ${scoreData.grade} • Sănătate Achiziții` : 'Date insuficiente pentru calcul';
  
  const spendDisplay = `${spendSummary.totalAnnualSpendRon.toLocaleString('ro-RO')} lei`;
  const spendSubtitle = `${spendSummary.monthlyRunRateRon.toLocaleString('ro-RO')} lei / lună`;
  
  const savingsDisplay = hasRealData && savingsSummary.estimatedSavingsMidpointRon > 0 
    ? `${savingsSummary.estimatedSavingsMidpointRon.toLocaleString('ro-RO')} lei` 
    : '—';
  const savingsSubtitle = hasRealData ? 'Identificat comparativ cu piața' : 'Necesită documente pentru audit';

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
      ) : !hasRealData ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-emerald-950">
              Bine ai venit în {currentOrg.name || 'organizația ta'}! Contul tău este securizat prin Supabase RLS.
            </p>
            <p className="text-emerald-800 text-[11px]">
              Nu există încă documente sau facturi încărcate. Datele tale financiare vor apărea aici imediat după prima încărcare.
            </p>
          </div>
          <Link href="/dashboard/documents" className="shrink-0">
            <Button size="sm" variant="emerald" className="gap-1.5 font-bold shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Încarcă Documente</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              <strong>Organizație Reală Activă:</strong> Date confidențiale izolate prin Row-Level Security.
            </span>
          </div>
          <Badge variant="success" size="sm">Supabase Sync Activ</Badge>
        </div>
      )}

      {/* Executive Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Tablou de Bord Achiziții & Economii
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Organizație: <strong className="text-zinc-800">{currentOrg.name || 'Companie'}</strong> • Analiză automată a facturilor și contractelor B2B.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/documents">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>Încarcă Facturi Noi</span>
            </Button>
          </Link>
          <Link href="/dashboard/opportunities">
            <Button size="sm" variant="emerald" className="gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Activează Economii</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. SAVE Score */}
        <StatCard
          title="SAVE Score"
          value={saveScoreDisplay}
          subtitle={saveScoreSubtitle}
          badgeText="Inteligență"
          badgeVariant="purple"
          icon={Zap}
          highlight={true}
        />

        {/* 2. Annual Spend Analysed */}
        <StatCard
          title="Cheltuieli Analizate"
          value={spendDisplay}
          subtitle={spendSubtitle}
          badgeText="Anualizat"
          badgeVariant="default"
          icon={DollarSign}
        />

        {/* 3. Potential Savings (Clearly labeled as ESTIMATED) */}
        <StatCard
          title="Economii Potențiale"
          value={savingsDisplay}
          subtitle={savingsSubtitle}
          badgeText="ESTIMAT"
          badgeVariant="warning"
          icon={TrendingDown}
          highlight={true}
        />

        {/* 4. Verified Savings (Clearly labeled as VERIFIED) */}
        <StatCard
          title="Economii Verificate"
          value={`${savingsSummary.verifiedSavingsRon.toLocaleString('ro-RO')} lei`}
          subtitle="Contracte noi semnate"
          badgeText="VERIFICAT"
          badgeVariant="success"
          icon={CheckCircle2}
        />

        {/* 5. Contracts Monitored */}
        <StatCard
          title="Contracte Monitorizate"
          value={contracts.length}
          subtitle={`${spendSummary.recurringPercentage}% din cheltuieli`}
          badgeText="Active"
          badgeVariant="info"
          icon={FileCheck}
        />

        {/* 6. Upcoming Renewals */}
        <StatCard
          title="Reînnoiri Iminente"
          value={contractRadar.expiringIn60Days.length}
          subtitle="În următoarele 60 de zile"
          badgeText={contractRadar.expiringIn30Days.length > 0 ? "URGENT" : "Atenție"}
          badgeVariant={contractRadar.expiringIn30Days.length > 0 ? "danger" : "warning"}
          icon={AlertTriangle}
        />
      </div>

      {/* Onboarding Empty State Card for Brand New Real Accounts */}
      {!hasRealData && !isDemo && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
            <div className="space-y-1.5 max-w-xl">
              <Badge variant="success" size="sm">Pasul Următor</Badge>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                Încarcă prima factură sau primul contract
              </h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                După procesarea documentelor, SAVE va începe să construiască profilul de cheltuieli al companiei tale și va calcula potențialul real de economisire.
              </p>
            </div>
            <Link href="/dashboard/documents" className="shrink-0">
              <Button size="lg" variant="emerald" className="gap-2 font-bold shadow-md shadow-emerald-500/20">
                <Upload className="w-4 h-4" />
                <span>Încarcă Documente</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 font-bold font-mono text-[11px] flex items-center justify-center">
                1
              </div>
              <h3 className="font-semibold text-zinc-900">Extracție Documente</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Încarcă facturi PDF sau XML e-Factura. Datele sunt parsate automat cu acuratețe strictă.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 font-bold font-mono text-[11px] flex items-center justify-center">
                2
              </div>
              <h3 className="font-semibold text-zinc-900">Calcul SAVE Score</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Generăm analiza de conformitate, acoperire contractuală și radarul de preaviz.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 font-bold font-mono text-[11px] flex items-center justify-center">
                3
              </div>
              <h3 className="font-semibold text-zinc-900">Oportunități de Economii</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Descoperi tarife benchmark mai bune și poți activa licitații agregate în Demand Pools.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SAVE Score Deep-Dive Gauge */}
      <SaveScoreCard scoreData={scoreData} />

      {/* Spend Distribution Chart */}
      <SpendChart summary={spendSummary} />

      {/* Top Savings Opportunities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Oportunități Prioritare de Reducere a Costurilor</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Calculat pe baza tarifelor din facturi și a benchmark-urilor B2B din România.
            </p>
          </div>
          <Link
            href="/dashboard/opportunities"
            className="text-xs font-semibold text-zinc-900 hover:text-emerald-600 flex items-center gap-1"
          >
            <span>Vezi toate oportunitățile ({opportunities.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {opportunities.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 bg-white rounded-2xl border border-dashed border-zinc-200">
            <Sparkles className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
            <p className="font-semibold text-zinc-700">Nu există încă oportunități de optimizare</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Încarcă facturi în format PDF sau XML e-Factura pentru a declanșa auditul automat de economii.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunities.slice(0, 3).map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </div>

      {/* Contracts Expiration Radar & Recent Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Contracts Renewal Window */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Radar Reînnoiri & Termene Preaviz</span>
              </CardTitle>
              <CardDescription>
                Nu lăsa contractele să se prelungească tacit la tarife vechi.
              </CardDescription>
            </div>
            <Link
              href="/dashboard/contracts"
              className="text-xs font-semibold text-zinc-900 hover:text-emerald-600 flex items-center gap-1"
            >
              <span>Toate ({contracts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {contracts.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                <p className="font-medium text-zinc-700">Niciun contract înregistrat</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Adaugă contracte pentru a monitoriza termenele de preaviz și reînnoire.</p>
              </div>
            ) : (
              contracts.slice(0, 3).map((ctr) => {
                const isUrgent = (ctr.daysUntilExpiry ?? 999) <= 30;
                return (
                  <div
                    key={ctr.id}
                    className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900 truncate max-w-xs">{ctr.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                        <span>{ctr.supplierName}</span>
                        <span>•</span>
                        <span>{ctr.annualValue.toLocaleString('ro-RO')} lei/an</span>
                      </div>
                    </div>

                    <div className="text-right">
                      {isUrgent ? (
                        <Badge variant="danger" size="sm">
                          Expiră în {ctr.daysUntilExpiry} zile!
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Expiră în {ctr.daysUntilExpiry} zile
                        </Badge>
                      )}
                      <p className="text-[10px] text-zinc-400 font-mono mt-1">
                        Preaviz: {ctr.noticeDeadline}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Processed Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Documente Recente & Extracție AI</span>
              </CardTitle>
              <CardDescription>
                Istoricul facturilor și contractelor procesate automat.
              </CardDescription>
            </div>
            <Link
              href="/dashboard/documents"
              className="text-xs font-semibold text-zinc-900 hover:text-emerald-600 flex items-center gap-1"
            >
              <span>Arhivă ({documents.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                <p className="font-medium text-zinc-700">Niciun document procesat</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Trage prima factură pentru a iniția analiza automată.</p>
              </div>
            ) : (
              documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs"
                >
                  <div className="truncate max-w-xs">
                    <p className="font-semibold text-zinc-900 truncate">{doc.fileName}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {doc.supplierName || 'În curs de identificare...'} • {doc.extraction?.invoiceTotal ? `${doc.extraction.invoiceTotal.toLocaleString('ro-RO')} lei` : '—'}
                    </p>
                  </div>

                  <div className="text-right">
                    {doc.status === 'requires_review' ? (
                      <Badge variant="warning" size="sm">Necesită Revizuire</Badge>
                    ) : (
                      <Badge variant="success" size="sm">Scor {doc.extraction?.confidence || 90}%</Badge>
                    )}
                    <p className="text-[10px] text-zinc-400 font-mono mt-1">
                      {new Date(doc.createdAt).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
