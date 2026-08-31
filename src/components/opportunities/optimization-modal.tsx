'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { SavingsOpportunity } from '@/lib/types';
import { useSave } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

interface OptimizationModalProps {
  opportunity: SavingsOpportunity;
  isOpen: boolean;
  onClose: () => void;
}

export function OptimizationModal({
  opportunity,
  isOpen,
  onClose,
}: OptimizationModalProps) {
  const { createOptimizationRequest } = useSave();
  const [clientNotes, setClientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((r) => setTimeout(r, 600));

    createOptimizationRequest({
      opportunityId: opportunity.id,
      supplierId: opportunity.supplierId,
      supplierName: opportunity.supplierName,
      initialAnnualCost: opportunity.currentAnnualCost,
      clientNotes,
    });

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setClientNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Lansează Cerere de Optimizare Cost SAVE"
      description={`Furnizor vizat: ${opportunity.supplierName} • Economie estimată: ${opportunity.estimatedSavingsMin.toLocaleString('ro-RO')} – ${opportunity.estimatedSavingsMax.toLocaleString('ro-RO')} lei/an`}
      maxWidth="lg"
    >
      {submitted ? (
        <div className="space-y-4 py-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-zinc-900">Cererea a fost transmisă echipei SAVE!</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              Un specialist SAVE a preluat dosarul companiei tale. Vom analiza contractul și vom solicita oferte competitive fără a dezvălui datele tale confidențiale către furnizori terți.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={handleClose}>
              Am înțeles, mulțumesc!
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Cost anual actual:</span>
              <span className="font-mono font-bold text-zinc-900">
                {opportunity.currentAnnualCost.toLocaleString('ro-RO')} lei
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Economii anuale estimate:</span>
              <span className="font-mono font-bold text-emerald-600">
                {opportunity.estimatedSavingsMin.toLocaleString('ro-RO')} – {opportunity.estimatedSavingsMax.toLocaleString('ro-RO')} lei
              </span>
            </div>
            <div className="flex justify-between border-t border-zinc-200/60 pt-2">
              <span className="text-zinc-500">Model comision:</span>
              <span className="font-semibold text-zinc-800">No Saving, No Fee (comision doar din economia realizată)</span>
            </div>
          </div>

          {/* User Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800">
              Cerințe specifice sau preferințe de păstrare furnizor (Opțional)
            </label>
            <textarea
              rows={3}
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Ex: Preferăm să rămânem la același furnizor dacă oferă un tarif aliniat pieței. Avem nevoie de minimum 24 de abonamente active..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
            />
          </div>

          {/* Security & Confidentiality Reminder */}
          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/60 flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Datele tale comerciale rămân 100% confidențiale. Nu dezvăluim prețurile sau facturile brute către furnizori neafiliați fără acordul tău prealabil.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Renunță
            </Button>
            <Button type="submit" variant="emerald" size="sm" isLoading={isSubmitting} className="gap-1.5 font-semibold">
              <Zap className="w-4 h-4" />
              <span>Trimite Cererea de Optimizare</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
