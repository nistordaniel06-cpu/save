'use client';

import React from 'react';
import { SpendSummary, calculateSpendSummary } from '@/lib/analytics/spend-calculator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SpendCategory, SpendRecord } from '@/lib/types';
import { clsx } from 'clsx';

interface SpendChartProps {
  summary?: SpendSummary;
  spendRecords?: SpendRecord[];
}

const CATEGORY_COLORS: Record<SpendCategory, { bg: string; text: string; bar: string }> = {
  Energie: { bg: 'bg-amber-100', text: 'text-amber-800', bar: 'bg-amber-500' },
  Utilități: { bg: 'bg-amber-100', text: 'text-amber-800', bar: 'bg-amber-500' },
  Curierat: { bg: 'bg-blue-100', text: 'text-blue-800', bar: 'bg-blue-600' },
  Servicii: { bg: 'bg-violet-100', text: 'text-violet-800', bar: 'bg-violet-600' },
  'Servicii profesionale': { bg: 'bg-indigo-100', text: 'text-indigo-800', bar: 'bg-indigo-600' },
  Consumabile: { bg: 'bg-emerald-100', text: 'text-emerald-800', bar: 'bg-emerald-600' },
  Software: { bg: 'bg-cyan-100', text: 'text-cyan-800', bar: 'bg-cyan-600' },
  Telecom: { bg: 'bg-rose-100', text: 'text-rose-800', bar: 'bg-rose-500' },
  Marketing: { bg: 'bg-pink-100', text: 'text-pink-800', bar: 'bg-pink-500' },
  Chirie: { bg: 'bg-teal-100', text: 'text-teal-800', bar: 'bg-teal-600' },
  Transport: { bg: 'bg-orange-100', text: 'text-orange-800', bar: 'bg-orange-500' },
  Mentenanță: { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-600' },
  Echipamente: { bg: 'bg-slate-100', text: 'text-slate-800', bar: 'bg-slate-600' },
  Altele: { bg: 'bg-zinc-100', text: 'text-zinc-800', bar: 'bg-zinc-500' },
};

export function SpendChart({ summary: initialSummary, spendRecords }: SpendChartProps) {
  const summary = initialSummary || calculateSpendSummary(spendRecords || []);
  const categoryEntries = Object.entries(summary.categoryBreakdown)
    .filter(([_, data]) => data.amount > 0)
    .sort((a, b) => b[1].amount - a[1].amount) as [SpendCategory, { amount: number; percentage: number; count: number }][];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Category Spend Distribution */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Distribuție Cheltuieli pe Categorii</CardTitle>
            <CardDescription>
              Cheltuieli anuale analizate: <strong className="text-zinc-900 font-mono">{summary.totalAnnualSpendRon.toLocaleString('ro-RO')} lei/an</strong>
            </CardDescription>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {summary.monthlyRunRateRon.toLocaleString('ro-RO')} lei/lună
          </span>
        </CardHeader>

        <CardContent className="space-y-4">
          {categoryEntries.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
              Nu există încă cheltuieli înregistrate. Încarcă prima factură pentru a vizualiza distribuția pe categorii.
            </div>
          ) : (
            <>
              {/* Stacked Progress Bar */}
              <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden flex gap-0.5">
                {categoryEntries.map(([cat, data]) => (
                  <div
                    key={cat}
                    style={{ width: `${Math.max(2, data.percentage)}%` }}
                    className={clsx('h-full transition-all', CATEGORY_COLORS[cat]?.bar || 'bg-zinc-500')}
                    title={`${cat}: ${data.amount.toLocaleString('ro-RO')} lei (${data.percentage}%)`}
                  />
                ))}
              </div>

              {/* Detailed Category List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {categoryEntries.map(([cat, data]) => {
                  const color = CATEGORY_COLORS[cat] || { bg: 'bg-zinc-100', text: 'text-zinc-800', bar: 'bg-zinc-500' };
                  return (
                    <div
                      key={cat}
                      className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={clsx('w-2.5 h-2.5 rounded-full shrink-0', color.bar)} />
                        <div>
                          <p className="text-xs font-semibold text-zinc-900">{cat}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            {data.count} {data.count === 1 ? 'înregistrare' : 'înregistrări'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <p className="text-xs font-bold text-zinc-900">
                          {data.amount.toLocaleString('ro-RO')} lei
                        </p>
                        <p className="text-[10px] text-zinc-500 font-bold">
                          {data.percentage}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Contracted vs Variable & Top Suppliers */}
      <Card className="flex flex-col justify-between">
        <div>
          <CardHeader>
            <CardTitle>Structură Contractuală</CardTitle>
            <CardDescription>Grad de predictibilitate a cheltuielilor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-zinc-600">Cheltuieli Recurente (Contracte)</span>
                  <span className="font-mono font-bold text-zinc-900">{summary.recurringPercentage}%</span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-2">
                  <div
                    className="bg-zinc-900 h-2 rounded-full"
                    style={{ width: `${summary.recurringPercentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">
                  {summary.recurringSpendRon.toLocaleString('ro-RO')} lei/an sub contracte active
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-200/60">
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-zinc-600">Cheltuieli Variabile / Spot</span>
                  <span className="font-mono font-bold text-zinc-900">{100 - summary.recurringPercentage}%</span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${100 - summary.recurringPercentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">
                  {summary.variableSpendRon.toLocaleString('ro-RO')} lei/an fără angajament fix
                </p>
              </div>
            </div>

            {/* Top 3 Suppliers Preview */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Top Furnizori după Rulaj
              </p>
              {summary.supplierBreakdown.length === 0 ? (
                <p className="text-[11px] text-zinc-400 italic py-2">
                  Niciun furnizor identificat încă.
                </p>
              ) : (
                summary.supplierBreakdown.slice(0, 3).map((sup, idx) => (
                  <div key={sup.supplierName} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-mono text-zinc-400 font-bold">{idx + 1}.</span>
                      <span className="text-zinc-800 truncate max-w-[140px]">{sup.supplierName}</span>
                    </div>
                    <span className="font-mono font-semibold text-zinc-900 shrink-0">
                      {sup.annualSpend.toLocaleString('ro-RO')} lei
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
