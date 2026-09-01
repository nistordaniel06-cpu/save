'use client';

import React, { useState } from 'react';
import { useSave } from '@/lib/context';
import { calculateSpendSummary } from '@/lib/analytics/spend-calculator';
import { SpendChart } from '@/components/dashboard/spend-chart';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Building2, Layers, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpendCategory } from '@/lib/types';

export default function SpendPage() {
  const { spendRecords, currentOrg } = useSave();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchSupplier, setSearchSupplier] = useState('');

  const summary = calculateSpendSummary(spendRecords);

  const filteredSuppliers = summary.supplierBreakdown.filter((sup) => {
    const matchesCat = selectedCategory === 'all' || sup.category === selectedCategory;
    const matchesSearch = sup.supplierName.toLowerCase().includes(searchSupplier.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const exportCsv = () => {
    const headers = ['Furnizor', 'Categorie', 'Rulaj Anual (RON)', 'Pondere in Total (%)'];
    const rows = summary.supplierBreakdown.map((s) => [
      `"${s.supplierName.replace(/"/g, '""')}"`,
      `"${s.category}"`,
      s.annualSpend.toFixed(2),
      s.percentage.toFixed(1),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SAVE_Spend_Report_${currentOrg?.name?.replace(/\s+/g, '_') || 'Companie'}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Analiză Detaliată a Cheltuielilor Operaționale (Spend Analysis)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitorizare granulară a cheltuielilor agregate pe furnizori, categorii și predictibilitate contractuală.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={summary.supplierBreakdown.length === 0}
          className="shrink-0 flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-zinc-600" />
          <span>Exportă CSV</span>
        </Button>
      </div>

      {/* Top Spend Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cheltuieli Anuale Rulate"
          value={`${summary.totalAnnualSpendRon.toLocaleString('ro-RO')} lei`}
          subtitle="Run-rate anualizat"
          badgeText="Anual"
          badgeVariant="default"
          icon={DollarSign}
        />
        <StatCard
          title="Rată Lunară Medie"
          value={`${summary.monthlyRunRateRon.toLocaleString('ro-RO')} lei`}
          subtitle="Cheltuială medie / lună"
          badgeText="Lunar"
          badgeVariant="info"
          icon={TrendingUp}
        />
        <StatCard
          title="Cheltuieli Recurente"
          value={`${summary.recurringPercentage}%`}
          subtitle={`${summary.recurringSpendRon.toLocaleString('ro-RO')} lei/an`}
          badgeText="Contracte"
          badgeVariant="success"
          icon={Layers}
        />
        <StatCard
          title="Furnizori Monitorizați"
          value={summary.supplierBreakdown.length}
          subtitle="Pe 6 categorii active"
          badgeText="Parteneri"
          badgeVariant="purple"
          icon={Building2}
        />
      </div>

      {/* Spend Distribution Visuals */}
      <SpendChart summary={summary} />

      {/* Supplier Spend Granular Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle>Top Rulaj pe Furnizori & Pondere în Buget</CardTitle>
            <CardDescription>
              Ordonat după valoarea anualizată a cheltuielilor agregate din facturi.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 bg-white focus:ring-2 focus:ring-zinc-900 cursor-pointer"
            >
              <option value="all">Toate Categoriile</option>
              <option value="Energie">Energie</option>
              <option value="Curierat">Curierat</option>
              <option value="Servicii">Servicii</option>
              <option value="Consumabile">Consumabile</option>
              <option value="Software">Software</option>
              <option value="Telecom">Telecom</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Caută furnizor..."
                value={searchSupplier}
                onChange={(e) => setSearchSupplier(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Furnizor</th>
                  <th className="px-4 py-3">Categorie</th>
                  <th className="px-4 py-3">Rulaj Anualizat</th>
                  <th className="px-4 py-3">Cost Lunar Mediu</th>
                  <th className="px-4 py-3">Pondere din Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredSuppliers.map((sup, idx) => (
                  <tr key={sup.supplierName} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-zinc-900">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-400 font-bold">{idx + 1}.</span>
                        <span>{sup.supplierName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="default" size="sm">{sup.category}</Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-900">
                      {sup.annualSpend.toLocaleString('ro-RO')} lei
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-600">
                      {Math.round(sup.annualSpend / 12).toLocaleString('ro-RO')} lei/lună
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${sup.percentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-zinc-700 font-semibold">{sup.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
