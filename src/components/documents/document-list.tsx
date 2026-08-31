'use client';

import React, { useState } from 'react';
import { DocumentItem, DocumentType, DocumentStatus } from '@/lib/types';
import { useSave } from '@/lib/context';
import { Badge, ConfidenceBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  FileCheck, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { ExtractionReviewModal } from './extraction-review-modal';
import { clsx } from 'clsx';

export function DocumentList() {
  const { documents, deleteDocument } = useSave();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [reviewingDoc, setReviewingDoc] = useState<DocumentItem | null>(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.supplierName && doc.supplierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.extraction?.category && doc.extraction.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || doc.documentType === selectedType;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getDocTypeBadge = (type: DocumentType) => {
    switch (type) {
      case 'invoice':
        return <Badge variant="default" size="sm">Factură</Badge>;
      case 'supplier_contract':
        return <Badge variant="info" size="sm">Contract</Badge>;
      case 'subscription_agreement':
        return <Badge variant="purple" size="sm">Abonament</Badge>;
      case 'quote':
        return <Badge variant="warning" size="sm">Ofertă</Badge>;
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'extracted':
        return <Badge variant="success" size="sm">Extras AI</Badge>;
      case 'verified':
        return <Badge variant="success" size="sm">Verificat</Badge>;
      case 'requires_review':
        return <Badge variant="warning" size="sm">Necesită Revizuire</Badge>;
      case 'processing':
        return <Badge variant="info" size="sm">În Procesare</Badge>;
      case 'error':
        return <Badge variant="danger" size="sm">Eroare</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Caută după furnizor, fișier sau categorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
          >
            <option value="all">Toate Tipurile</option>
            <option value="invoice">Facturi</option>
            <option value="supplier_contract">Contracte</option>
            <option value="subscription_agreement">Abonamente</option>
            <option value="quote">Oferte</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
          >
            <option value="all">Toate Statusurile</option>
            <option value="requires_review">Necesită Revizuire</option>
            <option value="extracted">Extrase AI</option>
            <option value="verified">Verificate</option>
            <option value="processing">În Procesare</option>
          </select>
        </div>
      </div>

      {/* Document Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Furnizor & Categorie</th>
                <th className="px-4 py-3">Tip & Valoare</th>
                <th className="px-4 py-3">Încredere AI</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400">
                    Niciun document nu corespunde criteriilor selectate.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const extraction = doc.extraction;
                  return (
                    <tr
                      key={doc.id}
                      className={clsx(
                        'hover:bg-zinc-50/80 transition-colors',
                        doc.status === 'requires_review' && 'bg-amber-50/30'
                      )}
                    >
                      {/* Document Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                            {doc.documentType === 'supplier_contract' ? (
                              <FileCheck className="w-4 h-4 text-blue-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 truncate max-w-[200px] sm:max-w-xs">
                              {doc.fileName}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              {(doc.fileSizeBytes / 1024).toFixed(0)} KB • {new Date(doc.createdAt).toLocaleDateString('ro-RO')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Supplier & Category */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-medium text-zinc-900 truncate max-w-[180px]">
                            {extraction?.supplier || doc.supplierName || 'În așteptare...'}
                          </p>
                          {extraction?.category && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {extraction.category}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type & Total Value */}
                      <td className="px-4 py-3.5">
                        <div>
                          <div className="mb-1">{getDocTypeBadge(doc.documentType)}</div>
                          <p className="font-mono font-bold text-zinc-900">
                            {extraction?.invoiceTotal
                              ? `${extraction.invoiceTotal.toLocaleString('ro-RO')} ${extraction.currency}`
                              : '—'}
                          </p>
                        </div>
                      </td>

                      {/* AI Confidence */}
                      <td className="px-4 py-3.5">
                        {extraction ? (
                          <ConfidenceBadge confidence={extraction.confidence} />
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-mono">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">{getStatusBadge(doc.status)}</td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant={doc.status === 'requires_review' ? 'primary' : 'outline'}
                            onClick={() => setReviewingDoc(doc)}
                            className="h-7 text-xs px-2.5 gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{doc.status === 'requires_review' ? 'Revizuiește' : 'Detalii'}</span>
                          </Button>

                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Șterge document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Review Modal */}
      {reviewingDoc && (
        <ExtractionReviewModal
          document={reviewingDoc}
          isOpen={!!reviewingDoc}
          onClose={() => setReviewingDoc(null)}
        />
      )}
    </div>
  );
}
