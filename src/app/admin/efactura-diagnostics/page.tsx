'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminAuthGate } from '@/components/admin/admin-auth-gate';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Key, 
  Server, 
  Globe, 
  FileCode, 
  Lock, 
  ArrowLeft,
  Info
} from 'lucide-react';
import { runAnafDiagnostics, AnafDiagnosticsReport } from '@/lib/efactura/anaf-diagnostics';

export default function EfacturaDiagnosticsPage() {
  const [report, setReport] = useState<AnafDiagnosticsReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/efactura/diagnostics');
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setReport(runAnafDiagnostics());
      }
    } catch (err) {
      setReport(runAnafDiagnostics());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  return (
    <AdminAuthGate>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin/companies" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Înapoi la Companii</span>
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2.5">
              <Zap className="w-6 h-6 text-purple-600" />
              <span>Diagnostic Oficial ANAF OAuth & e-Factura API</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Audit tehnic al componentelor de autorizare server-side și servicii web REST ANAF. Niciun secret sau token nu este expus în browser.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={fetchDiagnostics}
              className="gap-1.5 border-zinc-300 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-evaluează Stare</span>
            </Button>
          </div>
        </div>

        {/* Diagnostic Status Summary Card */}
        {report && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-zinc-200 bg-white">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Status Global Integrare</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={
                    report.overallStatus === 'ready' ? 'success' : 
                    report.overallStatus === 'incomplete' ? 'warning' : 'danger'
                  }
                  size="md"
                >
                  {report.overallStatus === 'ready' ? '✓ Configurat Complet' : 
                   report.overallStatus === 'incomplete' ? 'Configurare Parțială' : 'Necesită Configurare'}
                </Badge>
              </div>
            </Card>

            <Card className="p-4 border-zinc-200 bg-white">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Componente Verificate</span>
              <p className="text-lg font-mono font-bold text-zinc-900 mt-1">
                {report.configuredCount} / {report.totalChecks}
              </p>
              <span className="text-[10px] text-zinc-500">componente gata de producție</span>
            </Card>

            <Card className="p-4 border-zinc-200 bg-white">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Ultima Verificare</span>
              <p className="text-xs font-mono font-semibold text-zinc-800 mt-1">
                {new Date(report.checkedAt).toLocaleTimeString('ro-RO')}
              </p>
              <span className="text-[10px] text-zinc-500">verificare automată server</span>
            </Card>
          </div>
        )}

        {/* Two-Stage Architecture Notice */}
        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl flex items-start gap-3 text-xs text-purple-950">
          <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Arhitectură în 2 Etape (Two-Stage Integration):</strong>
            <p className="text-purple-900 leading-relaxed">
              <strong>Etapa 1 (Producție Activă):</strong> Importul fișierelor XML / arhive ZIP descărcate manual din SPV funcționează 100% determinist și generează automat cheltuieli și furnizori.<br />
              <strong>Etapa 2 (Sincronizare Automată ANAF):</strong> Necesită autorizarea aplicației SAVE în portalul ANAF Developer și configurarea variabilelor OAuth2 pe server.
            </p>
          </div>
        </div>

        {/* Detailed Components Table */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="font-bold text-xs text-zinc-900 uppercase tracking-wider">
              Componente Tehnice & Stare Autorizare
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">Zero Credential Exposure Protocol</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Componentă</th>
                <th className="py-3 px-4">Categorie</th>
                <th className="py-3 px-4">Stare</th>
                <th className="py-3 px-4">Descriere & Recomandare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {report?.items.map((item) => (
                <tr key={item.key} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-zinc-900">
                    <div className="flex items-center gap-2">
                      {item.status === 'configured' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : item.status === 'pending' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize font-mono text-zinc-500 text-[11px]">
                    {item.category}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={item.status === 'configured' ? 'success' : item.status === 'pending' ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {item.status === 'configured' ? '✅ Configurat' : item.status === 'pending' ? '⏳ În Așteptare' : '❌ Lipsă'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-zinc-600">
                    <div>{item.description}</div>
                    {item.recommendation && (
                      <span className="text-[10px] text-amber-800 font-mono block mt-0.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                        💡 {item.recommendation}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminAuthGate>
  );
}
