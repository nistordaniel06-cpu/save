'use client';

import React, { useState } from 'react';
import { ContractItem } from '@/lib/types';
import { useSave } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  ShieldCheck, 
  Building2, 
  Calendar 
} from 'lucide-react';

interface NoticeLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: ContractItem | null;
}

export function NoticeLetterModal({ isOpen, onClose, contract }: NoticeLetterModalProps) {
  const { currentOrg, currentUser } = useSave();

  const [contractNumber, setContractNumber] = useState(contract?.title || 'CTR-2024/09');
  const [supplierName, setSupplierName] = useState(contract?.supplierName || 'Furnizor SRL');
  const [contractClause, setContractClause] = useState('Art. 12 din Contract (Încetare la termen)');
  const [actionType, setActionType] = useState<'termination' | 'renegotiation'>('termination');
  const [signerName, setSignerName] = useState(currentUser.fullName || 'Administrator');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const letterText = actionType === 'termination' ? `
Către: ${supplierName}
În atenția: Departamentului Comercial / Contracte
Data: ${today}

NOTIFICARE DE ÎNCETARE A CONTRACTULUI LA TERMEN
Referință: Contractul de prestări servicii nr. ${contractNumber}

Stimați parteneri,

Prin prezenta, subscrisa ${currentOrg.name || 'Compania Noastră'}, cu sediul în ${currentOrg.city || 'București'}, CIF ${currentOrg.cui || 'RO14399840'}, reprezentată legal prin ${signerName}, în calitate de Beneficiar,

Vă notificăm în mod oficial decizia de a NU prelungi și de a înceta la termenul contractual valabilitatea Contractului nr. ${contractNumber}, în conformitate cu prevederile ${contractClause} și dispozițiile Codului Civil privind denunțarea unilaterală / încetarea contractelor cu durată determinată.

Vă rugăm să luați act de faptul că, începând cu data expirării perioadei curente de derulare, nu autorizăm nicio prelungire tacită sau emitere de facturi suplimentare pentru perioadele ulterioare.

Vă solicităm confirmarea în scris a primirii prezentei notificări și transmiterea situației finale a decontului la zi.

Cu stimă,
${currentOrg.name || 'Companie'}
Reprezentant Legal: ${signerName}
Semnătura și Ștampila
`.trim() : `
Către: ${supplierName}
În atenția: Departamentului Vânzări / Key Account Management
Data: ${today}

SOLICITARE DE RENEGOCIERE ȘI ALINIERE LA PIAȚĂ A CONDIȚIILOR COMERCIALE
Referință: Contractul nr. ${contractNumber} (${contract?.category || 'Servicii'})

Stimați parteneri,

În vederea continuării colaborării comerciale dintre ${currentOrg.name || 'Compania Noastră'} și ${supplierName}, dorim să vă aducem la cunoștință că, în cadrul auditului intern periodic de achiziții OPEX, am identificat discrepanțe semnificative între tarifele contractuale actuale și noile benchmark-uri de piață B2B din România.

Înainte de expirarea termenului de preaviz prevăzut la ${contractClause}, vă solicităm o întâlnire de lucru și transmiterea unei oferte actualizate care să includă:
1. O ajustare a tarifelor unitare la nivelul competitiv al pieței (P25);
2. Extinderea termenului de plată la minim 30–45 de zile;
3. Eliminarea clauzelor de indexare automată fără acord prealabil.

În lipsa unui acord de renegociere până la finalul lunii curente, ne rezervăm dreptul contractual de a denunța contractul și de a transfera volumul către un furnizor alternativ.

Cu respect,
${currentOrg.name || 'Companie'}
Reprezentant: ${signerName}
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Notificare Oficiala - ${contractNumber}</title>
          <style>
            body { font-family: sans-serif; font-size: 13px; line-height: 1.6; padding: 40px; color: #111; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <pre>${letterText}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900">Generator Notificare Preaviz / Reziliere</h3>
              <p className="text-xs text-zinc-500">
                Generează un document juridic formal conform Codului Civil Român pentru oprirea reînnoirilor automate.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Type Toggle */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActionType('termination')}
            className={`p-2.5 rounded-lg border font-bold transition-all cursor-pointer ${
              actionType === 'termination'
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            1. Notificare de Încetare / Reziliere
          </button>
          <button
            type="button"
            onClick={() => setActionType('renegotiation')}
            className={`p-2.5 rounded-lg border font-bold transition-all cursor-pointer ${
              actionType === 'renegotiation'
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            2. Solicitare de Renegociere Preț
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Furnizor Vizat</label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900"
            />
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Număr Contract</label>
            <input
              type="text"
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Clauză / Articol Preaviz</label>
            <input
              type="text"
              value={contractClause}
              onChange={(e) => setContractClause(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900"
            />
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Nume Semnatar Legal</label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900"
            />
          </div>
        </div>

        {/* Generated Letter Preview */}
        <div className="space-y-1">
          <label className="font-semibold text-zinc-700 text-xs block">Text Formal Generat</label>
          <pre className="p-3.5 bg-zinc-900 text-zinc-100 text-[11px] rounded-xl font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto border border-zinc-800">
            {letterText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <span className="text-[11px] text-zinc-400">
            Valabil juridic conform Codului Civil Român.
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 font-semibold text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Tipărește Adresă</span>
            </Button>

            <Button
              variant="emerald"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiat în Clipboard!' : 'Copiază Textul'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
