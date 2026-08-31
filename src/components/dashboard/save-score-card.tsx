'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SaveScoreBreakdown } from '@/lib/types';
import { Zap, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SaveScoreCardProps {
  scoreData: SaveScoreBreakdown;
}

export function SaveScoreCard({ scoreData }: SaveScoreCardProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'B':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'D':
      case 'F':
      default:
        return 'text-rose-600 bg-rose-50 border-rose-200';
    }
  };

  return (
    <Card className="hover:border-zinc-300 transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>SAVE Score — Indice Sănătate Achiziții</CardTitle>
            <Badge variant="purple" size="sm">Audit Inteligent</Badge>
          </div>
          <CardDescription>
            Evaluare automată a competitivității tarifelor, acoperirii contractuale și riscului de prelungire tacită.
          </CardDescription>
        </div>

        <Link
          href="/dashboard/opportunities"
          className="text-xs font-semibold text-zinc-900 hover:text-emerald-600 flex items-center gap-1 shrink-0"
        >
          <span>Vezi recomandări</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Score Gauge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-center">
            <div className="relative flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-8 border-zinc-200 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-black font-mono text-zinc-900 leading-none">
                    {scoreData.totalScore}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono block mt-0.5">/ 100</span>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getGradeColor(scoreData.grade)}`}>
                Rating: Grad {scoreData.grade}
              </span>
              <p className="text-xs text-zinc-600 mt-2 font-medium leading-tight">
                {scoreData.headline}
              </p>
            </div>
          </div>

          {/* 4 Factor Pillars */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Factor 1: Contract Coverage */}
            <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900">{scoreData.factors.contractCoverage.label}</span>
                <span className="font-mono font-bold text-zinc-700">
                  {scoreData.factors.contractCoverage.score} / {scoreData.factors.contractCoverage.max}
                </span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${(scoreData.factors.contractCoverage.score / scoreData.factors.contractCoverage.max) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight">
                {scoreData.factors.contractCoverage.details}
              </p>
            </div>

            {/* Factor 2: Benchmark Competitiveness */}
            <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900">{scoreData.factors.benchmarkCompetitiveness.label}</span>
                <span className="font-mono font-bold text-amber-600">
                  {scoreData.factors.benchmarkCompetitiveness.score} / {scoreData.factors.benchmarkCompetitiveness.max}
                </span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${(scoreData.factors.benchmarkCompetitiveness.score / scoreData.factors.benchmarkCompetitiveness.max) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight">
                {scoreData.factors.benchmarkCompetitiveness.details}
              </p>
            </div>

            {/* Factor 3: Renewal Notice Readiness */}
            <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900">{scoreData.factors.renewalNoticeReadiness.label}</span>
                <span className="font-mono font-bold text-rose-600">
                  {scoreData.factors.renewalNoticeReadiness.score} / {scoreData.factors.renewalNoticeReadiness.max}
                </span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-1.5 rounded-full"
                  style={{ width: `${(scoreData.factors.renewalNoticeReadiness.score / scoreData.factors.renewalNoticeReadiness.max) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight">
                {scoreData.factors.renewalNoticeReadiness.details}
              </p>
            </div>

            {/* Factor 4: Supplier Consolidation */}
            <div className="p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900">{scoreData.factors.supplierConsolidation.label}</span>
                <span className="font-mono font-bold text-zinc-700">
                  {scoreData.factors.supplierConsolidation.score} / {scoreData.factors.supplierConsolidation.max}
                </span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${(scoreData.factors.supplierConsolidation.score / scoreData.factors.supplierConsolidation.max) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight">
                {scoreData.factors.supplierConsolidation.details}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
