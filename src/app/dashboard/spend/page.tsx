'use client';

import React, { useState } from 'react';
import { useSave } from '@/lib/context';
import { calculateSpendSummary } from '@/lib/analytics/spend-calculator';
import { SpendChart } from '@/components/dashboard/spend-chart';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Building2, Layers, Search, Download, PieChart, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpendCategory } from '@/lib/types';
import { ProcurementRequestModal } from '@/components/opportunities/procurement-request-modal';
import Link from 'next/link';

export default function SpendPage() {
  const { spendRecords, suppliers, currentOrg } = useSave();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchSupplier, setSearchSupplier] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<SpendCategory>('Telecom');
  const [modalSupplier, setModalSupplier] = useState('');
  const [modalSpend, setModalSpend] = useState(0);

  const summary = calculateSpendSummary(spendRecords);

  const filteredSuppliers = summary.supplierBreakdown.filter((sup) => {
    const matchesCat = selectedCategory === 'all' || sup.category === selectedCategory;
    const matchesSearch = sup.supplierName.toLowerCase().includes(searchSupplier.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const exportCsv = () => {
    const headers = ['Furnizor', 'CUI', 'Categorie', 'Rulaj Anual (RON)', 'Pondere in Total (%)'];
    const rows = summary.supplierBreakdown.map((s) => {
      const matchSup = suppliers.find((sup) => sup.name.toLowerCase() === s.supplierName.toLowerCase());
      return [
        `"${s.supplierName.replace(/"/g, '""')}"`,
        `"${matchSup?.cui || ''}"`,
        `"${s.category}"`,
        s.annualSpend.toFixed(2),
        s.percentage.toFixed(1),
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SAVE_Spend_Report_${currentOrg?.name?.replace(/\s+/g, '_') || 'Companie'}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenModal = (category: SpendCategory, name: string, spend: number) => {
    setModalCategory(category);
    setModalSupplier(name);
    setModalSpend(spend);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Analiză a Cheltuielilor Operaționale (Spend Intelligence)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitorizare a cheltuielilor agregate pe furnizori reali, categorii și ponderi bugetare.
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Cheltuieli Anuale Rulate"
          value={`${summary.totalAnnualSpendRon.toLocaleString('ro-RO')} lei`}
          subtitle="Run-rate anualizat din facturi"
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
          subtitle="Corelați după CUI unic"
          badgeText="Parteneri"
          badgeVariant="purple"
          icon={Building2}
        />
      </div>

      {spendRecords.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500 mx-auto">
            <PieChart className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-zinc-900">Nu există încă cheltuieli analizate</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Încarcă facturile din SPV ANAF sau documente PDF/XML pentru a genera automat distribuția bugetară pe categorii și furnizori.
            </p>
          </div>
          <Link href="/settings/company">
            <Button size="md" variant="emerald" className="gap-2 font-bold shadow-md shadow-emerald-500/20">
              <Upload className="w-4 h-4" />
              <span>Importă facturi din SPV</span>
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Spend Distribution Visuals */}
          <SpendChart spendRecords={spendRecords} />

          {/* Supplier Spend Granular Table */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
              <div>
                <CardTitle>Top Rulaj pe Furnizori & Pondere în Buget</CardTitle>
                <CardDescription>
                  Calculat din facturile reale importate în SAVE, corelate după CUI.
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
                      <th className="px-4 py-3">CUI</th>
                      <th className="px-4 py-3">Categorie</th>
                      <th className="px-4 py-3">Rulaj Anualizat</th>
                      <th className="px-4 py-3">Cost Lunar Mediu</th>
                      <th className="px-4 py-3">Pondere</th>
                      <th className="px-4 py-3 text-right">Acțiune</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                          Niciun furnizor găsit conform filtrelor aplicate.
                        </td>
                      </tr>
                    ) : (
                      filteredSuppliers.map((sup, idx) => {
                        const match = suppliers.find((s) => s.name.toLowerCase() === sup.supplierName.toLowerCase());
                        return (
                          <tr key={sup.supplierName} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-zinc-900">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-zinc-400 font-bold">{idx + 1}.</span>
                                <span>{sup.supplierName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">
                              {match?.cui || '—'}
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
                                <div className="w-20 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-1.5 rounded-full"
                                    style={{ width: `${sup.percentage}%` }}
                                  />
                                </div>
                                <span className="font-mono text-xs text-zinc-700 font-semibold">{sup.percentage}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <Button
                                variant="emerald"
                                size="sm"
                                onClick={() => handleOpenModal(sup.category, sup.supplierName, sup.annualSpend)}
                                className="font-bold text-[11px] gap-1 shadow-xs"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Cere oferte</span>
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Procurement Modal */}
      <ProcurementRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialCategory={modalCategory}
        initialSupplierName={modalSupplier}
        initialAnnualSpend={modalSpend}
      />
    </div>
  );
}
