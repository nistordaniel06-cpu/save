'use client';

import React from 'react';
import { useSave } from '@/lib/context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Lock, 
  CheckCircle2,
  Building2,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { MIN_ANONYMOUS_POOL_MEMBERS, toAnonymousPoolView } from '@/lib/demand/pool-manager';

export default function SupplierDashboardPage() {
  const { demandPools, supplierBids, marketplaceSuppliers } = useSave();

  // Filter pools strictly using privacy threshold
  const anonymousPools = demandPools
    .map(toAnonymousPoolView)
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const openPools = anonymousPools.filter((p) => p.status === 'open_for_bids');
  const totalMarketSpend = openPools.reduce((sum, p) => sum + p.approximateAnnualSpend, 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-purple-950 text-white border border-zinc-800 shadow-md">
        <div className="max-w-3xl space-y-2">
          <Badge variant="purple" size="sm">Marketplace B2B Verificat</Badge>
          <h1 className="text-2xl font-black tracking-tight">
            Accesează Volume Comerciale Agregate de la IMM-uri din România
          </h1>
          <p className="text-xs text-zinc-300 leading-relaxed">
            SAVE combină cererea reală a zeci de IMM-uri verificate în grupuri de cumpărare (Demand Pools). Furnizorii parteneri licitează direct volume mari, reducând costurile de achiziție de clienți (CAC) la zero.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Pool-uri Deschise la Licitare</CardDescription>
            <CardTitle className="text-2xl font-black font-mono text-zinc-900">{openPools.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Toate întrunesc pragul de confidențialitate</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Valoare Comercială Agregată</CardDescription>
            <CardTitle className="text-2xl font-black font-mono text-emerald-600">
              ~{(totalMarketSpend / 1000).toFixed(0)}k lei/an
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-zinc-500">Bugete anuale cumulate din contracte reale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Oferte Depuse de Compania Ta</CardDescription>
            <CardTitle className="text-2xl font-black font-mono text-purple-700">{supplierBids.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-zinc-500">
              {supplierBids.filter(b => b.status === 'selected' || b.status === 'shortlisted').length} oferte pe lista scurtă
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Cost de Achiziție Client (CAC)</CardDescription>
            <CardTitle className="text-2xl font-black font-mono text-blue-600">0 LEI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-zinc-500">Contractezi simultan grupuri întregi</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Oportunități Agregate Recente</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Cereri verificate de SAVE din contracte reale, gata pentru oferte de volum.
            </p>
          </div>

          <Link href="/supplier/opportunities">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <span>Vezi toate oportunitățile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {openPools.slice(0, 3).map((pool) => (
            <Card key={pool.poolId} className="hover:border-zinc-300 transition-all flex flex-col justify-between">
              <div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="info" size="sm">{pool.category}</Badge>
                    <Badge variant="warning" size="sm">Licitare Deschisă</Badge>
                  </div>
                  <CardTitle className="text-sm mt-2 text-zinc-900 leading-snug">{pool.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {pool.serviceType} • Regiune: {pool.region}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-1 text-xs">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Companii în grup:</span>
                      <span className="font-bold text-zinc-900">{pool.totalCompanies} IMM-uri</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Volum total cumulat:</span>
                      <span className="font-bold text-zinc-900">{pool.totalVolume}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Spend anual estimat:</span>
                      <span className="font-bold text-emerald-600">~{pool.approximateAnnualSpend.toLocaleString('ro-RO')} lei</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>Termen: {pool.biddingEndsAt ? new Date(pool.biddingEndsAt).toLocaleDateString('ro-RO') : 'Activ'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Lock className="w-3 h-3" />
                      <span>Anonimizat</span>
                    </span>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-2 border-t border-zinc-100">
                <Link href="/supplier/opportunities" className="w-full">
                  <Button variant="purple" size="sm" className="w-full text-xs font-semibold">
                    <span>Depune Ofertă de Preț</span>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Rules of Engagement for Suppliers */}
      <Card className="bg-zinc-50 border-zinc-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Regulile de Licitare Anonimă & Confidențialitate SAVE</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-zinc-600 space-y-1.5">
          <p>• <strong>Protecția clienților:</strong> Pentru a proteja companiile membre, identitatea, datele de contact și istoricul individual de consum sunt strict anonimizate până în momentul acceptării ofertei.</p>
          <p>• <strong>Prag minim:</strong> Oportunitățile devin vizibile numai când grupul atinge cel puțin 3 companii independente (MIN_ANONYMOUS_POOL_MEMBERS = 3).</p>
          <p>• <strong>Selectarea ofertei:</strong> Echipa SAVE analizează prețul unitar propus, durata blocată a tarifului și SLA-ul oferit pentru a alege cea mai competitivă ofertă pentru membrii grupului.</p>
        </CardContent>
      </Card>
    </div>
  );
}
