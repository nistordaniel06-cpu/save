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
  const hasRealData = documents.length > 0 || contracts.length > 0;

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
          <Link href="/onboarding" className="font-semibold underline text-amber-950 hover:text-amber-800">
            Adaugă Organizația Ta Reală →
          </Link>
        </div>
      ) : !hasRealData ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-emerald-950">
              Bine ai venit în {currentOrg.name}! Organizația ta este securizată cu Supabase RLS.
            </p>
            <p className="text-emerald-800 text-[11px]">
              Nu există încă documente sau facturi încărcate. Datele tale financiare vor apărea aici imediat după prima încărcare.
            </p>
          </div>
          <Link href="/dashboard/documents" className="shrink-0">
            <Button size="sm" variant="emerald" className="gap-1.5 font-bold shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Încarcă Primele Documente</span>
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
            Organizație: <strong className="text-zinc-800">{currentOrg.name}</strong> • Analiză automată a facturilor și contractelor B2B.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. SAVE Score */}
        <StatCard
          title="SAVE Score"
          value={`${scoreData.totalScore}/100`}
          subtitle={`Grad ${scoreData.grade} • Sănătate Achiziții`}
          badgeText="Inteligență"
          badgeVariant="purple"
          icon={Zap}
          highlight={true}
        />

        {/* 2. Annual Spend Analysed */}
        <StatCard
          title="Cheltuieli Analizate"
          value={`${spendSummary.totalAnnualSpendRon.toLocaleString('ro-RO')} lei`}
          subtitle={`${spendSummary.monthlyRunRateRon.toLocaleString('ro-RO')} lei / lună`}
          badgeText="Anualizat"
          badgeVariant="default"
          icon={DollarSign}
        />

        {/* 3. Potential Savings (Clearly labeled as ESTIMATED) */}
        <StatCard
          title="Economii Potențiale"
          value={`${savingsSummary.estimatedSavingsMidpointRon.toLocaleString('ro-RO')} lei`}
          subtitle="Identificat comparativ cu piața"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {opportunities.slice(0, 3).map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
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
            {contracts.slice(0, 3).map((ctr) => {
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
            })}
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
            {documents.slice(0, 3).map((doc) => (
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
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
