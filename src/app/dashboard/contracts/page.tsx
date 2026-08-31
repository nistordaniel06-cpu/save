'use client';

import React from 'react';
import { useSave } from '@/lib/context';
import { calculateContractRadar } from '@/lib/analytics/contract-calculator';
import { ContractTable } from '@/components/contracts/contract-table';
import { StatCard } from '@/components/ui/stat-card';
import { FileCheck, AlertTriangle, Clock, RefreshCw, Calendar } from 'lucide-react';

export default function ContractsPage() {
  const { contracts } = useSave();
  const radar = calculateContractRadar(contracts);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
          <FileCheck className="w-6 h-6 text-emerald-600" />
          <span>Monitorizare Contracte & Radar Reînnoiri</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Urmărește termenele limită de notificare a preavizului, clauzele de reînnoire automată și oportunitățile de renegociere înainte de blocarea în tarife vechi.
        </p>
      </div>

      {/* Radar KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
