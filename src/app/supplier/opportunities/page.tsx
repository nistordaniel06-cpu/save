'use client';

import React, { useState } from 'react';
import { useSave } from '@/lib/context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Users, 
  ShieldCheck, 
  Clock, 
  Lock, 
  Filter, 
  Check, 
  X, 
  CheckCircle2,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { AnonymousDemandPool, SpendCategory, SupplierBid } from '@/lib/types';
import { toAnonymousPoolView } from '@/lib/demand/pool-manager';

export default function SupplierOpportunitiesPage() {
  const { demandPools, marketplaceSuppliers, submitSupplierBid, supplierBids } = useSave();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [biddingPool, setBiddingPool] = useState<AnonymousDemandPool | null>(null);

  // Form states
  const [pricePerUnit, setPricePerUnit] = useState<string>('');
  const [durationMonths, setDurationMonths] = useState<number>(24);
  const [minVolume, setMinVolume] = useState<string>('');
  const [slaSummary, setSlaSummary] = useState<string>('SLA garantat 99.9%, account manager dedicat.');
  const [benefitsInput, setBenefitsInput] = useState<string>('Fără costuri de activare, Suport prioritar');
  const [conditions, setConditions] = useState<string>('Preț blocat fără indexare automată.');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    marketplaceSuppliers[0]?.id || 'mkt_sup_orange'
  );
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Filter pools strictly using privacy threshold
  const anonymousPools = demandPools
    .map(toAnonymousPoolView)
    .filter((p): p is AnonymousDemandPool => p !== null);

  const filteredPools = anonymousPools.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingPool || !pricePerUnit) return;

    const numericPrice = parseFloat(pricePerUnit);
    const estMonthly = Math.round(numericPrice * biddingPool.totalVolume);
    const estAnnual = estMonthly * 12;

    const supplier = marketplaceSuppliers.find((s) => s.id === selectedSupplierId);

    await submitSupplierBid({
      demandPoolId: biddingPool.poolId,
      marketplaceSupplierId: selectedSupplierId,
      marketplaceSupplierName: supplier?.companyName || 'Furnizor Partener',
      pricingModel: 'unit_fixed',
      pricePerUnit: numericPrice,
      estimatedMonthlyTotal: estMonthly,
      estimatedAnnualTotal: estAnnual,
      contractDurationMonths: durationMonths,
      minimumVolume: parseFloat(minVolume) || biddingPool.totalVolume,
      slaSummary,
      benefits: benefitsInput.split(',').map((b) => b.trim()).filter(Boolean),
      conditions,
      validUntil: biddingPool.biddingEndsAt ? biddingPool.biddingEndsAt.split('T')[0] : undefined,
    });

    setSubmissionSuccess(`Oferta ta de ${numericPrice} lei/unitate a fost transmisă cu succes către SAVE Admin!`);
    setBiddingPool(null);
    setPricePerUnit('');
    setTimeout(() => setSubmissionSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Oportunități de Licitare Agregate</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Grupuri de cerere comercială verificată din România, conforme cu standardul de anonimizare SAVE.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-zinc-200 text-xs">
          {['all', 'Telecom', 'Curierat', 'Software'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {cat === 'all' ? 'Toate Categoriile' : cat}
            </button>
          ))}
        </div>
      </div>

      {submissionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{submissionSuccess}</span>
          </div>
          <button onClick={() => setSubmissionSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid of opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPools.map((pool) => {
          const myBidsForPool = supplierBids.filter((b) => b.demandPoolId === pool.poolId);

          return (
            <Card key={pool.poolId} className="flex flex-col justify-between hover:border-zinc-300 transition-all">
              <div>
                <CardHeader className="pb-2.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="info" size="sm">{pool.category}</Badge>
                    <Badge 
                      variant={pool.status === 'open_for_bids' ? 'warning' : pool.status === 'offers_ready' ? 'success' : 'default'} 
                      size="sm"
                    >
                      {pool.status === 'open_for_bids' ? 'Licitare Deschisă' : pool.status === 'offers_ready' ? 'Oferte în Evaluare' : 'Strângere Volum'}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm mt-2 text-zinc-900 leading-snug">{pool.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {pool.serviceType} • Regiune: {pool.region}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-1 text-xs">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Companii Verificate:</span>
                      <span className="font-bold text-zinc-900">{pool.totalCompanies} IMM-uri</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Volum Agregat:</span>
                      <span className="font-bold text-zinc-900">{pool.totalVolume}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Spend Anual Estimat:</span>
                      <span className="font-bold text-emerald-600">~{pool.approximateAnnualSpend.toLocaleString('ro-RO')} lei</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>Termen: {pool.biddingEndsAt ? new Date(pool.biddingEndsAt).toLocaleDateString('ro-RO') : 'Deschis'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Lock className="w-3 h-3" />
                      <span>Min. 3 firme</span>
                    </span>
                  </div>

                  {myBidsForPool.length > 0 && (
                    <div className="p-2 bg-purple-50 rounded-lg border border-purple-200 text-[11px] text-purple-900 flex items-center justify-between">
                      <span>Ai depus deja {myBidsForPool.length} ofertă(e)</span>
                      <span className="font-bold font-mono text-purple-700">{myBidsForPool[0].pricePerUnit} lei/unitate</span>
                    </div>
                  )}
                </CardContent>
              </div>

              <CardFooter className="pt-2 border-t border-zinc-100">
                <Button
                  variant="purple"
                  size="sm"
                  onClick={() => {
                    setBiddingPool(pool);
                    setMinVolume(String(pool.totalVolume));
                  }}
                  className="w-full text-xs font-semibold gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Depune Ofertă Structurată</span>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Bidding Modal */}
      {biddingPool && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-bold text-zinc-900 text-base">Depune Ofertă B2B pentru Grup</h3>
                <p className="text-xs text-zinc-500">{biddingPool.title}</p>
              </div>
              <button onClick={() => setBiddingPool(null)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Furnizor Marketplace Reprezentat</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-zinc-300 bg-white"
                >
                  {marketplaceSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} ({s.categories.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">
                    Preț Unitar Oferit (RON / unitate / lună) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    placeholder="ex: 39.00"
                    className="w-full p-2 rounded-lg border border-zinc-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Durată Contractuală</label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-zinc-300 bg-white"
                  >
                    <option value={12}>12 luni</option>
                    <option value={24}>24 luni (recomandat)</option>
                    <option value={36}>36 luni</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Volum Minim Acceptat pentru acest Tarif</label>
                <input
                  type="number"
                  value={minVolume}
                  onChange={(e) => setMinVolume(e.target.value)}
                  placeholder={`Volum grup: ${biddingPool.totalVolume}`}
                  className="w-full p-2 rounded-lg border border-zinc-300 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Garanție SLA & Serviciu Clienți</label>
                <input
                  type="text"
                  value={slaSummary}
                  onChange={(e) => setSlaSummary(e.target.value)}
                  placeholder="ex: Disponibilitate 99.9%, suport dedicat 24/7"
                  className="w-full p-2 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Beneficii Incluse (separate prin virgulă)</label>
                <input
                  type="text"
                  value={benefitsInput}
                  onChange={(e) => setBenefitsInput(e.target.value)}
                  placeholder="ex: Migrare gratuită, Roaming SEE inclus, 0 km suplimentari"
                  className="w-full p-2 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Condiții & Clauze Speciale</label>
                <textarea
                  rows={2}
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="ex: Tariful nu este supus indexării inflaționiste pe perioada contractuală."
                  className="w-full p-2 rounded-lg border border-zinc-300"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl text-[11px] text-purple-900 border border-purple-200 leading-relaxed">
                Oferta va fi evaluată de echipa SAVE. Dacă este selectată ca fiind cea mai competitivă, va fi transmisă automat celor {biddingPool.totalCompanies} IMM-uri membre în grupul de cumpărare.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setBiddingPool(null)}>
                  Anulează
                </Button>
                <Button type="submit" variant="purple" size="sm" className="font-bold">
                  Depune Oferta Oficială
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
