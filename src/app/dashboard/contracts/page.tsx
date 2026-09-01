'use client';

import React from 'react';
import { useSave } from '@/lib/context';
import { calculateContractRadar } from '@/lib/analytics/contract-calculator';
import { ContractTable } from '@/components/contracts/contract-table';
import { StatCard } from '@/components/ui/stat-card';
import { FileCheck, AlertTriangle, Clock, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContractsPage() {
  const { contracts, currentOrg } = useSave();
  const radar = calculateContractRadar(contracts);

  const exportContractsCsv = () => {
    const headers = ['Furnizor / Contract', 'Categorie', 'Valoare Anuala (RON)', 'Data Expirare', 'Termen Preaviz', 'Zile Ramase Expirare', 'Prelungire Tacita', 'Status'];
    const rows = contracts.map((c) => [
      `"${(c.supplierName || c.title).replace(/"/g, '""')}"`,
      `"${c.category}"`,
      c.annualValue.toFixed(2),
      c.expiryDate || 'Nedeterminat',
      c.noticeDeadline || 'Fara preaviz',
      c.daysUntilExpiry !== null ? c.daysUntilExpiry : 'N/A',
      c.automaticRenewal ? 'DA (Prelungire Automata)' : 'NU',
      c.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SAVE_Contracte_${currentOrg?.name?.replace(/\s+/g, '_') || 'Companie'}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-emerald-600" />
            <span>Monitorizare Contracte & Radar Reînnoiri</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Urmărește termenele limită de notificare a preavizului, clauzele de reînnoire automată și oportunitățile de renegociere înainte de blocarea în tarife vechi.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportContractsCsv}
          disabled={contracts.length === 0}
          className="shrink-0 flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-zinc-600" />
          <span>Exportă CSV Contracte</span>
        </Button>
      </div>

      {/* Radar KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Contracte Active"
          value={radar.totalContracts}
          subtitle={`${radar.totalAnnualValueRon.toLocaleString('ro-RO')} lei/an acoperit`}
          badgeText="Total"
          badgeVariant="default"
          icon={FileCheck}
        />
        <StatCard
          title="Expiră în ≤ 30 Zile"
          value={radar.expiringIn30Days.length}
          subtitle="Fereastră critică de acțiune"
          badgeText={radar.expiringIn30Days.length > 0 ? "URGENT" : "OK"}
          badgeVariant={radar.expiringIn30Days.length > 0 ? "danger" : "success"}
          icon={AlertTriangle}
          highlight={radar.expiringIn30Days.length > 0}
        />
        <StatCard
          title="Expiră în 31–60 Zile"
          value={radar.expiringIn60Days.length}
          subtitle="Pregătire oferte alternative"
          badgeText="Atenție"
          badgeVariant="warning"
          icon={Clock}
        />
        <StatCard
          title="Prelungire Tacită"
          value={radar.autoRenewalCount}
          subtitle="Clauză reînnoire automată"
          badgeText="Monitorizat"
          badgeVariant="purple"
          icon={RefreshCw}
        />
      </div>

      {/* Main Table & Renewal Radar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">
            Registru Contracte & Alerte Preaviz
          </h2>
        </div>
        <ContractTable />
      </div>
    </div>
  );
}
