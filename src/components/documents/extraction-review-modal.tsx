'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { DocumentItem, SpendCategory, DocumentType } from '@/lib/types';
import { useSave } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ExtractionReviewModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExtractionReviewModal({
  document,
  isOpen,
  onClose,
}: ExtractionReviewModalProps) {
  const { updateExtraction } = useSave();

  const extraction = document?.extraction;

  const [supplier, setSupplier] = useState(extraction?.supplier || '');
  const [documentType, setDocumentType] = useState<DocumentType>(extraction?.documentType || 'invoice');
  const [category, setCategory] = useState<SpendCategory>(extraction?.category || 'Servicii');
  const [invoiceTotal, setInvoiceTotal] = useState<number>(extraction?.invoiceTotal || 0);
  const [currency, setCurrency] = useState(extraction?.currency || 'RON');
  const [contractStart, setContractStart] = useState(extraction?.contractStart || '');
  const [contractEnd, setContractEnd] = useState(extraction?.contractEnd || '');
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(extraction?.noticePeriodDays || 30);
  const [automaticRenewal, setAutomaticRenewal] = useState(extraction?.automaticRenewal ?? true);
  const [reviewNotes, setReviewNotes] = useState(extraction?.reviewNotes || '');

  // Keep form updated when document changes
  React.useEffect(() => {
    if (document?.extraction) {
      setSupplier(document.extraction.supplier);
      setDocumentType(document.extraction.documentType);
      setCategory(document.extraction.category);
      setInvoiceTotal(document.extraction.invoiceTotal);
      setCurrency(document.extraction.currency);
      setContractStart(document.extraction.contractStart || '');
      setContractEnd(document.extraction.contractEnd || '');
      setNoticePeriodDays(document.extraction.noticePeriodDays || 30);
      setAutomaticRenewal(document.extraction.automaticRenewal);
      setReviewNotes(document.extraction.reviewNotes || '');
    }
  }, [document]);

  if (!document || !extraction) return null;

  const handleSave = () => {
    updateExtraction(document.id, {
      supplier,
      documentType,
      category,
      invoiceTotal: Number(invoiceTotal),
      currency,
      contractStart: contractStart || null,
      contractEnd: contractEnd || null,
      noticePeriodDays: Number(noticePeriodDays) || null,
      automaticRenewal,
      reviewNotes: 'Verificat și validat manual de către utilizator.',
      confidence: 100, // Validated by human
    });
    onClose();
  };

  const isLowConfidence = extraction.confidence < 85;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revizuire & Validare Extracție Document"
      description={`Fișier: ${document.fileName} • Căsuță de audit și corecție a datelor financiare extrase de AI.`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Confidence Banner */}
        {isLowConfidence ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">
                Atenție: Scor de încredere scăzut ({extraction.confidence}%)
              </p>
              <p className="mt-0.5 text-amber-800">
                Sistemul AI a marcat acest document pentru revizuire manuală din cauza calității scanării sau a ambiguității furnizorului. Te rugăm să verifici valorile de mai jos.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Extracție de înaltă acuratețe ({extraction.confidence}%)</span>
            </div>
            <Badge variant="success" size="sm">Validare Reușită</Badge>
          </div>
        )}

        {/* Editable Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supplier Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Denumire Furnizor</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Categorie Cheltuială</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SpendCategory)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
            >
              <option value="Telecom">Telecom</option>
              <option value="Software">Software & SaaS</option>
              <option value="Curierat">Curierat & Logistică</option>
              <option value="Consumabile">Consumabile & Birotică</option>
              <option value="Energie">Energie & Utilități</option>
              <option value="Servicii">Servicii & Consultanță</option>
              <option value="Altele">Altele</option>
            </select>
          </div>

          {/* Document Type */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Tip Document</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
            >
              <option value="invoice">Factură Fiscală</option>
              <option value="supplier_contract">Contract Furnizor</option>
              <option value="subscription_agreement">Abonament / Serviciu</option>
              <option value="quote">Ofertă Comercială / Cotație</option>
            </select>
          </div>

          {/* Total Value */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Valoare Totală (RON)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={invoiceTotal}
                onChange={(e) => setInvoiceTotal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white font-mono"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">RON</span>
            </div>
          </div>

          {/* Contract Dates if applicable */}
          {(documentType === 'supplier_contract' || documentType === 'subscription_agreement') && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Data Început Contract</label>
                <input
                  type="date"
                  value={contractStart}
                  onChange={(e) => setContractStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Data Expirare / Reînnoire</label>
                <input
                  type="date"
                  value={contractEnd}
                  onChange={(e) => setContractEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Termen Notificare Preaviz (Zile)</label>
                <input
                  type="number"
                  value={noticePeriodDays}
                  onChange={(e) => setNoticePeriodDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  id="autoRenew"
                  type="checkbox"
                  checked={automaticRenewal}
                  onChange={(e) => setAutomaticRenewal(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                />
                <label htmlFor="autoRenew" className="text-xs font-medium text-zinc-800 cursor-pointer">
                  Clauză de tacită prelungire (Reînnoire automată)
                </label>
              </div>
            </>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">Note Revizuire / Observații Utilizator</label>
          <textarea
            rows={2}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Adaugă detalii relevante despre contract sau tarife..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Anulează
          </Button>
          <Button variant="emerald" size="sm" onClick={handleSave} className="gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmă & Validează Extracția</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
