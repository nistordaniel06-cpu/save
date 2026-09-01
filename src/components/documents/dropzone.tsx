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
  const { uploadDocument, isDemoMode } = useSave();
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

  const readFileContent = async (file: File): Promise<string | undefined> => {
    if (file.name.endsWith('.xml') || file.type.includes('xml') || file.type.includes('text')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsText(file);
      });
    }
    return undefined;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const textContent = await readFileContent(file);
      await processFile({
        name: file.name,
        type: file.type || (file.name.endsWith('.xml') ? 'application/xml' : 'application/pdf'),
        size: file.size,
        textSnippet: textContent,
        rawFile: file,
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const textContent = await readFileContent(file);
      await processFile({
        name: file.name,
        type: file.type || (file.name.endsWith('.xml') ? 'application/xml' : 'application/pdf'),
        size: file.size,
        textSnippet: textContent,
        rawFile: file,
      });
    }
  };

  // Quick Demo Pre-sets for immediate testing
  const uploadPreset = async (presetType: 'vodafone_inv' | 'dpd_ctr' | 'lyreco_unclear' | 'efactura_xml') => {
    if (presetType === 'efactura_xml') {
      const sampleXml = `<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>FAC-ANAF-2026-9042</cbc:ID>
  <cbc:IssueDate>2026-08-30</cbc:IssueDate>
  <cbc:DueDate>2026-09-30</cbc:DueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>RO 17563040</cbc:CompanyID>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>DPD România (Dynamic Parcel Distribution SA)</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="RON">6596.64</cbc:TaxExclusiveAmount>
    <cbc:PayableAmount currencyID="RON">7850.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:InvoicedQuantity>612</cbc:InvoicedQuantity>
    <cac:Price>
      <cbc:PriceAmount currencyID="RON">10.78</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

      await processFile({
        name: 'e-Factura_DPD_Curierat_August2026.xml',
        type: 'application/xml',
        size: 3200,
        textSnippet: sampleXml,
      });
    } else if (presetType === 'vodafone_inv') {
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
          accept=".pdf,.jpg,.jpeg,.png,.xml,.xlsx,.csv"
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
              Formate acceptate: <strong>XML (e-Factura ANAF)</strong>, PDF, PNG, JPG. Extragem instant datele structurate și clauzele de preaviz.
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

      {/* Real Formats & Upload Actions */}
      <div className="pt-2">
        <p className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>Canale de Încărcare & Formate Suportate:</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className="p-2.5 text-left rounded-lg bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 text-xs font-medium text-zinc-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <p className="font-bold truncate">e-Factura XML</p>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-mono font-bold">Standard</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">ANAF UBL 2.1 Direct</p>
          </div>

          <div
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className="p-2.5 text-left rounded-lg bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 text-xs font-medium text-zinc-800 transition-colors cursor-pointer"
          >
            <p className="font-semibold truncate">Documente PDF</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">Facturi & Contracte</p>
          </div>

          <div
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className="p-2.5 text-left rounded-lg bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 text-xs font-medium text-zinc-800 transition-colors cursor-pointer"
          >
            <p className="font-semibold truncate">Imagini PNG / JPG</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">Scanări & Chitanțe</p>
          </div>

          <div className="p-2.5 text-left rounded-lg bg-zinc-50/50 border border-dashed border-zinc-300 text-xs font-medium text-zinc-400">
            <div className="flex items-center justify-between">
              <p className="font-semibold truncate">Conectare RO e-Factura</p>
              <span className="text-[9px] bg-zinc-200 text-zinc-700 px-1 rounded font-mono">În curând</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">Sincronizare SPV ANAF</p>
          </div>
        </div>
      </div>

      {/* Demo Test Presets — Strictly available ONLY in Demo Mode */}
      {isDemoMode && (
        <div className="pt-2 border-t border-zinc-200/80">
          <p className="text-xs font-medium text-amber-800 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Documente Demonstrative de Test (Mod Demo):</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => uploadPreset('efactura_xml')}
              className="p-2.5 text-left rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-xs font-medium text-emerald-950 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold truncate">e-Factura XML</p>
                <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1 rounded font-mono font-bold">100%</span>
              </div>
              <p className="text-[10px] text-emerald-800 font-mono mt-0.5 truncate">ANAF UBL 2.1 Standard</p>
            </button>

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
      )}
    </div>
  );
}
