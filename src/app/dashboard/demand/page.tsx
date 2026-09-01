'use client';

import React, { useState } from 'react';
import { useSave } from '@/lib/context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  TrendingDown, 
  Zap, 
  Clock, 
  Check, 
  X,
  FileCheck2,
  Sparkles,
  Lock
} from 'lucide-react';
import { VerifiedDemand, DemandPool, ClientOffer, SpendCategory } from '@/lib/types';
import Link from 'next/link';

export default function DemandPage() {
  const { 
    currentOrg,
    verifiedDemands, 
    demandPools, 
    demandPoolMembers, 
    clientOffers,
    poolInterests,
    submitPoolInterest,
    joinDemandPool, 
    withdrawFromDemandPool, 
    acceptClientOffer, 
    rejectClientOffer,
    isDemoMode,
  } = useSave();

  const [joiningPoolId, setJoiningPoolId] = useState<string | null>(null);
  const [selectedDemandForJoin, setSelectedDemandForJoin] = useState<string>('');
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Proposal modal state
  const [isProposingCategory, setIsProposingCategory] = useState(false);
  const [propCategory, setPropCategory] = useState<SpendCategory>('Curierat');
  const [propSpend, setPropSpend] = useState<string>('5000');
  const [propVolume, setPropVolume] = useState<string>('300');
  const [propUnit, setPropUnit] = useState<string>('colete / lună');
  const [propNotes, setPropNotes] = useState<string>('');
  const [isSubmittingProp, setIsSubmittingProp] = useState(false);

  // Filter demands for current org
  const myDemands = verifiedDemands.filter((d) => d.organizationId === currentOrg.id);

  // Active pool memberships for current org
  const activeMemberships = demandPoolMembers.filter(
    (m) => m.organizationId === currentOrg.id && m.consentStatus === 'accepted'
  );
  const activePoolIds = new Set(activeMemberships.map((m) => m.demandPoolId));
  const myActivePools = demandPools.filter((p) => activePoolIds.has(p.id));

  // Available pools not yet joined
  const availablePools = demandPools.filter((p) => !activePoolIds.has(p.id) && p.status !== 'closed');

  // Offers for current org
  const myOffers = clientOffers.filter((o) => o.organizationId === currentOrg.id);

  // User's submitted pool interests
  const myPoolInterests = (poolInterests || []).filter(
    (pi) => !currentOrg.id || pi.organizationId === currentOrg.id
  );

  const handleJoinPool = async (poolId: string, demandId: string) => {
    if (!consentChecked) return;
    await joinDemandPool(demandId, poolId);
    setJoiningPoolId(null);
    setSelectedDemandForJoin('');
    setConsentChecked(false);
    setActionSuccessMessage('Te-ai alăturat grupului cu succes! Cererea ta a fost transmisă anonimizat.');
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const handleWithdraw = async (poolId: string, demandId: string) => {
    await withdrawFromDemandPool(demandId, poolId);
    setActionSuccessMessage('Ai părăsit grupul de cumpărare.');
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleAcceptOffer = async (offerId: string) => {
    await acceptClientOffer(offerId);
    setActionSuccessMessage('Ai acceptat oferta! Am generat cererea de aderare în Cereri Optimizare.');
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const handleRejectOffer = async (offerId: string) => {
    await rejectClientOffer(offerId);
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProp(true);
    try {
      await submitPoolInterest({
        category: propCategory,
        estimatedSpend: Number(propSpend) || 0,
        estimatedVolume: propVolume ? Number(propVolume) : undefined,
        unit: propUnit,
        notes: propNotes.trim() || undefined,
      });
      setIsProposingCategory(false);
      setPropNotes('');
      setActionSuccessMessage('Propunerea ta de categorie a fost înregistrată! Te vom anunța când există suficient interes pentru o negociere colectivă.');
      setTimeout(() => setActionSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Error submitting pool interest:', err);
    } finally {
      setIsSubmittingProp(false);
    }
  };

  const isRealEmptyState = !isDemoMode && availablePools.length === 0 && myActivePools.length === 0 && myDemands.length === 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Puterea Mea de Cumpărare — Demand Pools</h1>
            <Badge variant="purple" size="sm">SAVE Group Buying</Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-3xl">
            Nu mai negocia singur tarifele B2B. SAVE combină cererea ta reală și verificată cu a altor companii din România, obținând tarife corporate garantate prin licitații anonime directe de la furnizori.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsProposingCategory(true)}
          className="gap-2 shrink-0 border-purple-300 bg-purple-50/50 hover:bg-purple-100 text-purple-900 font-semibold"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Propune o categorie</span>
        </Button>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-in fade-in text-sm font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODAL / FORMULAR: PROPUNE O CATEGORIE PENTRU POOL */}
      {isProposingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Propune o Categorie de Cumpărare</h3>
                  <p className="text-[11px] text-zinc-500">SAVE va căuta parteneri IMM cu același profil de consum</p>
                </div>
              </div>
              <button 
                onClick={() => setIsProposingCategory(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProposalSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Categorie Achiziție *</label>
                <select
                  value={propCategory}
                  onChange={(e) => setPropCategory(e.target.value as SpendCategory)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900"
                >
                  <option value="Curierat">Curierat & Logistică Expedieri</option>
                  <option value="Telecom">Telecom & Flotă Mobilă Voce+Date</option>
                  <option value="Software">Software & Licențe Cloud / SaaS</option>
                  <option value="Energie">Energie Electrică & Gaze Naturale</option>
                  <option value="Consumabile">Consumabile Birou & Ambalaje</option>
                  <option value="Servicii">Servicii Profesionale (Contabilitate, SSM, Curățenie)</option>
                  <option value="Altele">Altele</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Buget Lunar Estimat (RON) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={propSpend}
                    onChange={(e) => setPropSpend(e.target.value)}
                    placeholder="ex: 5000"
                    className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-mono text-zinc-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Volum Consum Estimat</label>
                  <input
                    type="number"
                    value={propVolume}
                    onChange={(e) => setPropVolume(e.target.value)}
                    placeholder="ex: 350"
                    className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-mono text-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Unitate de Măsură</label>
                <input
                  type="text"
                  value={propUnit}
                  onChange={(e) => setPropUnit(e.target.value)}
                  placeholder="ex: colete / lună, SIM-uri, licențe"
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Cerințe Speciale sau Notițe (Opțional)</label>
                <textarea
                  rows={2}
                  value={propNotes}
                  onChange={(e) => setPropNotes(e.target.value)}
                  placeholder="ex: Avem nevoie de ridicare zilnică după ora 16:00 și asigurare inclusă."
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 resize-none"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <span>
                  Propunerea este complet anonimă. Când mai multe firme din rețea exprimă un interes similar, SAVE formează grupul și declanșează licitația către furnizorii acreditați.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProposingCategory(false)}
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  variant="purple"
                  size="sm"
                  disabled={isSubmittingProp || !propSpend}
                  className="gap-1.5 font-bold"
                >
                  {isSubmittingProp ? 'Se trimite…' : 'Trimite propunerea'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REAL EMPTY STATE: POOL-URILE SAVE SUNT IN PREGATIRE */}
      {isRealEmptyState ? (
        <div className="space-y-8">
          <Card className="p-6 sm:p-10 border border-purple-200/80 bg-gradient-to-b from-purple-50/40 via-white to-white shadow-sm space-y-8">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <Badge variant="purple" size="sm" className="mb-1">
                Putere de Cumpărare Agregată
              </Badge>
              <h2 className="text-xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                Pool-urile SAVE sunt în pregătire
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Când mai multe companii au aceeași nevoie de achiziție, SAVE poate grupa cererea pentru a obține condiții mai bune de la furnizori.
              </p>
            </div>

            {/* 3-Step Visual Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-3 relative flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-sm">
                    1
                  </div>
                  <h3 className="font-bold text-zinc-900 text-sm">Companiile își declară nevoia</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Înregistrezi volumul de consum și categoria de achiziții unde compania ta dorește un tarif mai competitiv.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-purple-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Declarare 100% anonimă</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-3 relative flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    2
                  </div>
                  <h3 className="font-bold text-zinc-900 text-sm">SAVE agregă volumul</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Algoritmul combină cererile compatibile din rețea, creând un lot mare de achiziție la nivel regional sau național.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-purple-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Volum multiplicat de 10x–50x</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-3 relative flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-sm">
                    3
                  </div>
                  <h3 className="font-bold text-zinc-900 text-sm">Furnizorii concurează</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Furnizorii mari licitează direct pentru întregul lot agregat, oferind prețuri corporative rezervate marilor conturi.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Economii de 18% – 35%</span>
                </div>
              </div>
            </div>

            {/* CTA & Secondary Notice */}
            <div className="max-w-md mx-auto text-center space-y-3 pt-2">
              <Button
                size="lg"
                variant="purple"
                onClick={() => setIsProposingCategory(true)}
                className="w-full sm:w-auto px-8 gap-2 font-bold shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Propune o categorie</span>
              </Button>
              <p className="text-xs text-zinc-500">
                Te vom anunța când există suficient interes pentru o negociere colectivă.
              </p>
            </div>
          </Card>

          {/* User Submitted Interests Section */}
          {myPoolInterests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Categoriile propuse de compania ta ({myPoolInterests.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myPoolInterests.map((interest) => (
                  <Card key={interest.id} className="border-purple-200/80 bg-purple-50/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="purple" size="sm">{interest.category}</Badge>
                        <Badge variant="info" size="sm">În Monitorizare</Badge>
                      </div>
                      <CardTitle className="text-sm mt-1 text-zinc-900">
                        {interest.estimatedSpend.toLocaleString('ro-RO')} lei / lună estimat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-1.5 pt-0">
                      {interest.estimatedVolume && (
                        <p className="text-zinc-600">
                          Volum indicat: <strong className="text-zinc-900 font-mono">{interest.estimatedVolume} {interest.unit || ''}</strong>
                        </p>
                      )}
                      {interest.notes && (
                        <p className="text-zinc-500 italic text-[11px]">
                          „{interest.notes}”
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-400 font-mono pt-1">
                        Înregistrat la: {new Date(interest.createdAt).toLocaleDateString('ro-RO')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Normal Pool Zones (shown in demo or when pools exist) */}

      {/* ZONA 4: OFERTE REZULTATE DIN DEMAND POOLS (Afișată cu prioritate dacă există oferte) */}
      {myOffers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-bold text-zinc-900">Zona 4: Oferte Rezultate & Tarif Garantat</h2>
            </div>
            <Badge variant="success" size="sm">Ofertă Câștigătoare Validată</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {myOffers.map((offer) => (
              <Card key={offer.id} className="border-emerald-300 bg-emerald-50/30 shadow-sm">
                <CardHeader className="pb-3 border-b border-emerald-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base text-zinc-900">{offer.supplierName}</CardTitle>
                        <Badge variant="success" size="sm">Economie: {offer.savingsPercentage}%</Badge>
                      </div>
                      <CardDescription className="text-xs mt-0.5">
                        Rezultată prin licitația grupului agregat • Preț blocat pe {offer.contractDurationMonths} luni
                      </CardDescription>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs text-zinc-500 block line-through">
                        {offer.currentAnnualCost.toLocaleString('ro-RO')} lei/an
                      </span>
                      <span className="text-lg font-black text-emerald-700">
                        {offer.proposedAnnualCost.toLocaleString('ro-RO')} lei/an
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                    {offer.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-emerald-200/80 text-xs">
                    <div>
                      <span className="text-[11px] text-zinc-400 uppercase font-semibold">Tarif Unitar Nou</span>
                      <p className="text-sm font-bold text-zinc-900 font-mono mt-0.5">
                        {offer.proposedUnitPrice} lei / {offer.unit} / lună
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 uppercase font-semibold">Volumul Tău Alocat</span>
                      <p className="text-sm font-bold text-zinc-900 font-mono mt-0.5">
                        {offer.volume} {offer.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-emerald-600 uppercase font-semibold">Economie Reală Anuală</span>
                      <p className="text-sm font-bold text-emerald-600 font-mono mt-0.5">
                        +{offer.estimatedSavings.toLocaleString('ro-RO')} lei / an
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-emerald-100/70 pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Nicio obligație până la semnarea noului contract</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {offer.status === 'accepted' ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ofertă Acceptată — Vezi în Cereri Optimizare</span>
                      </div>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRejectOffer(offer.id)}
                          className="text-xs text-zinc-500 hover:text-zinc-700"
                        >
                          Refuză
                        </Button>
                        <Button 
                          variant="emerald" 
                          size="sm" 
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="gap-1.5 font-bold"
                        >
                          <Check className="w-4 h-4" />
                          <span>Acceptă Oferta</span>
                        </Button>
                      </>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ZONA 3: POOL-URI ACTIVE ÎN CARE EȘTI ÎNSCRIS */}
      {myActivePools.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Zona 3: Pool-uri Active în care ești înscris</span>
            </h2>
            <Badge variant="purple" size="sm">{myActivePools.length} grupuri active</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myActivePools.map((pool) => {
              const membership = activeMemberships.find((m) => m.demandPoolId === pool.id);
              const linkedDemand = myDemands.find((d) => d.id === membership?.verifiedDemandId);

              return (
                <Card key={pool.id} className="border-indigo-200 bg-indigo-50/20">
                  <CardHeader className="pb-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="info" size="sm">{pool.category}</Badge>
                      <Badge 
                        variant={pool.status === 'open_for_bids' ? 'warning' : pool.status === 'offers_ready' ? 'success' : 'default'} 
                        size="sm"
                      >
                        {pool.status === 'open_for_bids' ? 'Licitare Deschisă' : pool.status === 'offers_ready' ? 'Oferte Gata' : 'Strângere Volum'}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm mt-2 text-zinc-900 leading-snug">{pool.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {pool.serviceType} • Regiune: {pool.region}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-1 text-xs">
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-lg border border-zinc-200 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-sans block">Companii</span>
                        <span className="font-bold text-zinc-900">{pool.totalCompanies} IMM-uri</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-sans block">Volum Total</span>
                        <span className="font-bold text-zinc-900">{pool.totalVolume}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-sans block">Valoare Grup</span>
                        <span className="font-bold text-emerald-600">{Math.round(pool.totalCurrentAnnualSpend / 1000)}k lei</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Termen licitație: {pool.biddingEndsAt ? new Date(pool.biddingEndsAt).toLocaleDateString('ro-RO') : 'În curs'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-600">
                        <Lock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Participare 100% Anonimă</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      Volumul tău înscris: <strong className="text-zinc-700 font-mono">{linkedDemand?.volume || 0} {linkedDemand?.unit}</strong>
                    </span>

                    {pool.status !== 'offers_ready' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWithdraw(pool.id, linkedDemand?.id || '')}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7"
                      >
                        Părăsește pool-ul
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ZONA 1: CERERE DETECTATĂ DIN DOCUMENTELE TALE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <span>Zona 1: Cerere Detectată din Documentele Tale</span>
          </h2>
          <span className="text-xs text-zinc-400">{myDemands.length} cereri identificate</span>
        </div>

        {myDemands.length === 0 ? (
          <Card className="p-8 text-center bg-zinc-50 border-dashed border-zinc-200">
            <p className="text-sm font-medium text-zinc-600">Nu am identificat încă cereri agregate eligibile.</p>
            <p className="text-xs text-zinc-400 mt-1">Încarcă facturi sau contracte de Telecom, Curierat sau Software pentru a activa puterea de cumpărare.</p>
            <Link href="/dashboard/documents" className="mt-4 inline-block">
              <Button size="sm" variant="emerald">Încarcă Documente</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myDemands.map((demand) => {
              const isPooled = activePoolIds.has(`pool_${demand.category.toLowerCase()}_${demand.unit.toLowerCase()}`) || demand.status === 'pooled';

              return (
                <Card key={demand.id} className="hover:border-zinc-300 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" size="sm">{demand.category}</Badge>
                      <Badge 
                        variant={demand.status === 'pooled' ? 'success' : demand.status === 'pool_eligible' ? 'purple' : 'warning'} 
                        size="sm"
                      >
                        {demand.status === 'pooled' ? 'Înscris în Pool' : demand.status === 'pool_eligible' ? 'Eligibil pentru Pool' : 'În Verificare'}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm mt-2 text-zinc-900 leading-snug">{demand.serviceType}</CardTitle>
                    <CardDescription className="text-xs">
                      Furnizor actual: <strong className="text-zinc-700">{demand.incumbentSupplierName}</strong>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2 pt-1 text-xs">
                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-sans">Cost Curent:</span>
                        <span className="font-bold text-zinc-900">{demand.currentMonthlyCost.toLocaleString('ro-RO')} lei / lună</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-sans">Volum Identificat:</span>
                        <span className="font-bold text-zinc-900">{demand.volume} {demand.unit}</span>
                      </div>
                      {demand.currentUnitPrice && (
                        <div className="flex justify-between text-[11px] text-zinc-500">
                          <span className="font-sans">Preț Unitar Estimat:</span>
                          <span>{demand.currentUnitPrice} lei / {demand.unit}</span>
                        </div>
                      )}
                    </div>

                    {demand.noticeDeadline && (
                      <p className="text-[11px] text-amber-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Preaviz necesar până la: {new Date(demand.noticeDeadline).toLocaleDateString('ro-RO')}</span>
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">Scor Certitudine: {demand.confidenceScore}%</span>
                    {demand.status === 'pool_eligible' && (
                      <span className="text-xs font-semibold text-purple-700">Gata de agregare</span>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ZONA 2: DEMAND POOL DISPONIBIL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Zona 2: Demand Pools Disponibile pentru Alăturare</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Alătură-te gratuit altor companii din rețea. Volumul agregat forțează furnizorii mari să vină cu oferte directe la nivel de corporație.
            </p>
          </div>
          <Badge variant="purple" size="sm">{availablePools.length} oportunități</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availablePools.map((pool) => {
            const matchingDemands = myDemands.filter((d) => d.category === pool.category);
            const isJoiningThis = joiningPoolId === pool.id;

            return (
              <Card key={pool.id} className="border-zinc-200 hover:border-zinc-300 transition-all flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="info" size="sm">{pool.category}</Badge>
                      <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {pool.totalCompanies} IMM-uri înscrise
                      </span>
                    </div>
                    <CardTitle className="text-base mt-2 text-zinc-900">{pool.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {pool.serviceType} • Valoare cumulată grup: <strong className="text-zinc-800 font-mono">{Math.round(pool.totalCurrentAnnualSpend / 1000)}k lei/an</strong>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs">
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-600 font-medium">Volum Agregat Curent:</span>
                        <span className="font-bold text-zinc-900 font-mono">{pool.totalVolume} unități</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-600 font-medium">Potențial Reducere Grup:</span>
                        <span className="font-bold text-emerald-600 font-mono">18% – 32% economie</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>Închidere licitație:</span>
                        <span>{pool.biddingEndsAt ? new Date(pool.biddingEndsAt).toLocaleDateString('ro-RO') : 'În curând'}</span>
                      </div>
                    </div>

                    {/* Join Modal inline form */}
                    {isJoiningThis ? (
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-purple-950 block mb-1">
                            Alege cererea ta pentru acest grup:
                          </label>
                          <select
                            value={selectedDemandForJoin}
                            onChange={(e) => setSelectedDemandForJoin(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-purple-300 bg-white"
                          >
                            <option value="">-- Selectează cererea --</option>
                            {matchingDemands.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.serviceType} ({d.volume} {d.unit}, {d.currentMonthlyCost} lei/lună)
                              </option>
                            ))}
                          </select>
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer text-[11px] text-purple-900">
                          <input
                            type="checkbox"
                            checked={consentChecked}
                            onChange={(e) => setConsentChecked(e.target.checked)}
                            className="mt-0.5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span>
                            Acord anonim: Sunt de acord ca volumul meu comercial să fie inclus anonimizat în licitația către furnizori. Datele companiei mele (nume, CUI, facturi) nu vor fi dezvăluite.
                          </span>
                        </label>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setJoiningPoolId(null); setConsentChecked(false); }}
                            className="text-xs h-7 text-zinc-500"
                          >
                            Anulează
                          </Button>
                          <Button
                            variant="purple"
                            size="sm"
                            disabled={!selectedDemandForJoin || !consentChecked}
                            onClick={() => handleJoinPool(pool.id, selectedDemandForJoin)}
                            className="text-xs h-7 gap-1 font-bold"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Confirmă Participarea Anonimă</span>
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </div>

                <CardFooter className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Prag confidențialitate: minim 3 firme</span>
                  </div>

                  {!isJoiningThis && (
                    <Button
                      variant="purple"
                      size="sm"
                      onClick={() => {
                        setJoiningPoolId(pool.id);
                        if (matchingDemands.length > 0) {
                          setSelectedDemandForJoin(matchingDemands[0].id);
                        }
                      }}
                      className="gap-1.5 font-semibold text-xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Participă anonim în Demand Pool</span>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
