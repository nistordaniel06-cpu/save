'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useSave } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clsx } from 'clsx';

interface DropzoneProps {
  onUploadComplete?: () => void;
}

export function Dropzone({ onUploadComplete }: DropzoneProps) {
  const { uploadDocument } = useSave();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [lastUploadedDoc, setLastUploadedDoc] = useState<any>(null);

  const processFile = async (file: { 
    name: string; 
    type: string; 
    size: number; 
    textSnippet?: string; 
    rawFile?: File | Blob;
  }) => {
    setIsProcessing(true);
    setLastUploadedDoc(null);

    setCurrentStep('1/3: Criptare și încărcare în stocare securizată...');
    await new Promise((r) => setTimeout(r, 600));

    setCurrentStep('2/3: Extracție structurată OCR & identificare clauze...');
    await new Promise((r) => setTimeout(r, 800));

    setCurrentStep('3/3: Validare Zod și calcul scor de încredere...');
    const result = await uploadDocument(file);
    await new Promise((r) => setTimeout(r, 400));

    setIsProcessing(false);
    setLastUploadedDoc(result);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile({
        name: file.name,
        type: file.type,
        size: file.size,
        rawFile: file,
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile({
        name: file.name,
        type: file.type,
        size: file.size,
        rawFile: file,
      });
    }
  };

  // Quick Demo Pre-sets for immediate testing
  const uploadPreset = async (presetType: 'vodafone_inv' | 'dpd_ctr' | 'lyreco_unclear') => {
    if (presetType === 'vodafone_inv') {
      await processFile({
        name: 'Factura_Vodafone_Noua_Sep2026.pdf',
        type: 'application/pdf',
        size: 284000,
        textSnippet: 'Vodafone Romania SA Factura fiscala serie VF90231 Data 2026-08-31 Total de plata 1533.33 RON',
      });
    } else if (presetType === 'dpd_ctr') {
      await processFile({
        name: 'Contract_Cadru_DPD_Curierat_2026_2028.pdf',
        type: 'application/pdf',
        size: 740000,
        textSnippet: 'Contract furnizare servicii curierat DPD Romania. Durata 24 luni. Notificare 30 zile inainte de expirare.',
      });
    } else {
      await processFile({
        name: 'Scan_Factura_Consumabile_Birotica_Neclara.jpg',
        type: 'image/jpeg',
        size: 512000,
        textSnippet: 'Lyreco consumabile ambalaje scanare rezolutie redusa total aproximativ 2875 lei',
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Drop Zone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px]',
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
            : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">Extracție Inteligentă în Curs...</p>
              <p className="text-xs text-emerald-600 font-mono mt-1 animate-pulse">{currentStep}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 mb-3">
              <UploadCloud className="w-6 h-6 text-zinc-700" />
            </div>
            <p className="text-sm font-semibold text-zinc-900">
              Trage fișierele aici sau <span className="text-emerald-600 underline">răsfoiește computerul</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Formate acceptate: PDF, PNG, JPG. Extragem automat furnizorul, valoarea, categoria, termenele și clauzele de preaviz.
            </p>
          </>
        )}
      </div>

      {/* Extraction Success Card */}
      {lastUploadedDoc && lastUploadedDoc.extraction && (
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-950">Document procesat cu succes!</p>
                <p className="text-xs text-emerald-800 font-mono mt-0.5">
                  {lastUploadedDoc.fileName} → {lastUploadedDoc.extraction.supplier} (
                  {lastUploadedDoc.extraction.invoiceTotal.toLocaleString('ro-RO')} {lastUploadedDoc.extraction.currency})
                </p>
              </div>
            </div>
            <Badge
              variant={lastUploadedDoc.extraction.confidence >= 85 ? 'success' : 'warning'}
              size="sm"
            >
              Scor {lastUploadedDoc.extraction.confidence}%
            </Badge>
          </div>

          {lastUploadedDoc.extraction.needsReview && (
            <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Extracția are un scor sub 85% și necesită revizuire manuală.</span>
              </div>
            </div>
          )}

          {onUploadComplete && (
            <div className="mt-3 text-right">
              <Button size="sm" variant="primary" onClick={onUploadComplete}>
                Vezi în listă documente →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Demo Test Presets */}
      <div className="pt-2">
        <p className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sau testează instant cu documente demo:</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => uploadPreset('vodafone_inv')}
            className="p-2.5 text-left rounded-lg bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200 text-xs font-medium text-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <p className="font-semibold truncate">Factură Telecom</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">Vodafone România SA</p>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => uploadPreset('dpd_ctr')}
            className="p-2.5 text-left rounded-lg bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200 text-xs font-medium text-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <p className="font-semibold truncate">Contract Curierat</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">DPD România Cadru</p>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => uploadPreset('lyreco_unclear')}
            className="p-2.5 text-left rounded-lg bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-xs font-medium text-amber-900 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <p className="font-semibold truncate">Scan Birotică (Neclar)</p>
            <p className="text-[10px] text-amber-700 font-mono mt-0.5 truncate">Declanșează Revizuire</p>
          </button>
        </div>
      </div>
    </div>
  );
}
