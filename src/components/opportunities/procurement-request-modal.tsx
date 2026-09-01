'use client';

import React, { useState } from 'react';
import { useSave } from '@/lib/context';
import { SpendCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Sparkles, 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Send, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';

interface ProcurementRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: SpendCategory;
  initialSupplierName?: string;
  initialAnnualSpend?: number;
  opportunityId?: string;
  opportunityTitle?: string;
}

export function ProcurementRequestModal({
  isOpen,
  onClose,
  initialCategory = 'Telecom',
  initialSupplierName = '',
  initialAnnualSpend = 0,
  opportunityId,
  opportunityTitle,
}: ProcurementRequestModalProps) {
  const { currentOrg, createOptimizationRequest } = useSave();

  const [category, setCategory] = useState<SpendCategory>(initialCategory);
  const [supplierName, setSupplierName] = useState(initialSupplierName);
  const [annualSpend, setAnnualSpend] = useState(initialAnnualSpend);
  const [approxVolume, setApproxVolume] = useState('');
  const [location, setLocation] = useState(currentOrg.county ? `${currentOrg.city || ''}, ${currentOrg.county}` : 'București');
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [requirements, setRequirements] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createOptimizationRequest({
        opportunityId,
        opportunityTitle: opportunityTitle || `Cerere Ofertă: ${category}`,
        category,
        supplierName: supplierName.trim() || undefined,
        initialAnnualCost: Number(annualSpend),
        location,
        approximateVolume: approxVolume.trim() || undefined,
        requirements: requirements.trim() || undefined,
        desiredDurationMonths: durationMonths,
        clientNotes: clientNotes.trim() || undefined,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2200);
    } catch (err) {
      console.error('Error submitting procurement request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900">Cere Oferte Agregate SAVE</h3>
              <p className="text-xs text-zinc-500">
                Echipa SAVE va solicita oferte competitive de la furnizori verificați pentru compania ta.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-black text-lg text-zinc-900">Cererea de Ofertă a Fost Înregistrată!</h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Specialiștii SAVE Procurement preiau datele reale ale companiei tale și vor începe colectarea ofertelor personalizate. Vei fi notificat pe email când primești primele cotații.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Category */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Categorie de Cheltuieli *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SpendCategory)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900 cursor-pointer"
                >
                  <option value="Telecom">Telecom & Date Mobile</option>
                  <option value="Curierat">Curierat & Expediții</option>
                  <option value="Software">Software & Cloud SaaS</option>
                  <option value="Consumabile">Consumabile & Birotică</option>
                  <option value="Energie">Energie Electrică & Gaze</option>
                  <option value="Marketing">Marketing & Publicitate</option>
                  <option value="Transport">Transport & Combustibil</option>
                  <option value="Servicii profesionale">Servicii Profesionale (Audit / Juridic)</option>
                  <option value="Mentenanță">Mentenanță & Service</option>
                  <option value="Echipamente">Echipamente & Hardware</option>
                </select>
              </div>

              {/* Current Annual Cost */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Cheltuială Anuală Curentă (RON)</label>
                <input
                  type="number"
                  value={annualSpend || ''}
                  onChange={(e) => setAnnualSpend(Number(e.target.value))}
                  placeholder="ex: 45000"
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-mono font-medium text-zinc-900"
                />
              </div>

              {/* Current Supplier (Optional) */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Furnizor Actual (Opțional)</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="ex: Vodafone, Fan Courier, etc."
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900"
                />
              </div>

              {/* Approximate Volume */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Volum / Dimensionare (Opțional)</label>
                <input
                  type="text"
                  value={approxVolume}
                  onChange={(e) => setApproxVolume(e.target.value)}
                  placeholder="ex: 20 cartele SIM, 450 colete/lună, 8 licențe"
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Locație / Județ Deservit</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900"
                />
              </div>

              {/* Desired Contract Duration */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Durată Contract Dorită</label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900 cursor-pointer"
                >
                  <option value={12}>12 Luni (Recomandat)</option>
                  <option value={24}>24 Luni (Discount volum mai mare)</option>
                  <option value={6}>6 Luni / Spot</option>
                  <option value={0}>Fără perioadă minimă contractuală</option>
                </select>
              </div>
            </div>

            {/* Additional requirements */}
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Cerințe Particulare & Clauze Dorite (Opțional)</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={2}
                placeholder="ex: Termen de plată la 45 de zile, SLA intervenție sub 4 ore, retur gratuit etc."
                className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900 resize-none"
              />
            </div>

            {/* Client Notes */}
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700">Alte Notițe pentru Echipa SAVE (Opțional)</label>
              <input
                type="text"
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="ex: Contractul actual expiră luna viitoare..."
                className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900"
              />
            </div>

            {/* Privacy & Guarantee Notice */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Identitatea companiei este protejată. Furnizorii primesc doar date tehnice agregate de volum.</span>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Anulează
              </Button>
              <Button type="submit" variant="emerald" size="sm" disabled={isSubmitting} className="font-bold gap-1.5 shadow-md shadow-emerald-600/20">
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Se trimite cererea...' : 'Trimite Cererea de Ofertă'}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
