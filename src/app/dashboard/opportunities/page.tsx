'use client';

import React, { useState } from 'react';
import { useSave } from '@/lib/context';
import { calculateSavingsSummary } from '@/lib/analytics/savings-calculator';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingDown, ShieldCheck, CheckCircle2, Filter } from 'lucide-react';
import { OpportunityConfidence, OpportunityProvenance } from '@/lib/types';

export default function OpportunitiesPage() {
  const { opportunities, verifiedSavings } = useSave();
  const [selectedConfidence, setSelectedConfidence] = useState<string>('all');
  const [selectedProvenance, setSelectedProvenance] = useState<string>('all');

  const savingsSummary = calculateSavingsSummary(opportunities, verifiedSavings);

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesConfidence = selectedConfidence === 'all' || opp.confidenceLevel === selectedConfidence;
    const matchesProvenance = selectedProvenance === 'all' || opp.provenance === selectedProvenance;
    return matchesConfidence && matchesProvenance;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-emerald-600" />
          <span>Oportunități de Economisire & Recomandări Inteligente</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Identificate automat prin compararea prețurilor tale cu benchmark-urile reale B2B din România. Proveniența fiecărui calcul este 100% transparentă.
        </p>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Economii Estimate Totale"
          value={`${savingsSummary.estimatedSavingsMidpointRon.toLocaleString('ro-RO')} lei`}
          subtitle="Interval 38.200 – 42.000 lei/an"
          badgeText="ESTIMAT"
          badgeVariant="warning"
          icon={TrendingDown}
          highlight={true}
        />
        <StatCard
          title="Oportunități Deschise"
          value={savingsSummary.openOpportunitiesCount}
          subtitle="Gata pentru renegociere"
          badgeText="Active"
          badgeVariant="purple"
          icon={Sparkles}
        />
        <StatCard
          title="Economii Verificate"
          value={`${savingsSummary.verifiedSavingsRon.toLocaleString('ro-RO')} lei`}
          subtitle="Validat prin contracte noi"
          badgeText="VERIFICAT"
          badgeVariant="success"
          icon={CheckCircle2}
        />
        <StatCard
          title="Grad Încredere Ridicată"
          value={`${savingsSummary.savingsByConfidence.high.toLocaleString('ro-RO')} lei`}
          subtitle="Bazat pe oferte reale & audit"
          badgeText="Scor > 85%"
          badgeVariant="default"
          icon={ShieldCheck}
        />
      </div>

      {/* Provenance & Methodology Disclaimer */}
      <div className="p-4 rounded-xl bg-zinc-900 text-white text-xs space-y-1.5 border border-zinc-800 shadow-md">
        <div className="flex items-center gap-2 font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Politica SAVE privind Proveniența Datelor (Zero Benchmarks Inventate)</span>
        </div>
        <p className="text-zinc-300 leading-relaxed text-[11px]">
          Fiecare oportunitate afișată mai jos este marcată cu proveniența exactă a datelor: <strong>Audit Manual SAVE</strong> (verificat de analist), <strong>Ofertă Partener</strong> (preț cotat oficial de furnizor agreat), sau <strong>Benchmark Piață RO</strong> (dataset agregat anonimizat). Nu folosim medii teoretice nerealiste.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-700">Filtrează după:</span>

          <select
            value={selectedConfidence}
            onChange={(e) => setSelectedConfidence(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 bg-white focus:ring-2 focus:ring-zinc-900 cursor-pointer"
          >
            <option value="all">Toate Nivelurile de Încredere</option>
            <option value="high">Încredere Ridicată</option>
            <option value="medium">Încredere Medie</option>
            <option value="low">Încredere Scăzută</option>
          </select>

          <select
            value={selectedProvenance}
            onChange={(e) => setSelectedProvenance(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 bg-white focus:ring-2 focus:ring-zinc-900 cursor-pointer"
          >
            <option value="all">Toate Sursele de Date</option>
            <option value="manually_verified">Audit Manual SAVE</option>
            <option value="supplier_quote">Ofertă Partener Cotată</option>
            <option value="dataset_source">Benchmark Piață RO</option>
          </select>
        </div>

        <p className="text-xs text-zinc-500 font-mono">
          {filteredOpportunities.length} oportunități afișate
        </p>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpportunities.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
      </div>
    </div>
  );
}
