'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSave } from '@/lib/context';
import { SpendCategory } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  TrendingDown, 
  Building2, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Check, 
  X, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { ProcurementRequestModal } from '@/components/opportunities/procurement-request-modal';

interface CompareOffer {
  id: string;
  supplierName: string;
  cui: string;
  category: SpendCategory;
  isCurrent: boolean;
  monthlyCost: number;
  annualCost: number;
  unitPriceLabel: string;
  paymentTermsDays: number;
  contractDurationMonths: number;
  hasAutomaticRenewal: boolean;
  hasPriceIndexation: boolean;
  slaResponseHours: number;
  rating: number;
  verifiedSavingsAnnualRon: number;
  features: string[];
}

export default function SaveComparePage() {
  const { suppliers, spendRecords, currentOrg, verifyOptimizationSavings } = useSave();

  const [selectedCategory, setSelectedCategory] = useState<SpendCategory>('Telecom');
  const [selectedWinningOfferId, setSelectedWinningOfferId] = useState<string | null>(null);
  const [isProcureModalOpen, setIsProcureModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Find existing supplier in this category
  const existingSupplier = suppliers.find((s) => s.category === selectedCategory);
  const existingAnnualSpend = existingSupplier ? existingSupplier.totalAnnualSpendRon : 24000;
  const existingMonthly = Math.round(existingAnnualSpend / 12);

  // Pre-configured comparison matrix data for the active category
  const currentBaseline: CompareOffer = {
    id: 'current_contract',
    supplierName: existingSupplier ? existingSupplier.name : `Furnizor Actual (${selectedCategory})`,
    cui: existingSupplier?.cui || 'RO14399840',
    category: selectedCategory,
    isCurrent: true,
    monthlyCost: existingMonthly,
    annualCost: existingAnnualSpend,
    unitPriceLabel: selectedCategory === 'Telecom' ? '65.00 lei/abonament' : selectedCategory === 'Curierat' ? '14.50 lei/colet' : 'Tarif standard de listă',
    paymentTermsDays: 15,
    contractDurationMonths: 24,
    hasAutomaticRenewal: true,
    hasPriceIndexation: true,
    slaResponseHours: 48,
    rating: 3.4,
    verifiedSavingsAnnualRon: 0,
    features: [
      'Reînnoire tacită nesupravegheată',
      'Indexare anuală cu rata inflației',
      'Termen de plată scurt (15 zile)',
      'Suport standard tip call-center',
    ],
  };

  const alternativeOfferA: CompareOffer = {
    id: 'offer_save_alpha',
    supplierName: selectedCategory === 'Telecom' ? 'Orange Business Solutions' : selectedCategory === 'Curierat' ? 'Sameday Easybox Corporate' : 'Furnizor Acreditat SAVE A',
    cui: 'RO8970105',
    category: selectedCategory,
    isCurrent: false,
    monthlyCost: Math.round(existingMonthly * 0.78),
    annualCost: Math.round(existingAnnualSpend * 0.78),
    unitPriceLabel: selectedCategory === 'Telecom' ? '45.00 lei/abonament' : selectedCategory === 'Curierat' ? '10.80 lei/colet' : 'Tarif negociat volum P25',
    paymentTermsDays: 45,
    contractDurationMonths: 12,
    hasAutomaticRenewal: false,
    hasPriceIndexation: false,
    slaResponseHours: 4,
    rating: 4.8,
    verifiedSavingsAnnualRon: Math.round(existingAnnualSpend * 0.22),
    features: [
      'Economie netă de 22% garantată contractual',
      'Termen extins de plată la 45 de zile',
      'Fără reînnoire tacită sau indexări ascunse',
      'Account Manager dedicat & SLA 4 ore',
    ],
  };

  const alternativeOfferB: CompareOffer = {
    id: 'offer_save_beta',
    supplierName: selectedCategory === 'Telecom' ? 'Digi Business Nelimitat' : selectedCategory === 'Curierat' ? 'DPD Express B2B' : 'Furnizor Acreditat SAVE B',
    cui: 'RO3249102',
    category: selectedCategory,
    isCurrent: false,
    monthlyCost: Math.round(existingMonthly * 0.85),
    annualCost: Math.round(existingAnnualSpend * 0.85),
    unitPriceLabel: selectedCategory === 'Telecom' ? '50.00 lei/abonament' : selectedCategory === 'Curierat' ? '11.50 lei/colet' : 'Tarif negociat volum P50',
    paymentTermsDays: 30,
    contractDurationMonths: 24,
    hasAutomaticRenewal: false,
    hasPriceIndexation: false,
    slaResponseHours: 12,
    rating: 4.5,
    verifiedSavingsAnnualRon: Math.round(existingAnnualSpend * 0.15),
    features: [
      'Economie de 15% pe 24 luni cu plafonare preț',
      'Termen de plată la 30 de zile',
      'Portal online de monitorizare consum',
      'Suport tehnic prioritar',
    ],
  };

  const offers = [currentBaseline, alternativeOfferA, alternativeOfferB];

  const handleSelectWinningOffer = async (offer: CompareOffer) => {
    setSelectedWinningOfferId(offer.id);
    if (!offer.isCurrent && offer.verifiedSavingsAnnualRon > 0) {
      await verifyOptimizationSavings('opt_req_compare', offer.verifiedSavingsAnnualRon);
      setSuccessMessage(`Oferta „${offer.supplierName}” a fost selectată! Economia anuală de ${offer.verifiedSavingsAnnualRon.toLocaleString('ro-RO')} lei a fost înregistrată în contul companiei.`);
      setTimeout(() => setSuccessMessage(null), 6000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tablou de Bord</span>
            </Link>
            <span className="text-zinc-300">•</span>
            <Badge variant="purple" size="sm">SAVE Compare Tool</Badge>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-emerald-600" />
            <span>Comparare Oferte Furnizori & Matrice de Decizie</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Evaluează contractul actual în oglindă cu ofertele agregate primite prin SAVE. Alege cea mai profitabilă ofertă comercială.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="emerald"
            size="sm"
            onClick={() => setIsProcureModalOpen(true)}
            className="gap-1.5 font-bold shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cere Oferte Suplimentare</span>
          </Button>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Category Filter Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(['Telecom', 'Curierat', 'Software', 'Consumabile', 'Energie', 'Servicii'] as SpendCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* COMPARISON CARDS MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {offers.map((offer) => {
          const isWinner = selectedWinningOfferId === offer.id;
          const isBestDeal = offer.id === 'offer_save_alpha';

          return (
            <Card
              key={offer.id}
              className={`p-6 flex flex-col justify-between transition-all relative ${
                isWinner
                  ? 'border-2 border-emerald-500 bg-emerald-50/30 shadow-lg'
                  : isBestDeal
                  ? 'border-2 border-purple-500 bg-purple-50/20 shadow-md'
                  : 'border-zinc-200 bg-white'
              }`}
            >
              {isBestDeal && !isWinner && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Recomandat SAVE (Top Valoare)</span>
                </div>
              )}

              {isWinner && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Ofertă Câștigătoare Selectată</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Supplier Header */}
                <div className="space-y-1 pb-3 border-b border-zinc-100">
                  <div className="flex items-center justify-between">
                    <Badge variant={offer.isCurrent ? 'default' : 'purple'} size="sm">
                      {offer.isCurrent ? 'Contract Curent' : 'Ofertă Alternativă'}
                    </Badge>
                    <span className="font-mono text-[11px] text-zinc-400 font-semibold">CUI: {offer.cui}</span>
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 pt-1">{offer.supplierName}</h3>
                  <p className="text-xs text-zinc-500">{offer.unitPriceLabel}</p>
                </div>

                {/* Price and Savings Box */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-zinc-500">Cost Anualizat:</span>
                    <span className="font-mono font-black text-base text-zinc-900">
                      {offer.annualCost.toLocaleString('ro-RO')} lei
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-zinc-500">Rată Lunară:</span>
                    <span className="font-mono font-bold text-zinc-700">
                      {offer.monthlyCost.toLocaleString('ro-RO')} lei/lună
                    </span>
                  </div>

                  {!offer.isCurrent && (
                    <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Economie Anuală:</span>
                      </span>
                      <span className="font-mono font-black text-emerald-600 text-sm">
                        +{offer.verifiedSavingsAnnualRon.toLocaleString('ro-RO')} lei/an
                      </span>
                    </div>
                  )}
                </div>

                {/* Granular Term Conditions */}
                <div className="space-y-2.5 text-xs text-zinc-700">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Termen de Plată:</span>
                    <strong className="font-mono text-zinc-900">{offer.paymentTermsDays} zile</strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Durată Contract:</span>
                    <strong className="font-mono text-zinc-900">{offer.contractDurationMonths} luni</strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Reînnoire Automată:</span>
                    <strong className={offer.hasAutomaticRenewal ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {offer.hasAutomaticRenewal ? 'Da (Risc)' : 'Nu (Fără risc)'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">SLA & Suport:</span>
                    <strong className="font-mono text-zinc-900">Răspuns sub {offer.slaResponseHours}h</strong>
                  </div>
                </div>

                {/* Feature Bullet Points */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Caracteristici Cheie</span>
                  {offer.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-zinc-600">
                      {offer.isCurrent ? (
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      )}
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-zinc-100 mt-4">
                {offer.isCurrent ? (
                  <Button variant="outline" size="sm" disabled className="w-full text-xs font-semibold">
                    Contract Curent în Derulare
                  </Button>
                ) : (
                  <Button
                    variant={isWinner ? 'secondary' : 'emerald'}
                    size="sm"
                    onClick={() => handleSelectWinningOffer(offer)}
                    className="w-full text-xs font-bold gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    {isWinner ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ofertă Acceptată</span>
                      </>
                    ) : (
                      <>
                        <span>Alege Oferta Câștigătoare</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Procurement Modal */}
      <ProcurementRequestModal
        isOpen={isProcureModalOpen}
        onClose={() => setIsProcureModalOpen(false)}
        initialCategory={selectedCategory}
        initialAnnualSpend={existingAnnualSpend}
      />
    </div>
  );
}
