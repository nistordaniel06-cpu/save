'use client';

import React from 'react';
import { useSave } from '@/lib/context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { SupplierBidStatus } from '@/lib/types';

export default function SupplierBidsPage() {
  const { supplierBids, demandPools } = useSave();

  const getStatusBadge = (status: SupplierBidStatus) => {
    switch (status) {
      case 'selected':
        return <Badge variant="success" size="sm">Câștigătoare (Selectată)</Badge>;
      case 'shortlisted':
        return <Badge variant="purple" size="sm">Listă Scurtă</Badge>;
      case 'submitted':
        return <Badge variant="warning" size="sm">În Evaluare SAVE</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm">Neselectată</Badge>;
      case 'expired':
        return <Badge variant="default" size="sm">Expirată</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Ofertele Mele Depuse</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Urmărește stadiul de evaluare al ofertelor trimise pentru grupurile de cerere agregată.
          </p>
        </div>

        <Link href="/supplier/opportunities">
          <Button variant="purple" size="sm" className="gap-1.5 text-xs">
            <span>Explorează noi oportunități</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {supplierBids.length === 0 ? (
        <Card className="p-8 text-center bg-zinc-50 border-dashed">
          <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-700">Nu ai depus nicio ofertă încă.</p>
          <p className="text-xs text-zinc-400 mt-1">Descoperă oportunitățile agregate active și licitează direct volume de la IMM-uri.</p>
          <Link href="/supplier/opportunities" className="mt-4 inline-block">
            <Button size="sm" variant="purple">Vezi Oportunitățile</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {supplierBids.map((bid) => {
            const pool = demandPools.find((p) => p.id === bid.demandPoolId);

            return (
              <Card key={bid.id} className="hover:border-zinc-300 transition-all">
                <CardHeader className="pb-3 border-b border-zinc-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base text-zinc-900">{pool?.title || 'Demand Pool Agregat'}</CardTitle>
                        {getStatusBadge(bid.status)}
                      </div>
                      <CardDescription className="text-xs mt-0.5">
                        Depusă de: <strong className="text-zinc-700">{bid.marketplaceSupplierName}</strong> • {new Date(bid.createdAt).toLocaleDateString('ro-RO')}
                      </CardDescription>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-lg font-bold text-zinc-900">
                        {bid.pricePerUnit.toLocaleString('ro-RO')} lei
                      </span>
                      <span className="text-xs text-zinc-400 block">/ unitate / lună</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-sans font-semibold">Valoare Lunară Grup</span>
                      <p className="text-sm font-bold text-zinc-900 mt-0.5">
                        ~{bid.estimatedMonthlyTotal.toLocaleString('ro-RO')} lei
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-sans font-semibold">Valoare Contractuală</span>
                      <p className="text-sm font-bold text-emerald-600 mt-0.5">
                        ~{bid.estimatedAnnualTotal.toLocaleString('ro-RO')} lei/an
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-sans font-semibold">Durată Blocată</span>
                      <p className="text-sm font-bold text-zinc-900 mt-0.5">
                        {bid.contractDurationMonths} luni
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-sans font-semibold">Volum Minim</span>
                      <p className="text-sm font-bold text-zinc-900 mt-0.5">
                        {bid.minimumVolume} unități
                      </p>
                    </div>
                  </div>

                  {bid.slaSummary && (
                    <p className="text-zinc-600">
                      <strong>SLA & Suport:</strong> {bid.slaSummary}
                    </p>
                  )}

                  {bid.benefits && bid.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="font-semibold text-zinc-700">Beneficii:</span>
                      {bid.benefits.map((b, i) => (
                        <span key={i} className="px-2 py-0.5 bg-zinc-100 rounded text-[11px] text-zinc-600 border border-zinc-200">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {bid.conditions && (
                    <p className="text-[11px] text-zinc-500 italic">
                      Clauze: {bid.conditions}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
