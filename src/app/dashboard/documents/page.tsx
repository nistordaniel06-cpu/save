'use client';

import React from 'react';
import Link from 'next/link';
import { useSave } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/documents/dropzone';
import { DocumentList } from '@/components/documents/document-list';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileText, Shield, Sparkles, CheckCircle2, AlertTriangle, Zap, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DocumentsPage() {
  const { documents } = useSave();

  const totalDocs = documents.length;
  const requiresReviewCount = documents.filter((d) => d.status === 'requires_review').length;
  const verifiedCount = documents.filter((d) => d.status === 'verified' || d.status === 'extracted').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>Documente & Extracție Facturi</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Încarcă facturi fiscale, contracte-cadru și acorduri de abonament sau importă pachete XML / ZIP descărcate din SPV ANAF.
          </p>
        </div>

        <Link href="/settings/company">
          <Button variant="purple" size="sm" className="gap-2 font-bold shadow-sm">
            <Zap className="w-3.5 h-3.5" />
            <span>Importă din SPV (e-Factura)</span>
          </Button>
        </Link>
      </div>

      {/* Upload Zone Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
          <div>
            <CardTitle>Încărcare Documente & Facturi</CardTitle>
            <CardDescription>
              Trage fișiere sau selectează documentele contabile ale companiei.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Criptare AES-256</span>
          </div>
        </CardHeader>
        <CardContent>
          <Dropzone />
        </CardContent>
      </Card>

      {/* Review Alert if items need review */}
      {requiresReviewCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-950">
                {requiresReviewCount} document{requiresReviewCount > 1 ? 'e' : ''} necesită revizuire manuală
              </p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Unele scanări au un scor de încredere sub 85%. Te rugăm să verifici valorile extrase înainte de generarea raportului final.
              </p>
            </div>
          </div>
          <Badge variant="warning" size="sm">Audit Necesar</Badge>
        </div>
      )}

      {/* Documents Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">
            Arhivă Documente & Stare Extracție ({totalDocs})
          </h2>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="text-emerald-700 font-semibold">{verifiedCount} Validate</span>
            <span>•</span>
            <span className="text-amber-700 font-semibold">{requiresReviewCount} În Revizuire</span>
          </div>
        </div>

        <DocumentList />
      </div>
    </div>
  );
}
