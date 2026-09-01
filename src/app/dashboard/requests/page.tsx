'use client';

import React, { useState } from 'react';
import { useSave } from '@/lib/context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowRightLeft, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Zap, 
  TrendingDown, 
  ShieldCheck, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { OptimizationRequest, OptimizationStatus } from '@/lib/types';
import { clsx } from 'clsx';

const STATUS_STEPS: Array<{ id: OptimizationStatus; label: string; description: string }> = [
  { id: 'new', label: '1. Nou', description: 'Cerere recepționată' },
  { id: 'under_review', label: '2. În Evaluare', description: 'Analiză contract SAVE' },
  { id: 'requesting_offers', label: '3. Cerere Oferte', description: 'Negociere parteneri' },
  { id: 'offer_received', label: '4. Ofertă Primită', description: 'Propunere gata' },
  { id: 'accepted', label: '5. Acceptat', description: 'Acord client' },
  { id: 'completed', label: '6. Finalizat', description: 'Contract semnat' },
  { id: 'savings_verified', label: '7. Economii Confirmate', description: 'Economie validată' },
];

export default function RequestsPage() {
  const { optimizationRequests, verifyOptimizationSavings } = useSave();
  const [selectedRequest, setSelectedRequest] = useState<OptimizationRequest | null>(
    optimizationRequests.length > 0 ? optimizationRequests[0] : null
  );

  const getStatusBadge = (status: OptimizationStatus) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" size="sm">1. Nou</Badge>;
      case 'under_review':
        return <Badge variant="warning" size="sm">2. În Evaluare SAVE</Badge>;
      case 'requesting_offers':
        return <Badge variant="info" size="sm">3. Cerere Oferte</Badge>;
      case 'offer_received':
        return <Badge variant="purple" size="sm">4. Ofertă Primită!</Badge>;
      case 'accepted':
        return <Badge variant="success" size="sm">5. Acceptat</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm">6. Finalizat</Badge>;
      case 'savings_verified':
        return <Badge variant="success" size="sm">7. Economii Validate</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const getStepIndex = (status: OptimizationStatus) => {
    return STATUS_STEPS.findIndex((s) => s.id === status);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
          <ArrowRightLeft className="w-6 h-6 text-emerald-600" />
          <span>Flux de Optimizare & Renegociere Costuri</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Urmărește stadiul fiecărei cereri de reducere de cost, de la analiza inițială a contractului până la confirmarea economiilor obținute.
        </p>
      </div>

      {optimizationRequests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 mx-auto">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900">Nu există cereri active de optimizare</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Mergi în secțiunea Oportunități și apasă butonul „Redu costul” pentru a iniția un proces de renegociere cu ajutorul echipei SAVE.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Requests List */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight uppercase">
              Cereri în Lucru ({optimizationRequests.length})
            </h2>

            {optimizationRequests.map((req) => {
              const isSelected = selectedRequest?.id === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={clsx(
                    'p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-2',
                    isSelected
                      ? 'bg-white border-zinc-900 shadow-md ring-1 ring-zinc-900/10'
                      : 'bg-zinc-50/80 border-zinc-200 hover:border-zinc-300 hover:bg-white'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-zinc-900 text-sm">
                        {req.supplierName}
                      </h4>
                      <p className="text-zinc-500 text-[11px] mt-0.5">
                        {req.opportunityTitle || 'Optimizare cost general'}
                      </p>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-zinc-600 font-mono text-[11px]">
                    <span>Cost: {req.initialAnnualCost.toLocaleString('ro-RO')} lei/an</span>
                    {req.achievedAnnualSavings > 0 && (
                      <span className="font-bold text-emerald-600">
                        -{req.achievedAnnualSavings.toLocaleString('ro-RO')} lei/an
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Workflow Stepper & Actions */}
          {selectedRequest && (
            <div className="lg:col-span-7 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{selectedRequest.supplierName}</CardTitle>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    <CardDescription>
                      Inițiat de: {selectedRequest.requestedByName} • Data: {new Date(selectedRequest.createdAt).toLocaleDateString('ro-RO')}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Step-by-Step Progress Pipeline */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-zinc-900">Etape Proces de Optimizare:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {STATUS_STEPS.slice(0, 4).map((step, idx) => {
                        const currentIdx = getStepIndex(selectedRequest.status);
                        const isDone = currentIdx >= idx;
                        const isCurrent = currentIdx === idx;
                        return (
                          <div
                            key={step.id}
                            className={clsx(
                              'p-2.5 rounded-lg border text-center transition-all',
                              isCurrent
                                ? 'bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
                                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                            )}
                          >
                            <p className="text-[11px] font-bold truncate">{step.label}</p>
                            <p className="text-[9px] mt-0.5 truncate">{step.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial Comparison Box */}
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">Cost Inițial Anual</p>
                      <p className="text-base font-bold text-zinc-900 font-mono mt-0.5">
                        {selectedRequest.initialAnnualCost.toLocaleString('ro-RO')} lei
                      </p>
                    </div>

                    <div>
                      <p className="text-emerald-700 uppercase tracking-wider text-[10px] font-semibold">Economie Anuală Obținută</p>
                      <p className="text-base font-bold text-emerald-600 font-mono mt-0.5">
                        {selectedRequest.achievedAnnualSavings > 0
                          ? `${selectedRequest.achievedAnnualSavings.toLocaleString('ro-RO')} lei/an`
                          : 'În curs de negociere'}
                      </p>
                    </div>
                  </div>

                  {/* Counter Offer Details if available */}
                  {selectedRequest.counterOfferDetails && (
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-emerald-950">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Ofertă Renegociată Disponibilă</span>
                      </div>
                      <p className="text-emerald-900 leading-relaxed text-[11px]">
                        <strong>Propunere:</strong> {selectedRequest.counterOfferDetails.termsSummary}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 font-mono text-[11px] text-emerald-900">
                        <span>Nou cost anual: {selectedRequest.counterOfferDetails.newAnnualCost?.toLocaleString('ro-RO')} lei</span>
                        <span className="font-bold text-emerald-700">
                          Economie: {selectedRequest.counterOfferDetails.estimatedSavings?.toLocaleString('ro-RO')} lei/an
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Operator Notes & Client Notes */}
                  <div className="space-y-3 text-xs">
                    {selectedRequest.clientNotes && (
                      <div className="p-3 rounded-lg bg-zinc-100/70 border border-zinc-200">
                        <p className="font-semibold text-zinc-800 text-[11px] mb-0.5">Notă din partea companiei tale:</p>
                        <p className="text-zinc-600 text-[11px]">{selectedRequest.clientNotes}</p>
                      </div>
                    )}

                    {selectedRequest.operatorNotes && (
                      <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200">
                        <p className="font-semibold text-blue-900 text-[11px] mb-0.5">Jurnal Specialist SAVE:</p>
                        <p className="text-blue-800 text-[11px]">{selectedRequest.operatorNotes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Contractul nou este semnat doar la acordul tău expres</span>
                  </div>

                  {selectedRequest.status === 'savings_verified' ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Economie Confirmată & Validată de SAVE</span>
                    </div>
                  ) : selectedRequest.status === 'completed' ? (
                    <span className="text-xs text-zinc-500 italic">În curs de auditare & validare finală de către specialistul SAVE</span>
                  ) : null}
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
