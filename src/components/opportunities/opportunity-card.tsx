'use client';

import React, { useState } from 'react';
import { SavingsOpportunity } from '@/lib/types';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge, ProvenanceBadge, ConfidenceBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingDown, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { OptimizationModal } from './optimization-modal';

interface OpportunityCardProps {
  opportunity: SavingsOpportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isRequested = opportunity.status === 'requested' || opportunity.status === 'in_progress';

  return (
    <>
      <Card className="flex flex-col justify-between hover:border-zinc-300 transition-all hover:shadow-md">
        <div>
          {/* Header */}
          <div className="p-3.5 sm:p-5 pb-2.5 sm:pb-3 border-b border-zinc-100 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 flex-wrap">
                <Badge variant="default" size="sm">{opportunity.category}</Badge>
                <ProvenanceBadge provenance={opportunity.provenance} />
                <ConfidenceBadge confidence={opportunity.confidenceLevel} />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900 leading-snug">
                {opportunity.title}
              </h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Furnizor: <span className="font-semibold text-zinc-800">{opportunity.supplierName}</span>
              </p>
            </div>
          </div>

          {/* Financial Numbers Bar */}
          <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-zinc-50/80 border-b border-zinc-100 grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Cost Anual Curent</p>
              <p className="text-sm sm:text-base font-bold text-zinc-900 font-mono mt-0.5">
                {opportunity.currentAnnualCost.toLocaleString('ro-RO')} lei/an
              </p>
            </div>

            <div>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-emerald-700 font-medium flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Economie Estimată</span>
              </p>
              <p className="text-sm sm:text-base font-bold text-emerald-600 font-mono mt-0.5">
                {opportunity.estimatedSavingsMin.toLocaleString('ro-RO')} – {opportunity.estimatedSavingsMax.toLocaleString('ro-RO')} lei
              </p>
            </div>
          </div>

          {/* Body: Reason & Benchmark Provenance */}
          <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-3.5 text-xs text-zinc-600">
            <div>
              <p className="font-semibold text-zinc-900 mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>De ce plătești prea mult:</span>
              </p>
              <p className="leading-relaxed text-zinc-700 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60 text-xs">
                {opportunity.reason}
              </p>
            </div>

            {opportunity.benchmarkReference && (
              <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">Sursă date: <strong className="text-zinc-700">{opportunity.benchmarkReference}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-3 sm:p-4 bg-zinc-50/50 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-[11px] text-zinc-500">
            {isRequested ? (
              <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Cerere în curs de analiză SAVE</span>
              </span>
            ) : (
              <span>Risc zero: No Saving, No Fee</span>
            )}
          </div>

          <Button
            size="sm"
            variant={isRequested ? 'secondary' : 'emerald'}
            disabled={isRequested}
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 font-semibold"
          >
            {isRequested ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cerere Trimisă</span>
              </>
            ) : (
              <>
                <span>Redu costul</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Optimization Request Creation Modal */}
      <OptimizationModal
        opportunity={opportunity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
