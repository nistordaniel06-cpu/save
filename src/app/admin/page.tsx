'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ChevronRight,
  Globe,
  Users,
  TrendingUp,
  Layers,
  Plus
} from 'lucide-react';
import { OptimizationStatus, VerifiedDemandStatus, SpendCategory } from '@/lib/types';
import { ExtractionReviewModal } from '@/components/documents/extraction-review-modal';

export default function AdminPage() {
  const { 
    organizations, 
    documents, 
    optimizationRequests, 
    opportunities, 
    updateOptimizationStatus,
    verifyOptimizationSavings,
    verifiedDemands,
    demandPools,
    demandPoolMembers,
    supplierBids,
    marketplaceSuppliers,
    updateVerifiedDemandStatus,
    createDemandPool,
    selectWinningBidAndGenerateOffers
  } = useSave();

  const [activeTab, setActiveTab] = useState<'requests' | 'verified_demand' | 'demand_pools' | 'supplier_bids' | 'documents' | 'organizations'>('requests');
  const [reviewingDoc, setReviewingDoc] = useState<any>(null);

  // Pool creation inline form state
  const [newPoolTitle, setNewPoolTitle] = useState('');
  const [newPoolCategory, setNewPoolCategory] = useState<SpendCategory>('Telecom');
  const [newPoolServiceType, setNewPoolServiceType] = useState('Flotă SIM Voce & Date Mobile');
  const [showNewPoolForm, setShowNewPoolForm] = useState(false);

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

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Mergi la Dashboard Client</span>
          </Link>
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
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'requests' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Flux Cereri Optimizare ({optimizationRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('verified_demand')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'verified_demand' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Cerere Verificată ({verifiedDemands.length})
        </button>
        <button
          onClick={() => setActiveTab('demand_pools')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'demand_pools' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Demand Pools ({demandPools.length})
        </button>
        <button
          onClick={() => setActiveTab('supplier_bids')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'supplier_bids' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Oferte Furnizori ({supplierBids.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'documents' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Coadă Audit Extracții AI ({pendingReviewDocs.length})
        </button>
        <button
          onClick={() => setActiveTab('organizations')}
          className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'organizations' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Organizații ({organizations.length})
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
                              onClick={() => {
                                const savings = req.achievedAnnualSavings > 0 
                                  ? req.achievedAnnualSavings 
                                  : (req.counterOfferDetails?.estimatedSavings || Math.round(req.initialAnnualCost * 0.2));
                                verifyOptimizationSavings(req.id, savings);
                              }}
                              className="h-7 text-xs px-2"
                            >
                              Validează Economie ({req.achievedAnnualSavings > 0 ? `${req.achievedAnnualSavings.toLocaleString('ro-RO')} lei` : 'Calculat'})
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

      {/* Tab 2: Verified Demand Management */}
      {activeTab === 'verified_demand' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestiune Cereri Comerciale Verificate (Verified Demands)</CardTitle>
                <CardDescription>
                  Cereri derivate automat din facturi e-Factura și contracte semnate de IMM-uri.
                </CardDescription>
              </div>
              <Badge variant="purple" size="sm">{verifiedDemands.length} cereri</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-700 uppercase">
                  <tr>
                    <th className="px-4 py-3">Organizație & Categorie</th>
                    <th className="px-4 py-3">Tip Serviciu & Furnizor Actual</th>
                    <th className="px-4 py-3">Volum & Tarif</th>
                    <th className="px-4 py-3">Cost Anual</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Acțiuni Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-sans">
                  {verifiedDemands.map((demand) => (
                    <tr key={demand.id} className="hover:bg-zinc-50/80">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-zinc-900">{demand.organizationName || 'Nova Retail SRL'}</p>
                        <Badge variant="default" size="sm" className="mt-0.5">{demand.category}</Badge>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-medium text-zinc-900">{demand.serviceType}</p>
                        <p className="text-[11px] text-zinc-400">Actual: {demand.incumbentSupplierName}</p>
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <p className="font-bold text-zinc-900">{demand.volume} {demand.unit}</p>
                        {demand.currentUnitPrice && (
                          <span className="text-[10px] text-zinc-500">
                            {demand.currentUnitPrice} lei/{demand.unit}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <p className="font-bold text-zinc-900">{demand.currentAnnualCost.toLocaleString('ro-RO')} lei</p>
                        <span className="text-[10px] text-zinc-400">{demand.currentMonthlyCost.toLocaleString('ro-RO')} lei/lună</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge 
                          variant={
                            demand.status === 'pooled' ? 'success' : 
                            demand.status === 'pool_eligible' ? 'purple' : 
                            demand.status === 'offer_available' ? 'success' : 'warning'
                          }
                          size="sm"
                        >
                          {demand.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {demand.status === 'detected' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => updateVerifiedDemandStatus(demand.id, 'verified')}
                              className="h-7 text-xs px-2"
                            >
                              Validează
                            </Button>
                          )}

                          {demand.status === 'verified' && (
                            <Button
                              size="sm"
                              variant="purple"
                              onClick={() => updateVerifiedDemandStatus(demand.id, 'pool_eligible')}
                              className="h-7 text-xs px-2"
                            >
                              Setează Eligibil Pool
                            </Button>
                          )}

                          {demand.status === 'pool_eligible' && (
                            <span className="text-[11px] text-purple-700 font-semibold">Gata de agregare</span>
                          )}
                          {demand.status === 'pooled' && (
                            <span className="text-[11px] text-emerald-700 font-semibold">Înscris în Pool</span>
                          )}
                          {demand.status === 'offer_available' && (
                            <span className="text-[11px] text-emerald-600 font-bold">Ofertă emisă</span>
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

      {/* Tab 3: Demand Pools Management */}
      {activeTab === 'demand_pools' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestiune Demand Pools (Grupuri de Cumpărare IMM)</CardTitle>
                <CardDescription>
                  Volume agregate expuse furnizorilor conform pragului MIN_ANONYMOUS_POOL_MEMBERS = 3.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="purple"
                onClick={() => setShowNewPoolForm(!showNewPoolForm)}
                className="gap-1.5 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Creează Demand Pool Nou</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showNewPoolForm && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-3 text-xs">
                <p className="font-bold text-purple-950">Inițiere Grup Nou de Cumpărare Agregată</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Categorie</label>
                    <select
                      value={newPoolCategory}
                      onChange={(e) => setNewPoolCategory(e.target.value as SpendCategory)}
                      className="w-full p-2 rounded-lg border border-purple-300 bg-white"
                    >
                      <option value="Telecom">Telecom</option>
                      <option value="Curierat">Curierat</option>
                      <option value="Software">Software</option>
                      <option value="Energie">Energie</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Titlu Grup</label>
                    <input
                      type="text"
                      value={newPoolTitle}
                      onChange={(e) => setNewPoolTitle(e.target.value)}
                      placeholder="ex: Grup IMM Abonamente Date Nelimitat"
                      className="w-full p-2 rounded-lg border border-purple-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Tip Serviciu</label>
                    <input
                      type="text"
                      value={newPoolServiceType}
                      onChange={(e) => setNewPoolServiceType(e.target.value)}
                      placeholder="ex: Flotă SIM Voce & Date"
                      className="w-full p-2 rounded-lg border border-purple-300 bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowNewPoolForm(false)}>
                    Anulează
                  </Button>
                  <Button
                    size="sm"
                    variant="purple"
                    disabled={!newPoolTitle}
                    onClick={async () => {
                      await createDemandPool({
                        category: newPoolCategory,
                        serviceType: newPoolServiceType,
                        title: newPoolTitle,
                        region: 'Național',
                        currency: 'RON',
                        status: 'building',
                      });
                      setShowNewPoolForm(false);
                      setNewPoolTitle('');
                    }}
                  >
                    Salvează Pool
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-700 uppercase">
                  <tr>
                    <th className="px-4 py-3">Grup & Categorie</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Companii Membre</th>
                    <th className="px-4 py-3">Volum Cumulat</th>
                    <th className="px-4 py-3">Spend Anual Agregat</th>
                    <th className="px-4 py-3 text-right">Control Licitare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {demandPools.map((pool) => (
                    <tr key={pool.id} className="hover:bg-zinc-50/80">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-zinc-900">{pool.title}</p>
                        <p className="text-[11px] text-zinc-400">{pool.serviceType} • {pool.region}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge 
                          variant={
                            pool.status === 'open_for_bids' ? 'warning' :
                            pool.status === 'offers_ready' ? 'success' :
                            pool.status === 'ready' ? 'purple' : 'default'
                          } 
                          size="sm"
                        >
                          {pool.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-zinc-900">
                        {pool.totalCompanies} IMM-uri
                        {pool.totalCompanies < 3 && (
                          <span className="block text-[10px] text-amber-600 font-sans font-normal">Sub prag (min. 3)</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-zinc-900">
                        {pool.totalVolume}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-600">
                        ~{pool.totalCurrentAnnualSpend.toLocaleString('ro-RO')} lei
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[11px] text-zinc-400">
                          {pool.status === 'open_for_bids' ? 'Licitare activă în portal' : 'Administrat'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Supplier Bids & Selection */}
      {activeTab === 'supplier_bids' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Oferte Depuse de Furnizori & Selecție Câștigătoare</CardTitle>
                <CardDescription>
                  Compară cotațiile primite de la furnizori și emite automat oferte individuale membrilor.
                </CardDescription>
              </div>
              <Badge variant="purple" size="sm">{supplierBids.length} oferte</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-700 uppercase">
                  <tr>
                    <th className="px-4 py-3">Demand Pool</th>
                    <th className="px-4 py-3">Furnizor Marketplace</th>
                    <th className="px-4 py-3">Tarif Unitar</th>
                    <th className="px-4 py-3">Valoare Totală Anuală</th>
                    <th className="px-4 py-3">Durată & Volum</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Decizie SAVE Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {supplierBids.map((bid) => {
                    const pool = demandPools.find((p) => p.id === bid.demandPoolId);

                    return (
                      <tr key={bid.id} className="hover:bg-zinc-50/80">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-zinc-900">{pool?.title || 'Demand Pool'}</p>
                          <Badge variant="default" size="sm" className="mt-0.5">{pool?.category}</Badge>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-bold text-zinc-900">{bid.marketplaceSupplierName}</p>
                          <p className="text-[10px] text-zinc-400">{bid.slaSummary}</p>
                        </td>

                        <td className="px-4 py-3.5 font-mono font-bold text-zinc-900">
                          {bid.pricePerUnit} lei / unitate
                        </td>

                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-600">
                          ~{bid.estimatedAnnualTotal.toLocaleString('ro-RO')} lei
                        </td>

                        <td className="px-4 py-3.5 font-mono text-zinc-700">
                          {bid.contractDurationMonths} luni (min. {bid.minimumVolume})
                        </td>

                        <td className="px-4 py-3.5">
                          <Badge 
                            variant={bid.status === 'selected' ? 'success' : bid.status === 'shortlisted' ? 'purple' : 'warning'} 
                            size="sm"
                          >
                            {bid.status}
                          </Badge>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          {bid.status !== 'selected' ? (
                            <Button
                              size="sm"
                              variant="emerald"
                              onClick={() => selectWinningBidAndGenerateOffers(bid.id)}
                              className="gap-1 h-7 text-xs font-bold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selectează & Emite Oferte</span>
                            </Button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Ofertă Câștigătoare</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
