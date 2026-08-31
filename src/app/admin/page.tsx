'use client';

import React, { useState } from 'react';
import { useSave } from '@/lib/context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { 
  ShieldCheck, 
  Building2, 
  FileText, 
  ArrowRightLeft, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Lock,
  ChevronRight
} from 'lucide-react';
import { OptimizationStatus } from '@/lib/types';
import { ExtractionReviewModal } from '@/components/documents/extraction-review-modal';

export default function AdminPage() {
  const { 
    organizations, 
    documents, 
    optimizationRequests, 
    opportunities, 
    updateOptimizationStatus,
    verifyOptimizationSavings
  } = useSave();

  const [activeTab, setActiveTab] = useState<'requests' | 'documents' | 'benchmarks' | 'organizations'>('requests');
  const [reviewingDoc, setReviewingDoc] = useState<any>(null);

  const pendingReviewDocs = documents.filter((d) => d.status === 'requires_review');
  const activeRequests = optimizationRequests.filter((r) => r.status !== 'savings_verified' && r.status !== 'completed');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Panou de Control Operațional SAVE (Admin Portal)
            </h1>
            <Badge variant="purple" size="sm">Internal Only</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Gestiune cereri de renegociere, audit extracții AI cu scor de încredere scăzut și menținere benchmark-uri de piață.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-mono">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tenant Isolation Enforced</span>
        </div>
      </div>

      {/* Admin KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Organizații Înrolate"
          value={organizations.length}
          subtitle="Companii SME active"
          badgeText="Tenants"
          badgeVariant="default"
          icon={Building2}
        />
        <StatCard
          title="Cereri Optimizare Active"
          value={activeRequests.length}
          subtitle="În negociere cu furnizorii"
          badgeText="Workflows"
          badgeVariant="warning"
          icon={ArrowRightLeft}
        />
        <StatCard
          title="Documente în Revizuire"
          value={pendingReviewDocs.length}
          subtitle="Scor încredere < 85%"
          badgeText={pendingReviewDocs.length > 0 ? "Audit Necesar" : "Curat"}
          badgeVariant={pendingReviewDocs.length > 0 ? "danger" : "success"}
          icon={FileText}
        />
        <StatCard
          title="Economii Totale Generate"
          value={`${optimizationRequests.reduce((sum, r) => sum + r.achievedAnnualSavings, 0).toLocaleString('ro-RO')} lei`}
          subtitle="Comisioane No Saving No Fee"
          badgeText="Performanță"
          badgeVariant="success"
          icon={CheckCircle2}
        />
      </div>

      {/* Strict Privacy Governance Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Regulă de Aur de Securitate & Confidențialitate Comercială:</p>
          <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
            Nu trimiteți documente brute ale clienților (PDF/scanări) către furnizori neautorizați. Cererile de ofertă transmise partenerilor trebuie să conțină exclusiv cerințe tehnice și volumetrice anonimizate (ex: „24 abonamente voce/date”, „600 expedieri lunare”).
          </p>
        </div>
      </div>

      {/* Segmented Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'requests' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Flux Cereri Optimizare ({optimizationRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'documents' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Coadă Audit Extracții AI ({pendingReviewDocs.length})
        </button>
        <button
          onClick={() => setActiveTab('organizations')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'organizations' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Organizații Înregistrate ({organizations.length})
        </button>
      </div>

      {/* Tab 1: Optimization Requests Management */}
      {activeTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle>Gestiune Cereri de Negociere & Actualizare Stadiu</CardTitle>
            <CardDescription>
              Permite operatorilor SAVE să modifice statusul, să adauge notițe de negociere și să confirme noile oferte obținute.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-700 uppercase">
                  <tr>
                    <th className="px-4 py-3">Organizație & Solicitant</th>
                    <th className="px-4 py-3">Furnizor Vizat</th>
                    <th className="px-4 py-3">Cost Inițial vs Țintă</th>
                    <th className="px-4 py-3">Status Curent</th>
                    <th className="px-4 py-3 text-right">Schimbă Status / Validează</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {optimizationRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-zinc-50/80">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-zinc-900">{req.organizationName || 'Nova Retail SRL'}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{req.requestedByName}</p>
                      </td>

                      <td className="px-4 py-3.5 font-medium text-zinc-900">
                        {req.supplierName}
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <p className="text-zinc-900 font-bold">{req.initialAnnualCost.toLocaleString('ro-RO')} lei</p>
                        {req.achievedAnnualSavings > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            Economie: {req.achievedAnnualSavings.toLocaleString('ro-RO')} lei
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant={req.status === 'savings_verified' ? 'success' : req.status === 'offer_received' ? 'purple' : 'warning'}
                          size="sm"
                        >
                          {req.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={req.status}
                            onChange={(e) => updateOptimizationStatus(req.id, e.target.value as OptimizationStatus)}
                            className="text-xs px-2 py-1 rounded border border-zinc-300 bg-white cursor-pointer"
                          >
                            <option value="new">1. New</option>
                            <option value="under_review">2. Under Review</option>
                            <option value="requesting_offers">3. Requesting Offers</option>
                            <option value="offer_received">4. Offer Received</option>
                            <option value="accepted">5. Accepted</option>
                            <option value="completed">6. Completed</option>
                            <option value="savings_verified">7. Savings Verified</option>
                          </select>

                          {req.status !== 'savings_verified' && (
                            <Button
                              size="sm"
                              variant="emerald"
                              onClick={() => verifyOptimizationSavings(req.id, 3900)}
                              className="h-7 text-xs px-2"
                            >
                              Confirmă 3.900 lei
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Document Extraction Queue */}
      {activeTab === 'documents' && (
        <Card>
          <CardHeader>
            <CardTitle>Coadă de Audit & Documente cu Încredere Scăzută</CardTitle>
            <CardDescription>
              Documentele marcate de pipeline-ul AI pentru verificare umană.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingReviewDocs.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                Nu există documente în așteptarea revizuirii manuale. Toate documentele au trecut validarea automată.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviewDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900">{doc.fileName}</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Scor încredere: <strong>{doc.extraction?.confidence}%</strong> • {doc.extraction?.reviewNotes}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setReviewingDoc(doc)}
                      className="gap-1"
                    >
                      <span>Auditează Acum</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Organizations */}
      {activeTab === 'organizations' && (
        <Card>
          <CardHeader>
            <CardTitle>Organizații Înregistrate & Indicatori de Spend</CardTitle>
            <CardDescription>Companii client înrolate pe platforma SAVE.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-zinc-900 text-sm">{org.name}</p>
                      {org.isDemo && <Badge variant="subtle" size="sm">Demo Org</Badge>}
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      CUI: {org.cui || 'N/A'} • Industrie: {org.industry} • Angajați: {org.employeeRange}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-bold text-zinc-900">
                      Cheltuieli: {org.monthlyOpexRon.toLocaleString('ro-RO')} lei/lună
                    </p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      SAVE Score: {org.saveScore}/100
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Modal for Admin */}
      {reviewingDoc && (
        <ExtractionReviewModal
          document={reviewingDoc}
          isOpen={!!reviewingDoc}
          onClose={() => setReviewingDoc(null)}
        />
      )}
    </div>
  );
}
