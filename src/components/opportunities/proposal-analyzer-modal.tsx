'use client';

import React, { useState } from 'react';
import { useSave } from '@/lib/context';
import { 
  evaluateSupplierProposal, 
  ProposalEvaluationResult, 
  ROMANIAN_MARKET_BENCHMARKS 
} from '@/lib/analytics/proposal-evaluator';
import { generateNegotiationLetter } from '@/lib/analytics/negotiation-letter';
import { SpendCategory } from '@/lib/types';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  Copy, 
  Download, 
  FileText, 
  X, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';

interface ProposalAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProposalAnalyzerModal({ isOpen, onClose }: ProposalAnalyzerModalProps) {
  const { currentOrg, currentUser } = useSave();

  const [supplierName, setSupplierName] = useState('Fan Courier Express SRL');
  const [category, setCategory] = useState<SpendCategory>('Curierat');
  const [proposedAnnualCost, setProposedAnnualCost] = useState(105000);
  const [unitPrice, setUnitPrice] = useState<number | ''>(14.50);
  const [quantity, setQuantity] = useState<number | ''>(600);
  const [automaticRenewal, setAutomaticRenewal] = useState(true);
  const [priceIndexation, setPriceIndexation] = useState(true);

  const [evaluationResult, setEvaluationResult] = useState<ProposalEvaluationResult | null>(null);
  const [showLetter, setShowLetter] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = evaluateSupplierProposal({
      supplierName,
      category,
      proposedAnnualCost: Number(proposedAnnualCost),
      unitPrice: unitPrice !== '' ? Number(unitPrice) : null,
      quantity: quantity !== '' ? Number(quantity) : null,
      automaticRenewal,
      priceIndexation,
    });
    setEvaluationResult(result);
    setShowLetter(false);
  };

  const handlePreset = (type: 'curierat' | 'telecom' | 'software') => {
    if (type === 'curierat') {
      setSupplierName('Fan Courier Express SRL');
      setCategory('Curierat');
      setProposedAnnualCost(105000);
      setUnitPrice(14.50);
      setQuantity(600);
      setAutomaticRenewal(true);
      setPriceIndexation(true);
    } else if (type === 'telecom') {
      setSupplierName('Orange România SA');
      setCategory('Telecom');
      setProposedAnnualCost(28500);
      setUnitPrice(68.00);
      setQuantity(35);
      setAutomaticRenewal(true);
      setPriceIndexation(false);
    } else {
      setSupplierName('Microsoft Ireland Ltd');
      setCategory('Software');
      setProposedAnnualCost(42000);
      setUnitPrice(87.50);
      setQuantity(40);
      setAutomaticRenewal(false);
      setPriceIndexation(true);
    }
    setEvaluationResult(null);
    setShowLetter(false);
  };

  const letterText = evaluationResult ? generateNegotiationLetter({
    companyName: currentOrg?.name || 'Compania Noastră SRL',
    companyCui: currentOrg?.cui,
    supplierName: evaluationResult.supplierName,
    category: evaluationResult.category,
    currentOrProposedCostAnnual: evaluationResult.proposedAnnualCost,
    targetCostAnnual: evaluationResult.targetAnnualCost,
    expectedSavingsAnnual: evaluationResult.potentialAnnualSavings,
    keyArguments: evaluationResult.counterOfferStrategy.keyArguments,
    clausesToExclude: evaluationResult.counterOfferStrategy.contractClausesToEliminate,
    contactPersonName: currentUser?.fullName || 'Director Financiar (CFO)',
  }) : '';

  const copyLetterToClipboard = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([letterText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Scrisoare_Contraoferta_${supplierName.replace(/\s+/g, '_')}_2026.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900">Verificator Oferte Noi (Proposal Agent)</h2>
                <Badge variant="success" size="sm">Tropic-Inspired</Badge>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Evaluează oferta primită înainte de semnare și compar-o cu mediana pieței din România.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Quick Presets */}
          <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
            <p className="text-xs font-semibold text-zinc-700 mb-2 flex items-center gap-1.5">
              <span>Testează rapid cu oferte tipice din România:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePreset('curierat')}
                className="p-2 text-left bg-white hover:bg-emerald-50/50 border border-zinc-200 hover:border-emerald-300 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <p className="font-semibold text-zinc-900">Ofertă Curierat (Fan Courier)</p>
                <p className="text-[10px] text-zinc-500 font-mono">14.50 lei/colet · 600 colete/lună</p>
              </button>
              <button
                type="button"
                onClick={() => handlePreset('telecom')}
                className="p-2 text-left bg-white hover:bg-emerald-50/50 border border-zinc-200 hover:border-emerald-300 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <p className="font-semibold text-zinc-900">Ofertă Telecom (Orange)</p>
                <p className="text-[10px] text-zinc-500 font-mono">68 lei/abonament · 35 SIM-uri</p>
              </button>
              <button
                type="button"
                onClick={() => handlePreset('software')}
                className="p-2 text-left bg-white hover:bg-emerald-50/50 border border-zinc-200 hover:border-emerald-300 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <p className="font-semibold text-zinc-900">Ofertă SaaS (Microsoft)</p>
                <p className="text-[10px] text-zinc-500 font-mono">87.50 lei/licență · 40 utilizatori</p>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleEvaluate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nume Furnizor</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Categorie Achiziție</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SpendCategory)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-emerald-600 bg-white"
                >
                  <option value="Telecom">Telecom (Voce & Date)</option>
                  <option value="Curierat">Curierat & Logistică</option>
                  <option value="Software">Software & SaaS</option>
                  <option value="Consumabile">Consumabile & Birotică</option>
                  <option value="Energie">Energie & Utilități</option>
                  <option value="Servicii">Servicii Profesionale</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Cost Total Anual Oferit (RON)</label>
                <input
                  type="number"
                  value={proposedAnnualCost}
                  onChange={(e) => setProposedAnnualCost(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Preț Unitar (opțional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder={`ex: ${ROMANIAN_MARKET_BENCHMARKS[category]?.p50MedianPrice || 50}`}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Volum Lunar / Cantitate</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Contract terms checks */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs text-zinc-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={automaticRenewal}
                  onChange={(e) => setAutomaticRenewal(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include clauză de reînnoire tacită automată</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={priceIndexation}
                  onChange={(e) => setPriceIndexation(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include clauză de indexare cu inflația</span>
              </label>
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 text-xs font-semibold">
              <span>Evaluează Oferta Comparativ cu Piața RO →</span>
            </Button>
          </form>

          {/* Evaluation Result Display */}
          {evaluationResult && (
            <div className="space-y-5 pt-4 border-t border-zinc-200 animate-in fade-in">
              
              {/* Verdict Card */}
              <div className={clsx(
                'p-5 rounded-2xl border',
                evaluationResult.verdict === 'overpriced' ? 'bg-rose-50/70 border-rose-200' :
                evaluationResult.verdict === 'competitive' ? 'bg-amber-50/70 border-amber-200' :
                'bg-emerald-50/70 border-emerald-200'
              )}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <Badge variant={
                      evaluationResult.verdict === 'overpriced' ? 'danger' :
                      evaluationResult.verdict === 'competitive' ? 'warning' : 'success'
                    } size="md">
                      {evaluationResult.verdictLabel}
                    </Badge>
                    <h3 className="text-sm font-bold text-zinc-900 mt-2">
                      {evaluationResult.verdict === 'overpriced'
                        ? `Atenție: Oferta este cu ${evaluationResult.priceVarianceFromMedianPercent}% peste mediana pieței din România!`
                        : `Oferta este aliniată pieței din categoria ${evaluationResult.category}.`}
                    </h3>
                  </div>

                  {evaluationResult.potentialAnnualSavings > 0 && (
                    <div className="bg-white px-4 py-2.5 rounded-xl border border-zinc-200 text-right">
                      <p className="text-[10px] text-zinc-500 uppercase font-semibold">Economie de Negociat</p>
                      <p className="text-lg font-extrabold text-emerald-600">
                        {evaluationResult.potentialAnnualSavings.toLocaleString('ro-RO')} lei/an
                      </p>
                      <p className="text-[10px] text-zinc-500">(-{evaluationResult.savingsPercentage}% din cost)</p>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="mt-4 pt-3 border-t border-zinc-200/80 space-y-1.5">
                  <p className="text-xs font-semibold text-zinc-900">Recomandări de acțiune:</p>
                  {evaluationResult.recommendations.map((rec, idx) => (
                    <p key={idx} className="text-xs text-zinc-700 flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  onClick={() => setShowLetter(!showLetter)}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>{showLetter ? 'Ascunde Scrisoarea de Negociere' : 'Generează Scrisoare de Contra-Ofertă'}</span>
                </Button>
              </div>

              {/* Letter Preview */}
              {showLetter && (
                <div className="p-4 bg-zinc-900 text-zinc-100 rounded-xl space-y-3 font-mono text-xs animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Document Oficial SAVE — Gata de Trimis Furnizorului
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={copyLetterToClipboard}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copied ? 'Copiat!' : 'Copiază Text'}</span>
                      </button>
                      <button
                        onClick={downloadLetter}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-[11px] text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descarcă (.txt)</span>
                      </button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto text-zinc-300">
                    {letterText}
                  </pre>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
