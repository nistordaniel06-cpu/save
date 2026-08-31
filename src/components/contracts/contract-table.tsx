'use client';

import React, { useState } from 'react';
import { ContractItem, ContractStatus } from '@/lib/types';
import { useSave } from '@/lib/context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Plus, 
  ArrowRight, 
  CheckCircle2,
  RefreshCw,
  Search
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { clsx } from 'clsx';

export function ContractTable() {
  const { contracts, addContract, createOptimizationRequest } = useSave();
  const [filterPeriod, setFilterPeriod] = useState<'all' | '30' | '60' | '90'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Contract Form state
  const [newTitle, setNewTitle] = useState('');
  const [newSupplier, setNewSupplier] = useState('');
  const [newCategory, setNewCategory] = useState<any>('Telecom');
  const [newAnnualValue, setNewAnnualValue] = useState(12000);
  const [newStartDate, setNewStartDate] = useState('2025-01-01');
  const [newExpiryDate, setNewExpiryDate] = useState('2026-11-30');
  const [newNoticeDays, setNewNoticeDays] = useState(30);
  const [newAutoRenewal, setNewAutoRenewal] = useState(true);

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterPeriod === '30') return (c.daysUntilExpiry ?? 999) <= 30;
    if (filterPeriod === '60') return (c.daysUntilExpiry ?? 999) <= 60;
    if (filterPeriod === '90') return (c.daysUntilExpiry ?? 999) <= 90;

    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContract({
      supplierId: `sup_${Date.now()}`,
      supplierName: newSupplier,
      title: newTitle,
      category: newCategory,
      annualValue: Number(newAnnualValue),
      currency: 'RON',
      startDate: newStartDate,
      expiryDate: newExpiryDate,
      noticePeriodDays: Number(newNoticeDays),
      automaticRenewal: newAutoRenewal,
      status: 'active',
      paymentTerms: '30 zile net',
      noticeDeadline: newExpiryDate,
    });
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Caută contracte, furnizori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Expiration Radar Filter */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs">
            <button
              onClick={() => setFilterPeriod('all')}
              className={clsx(
                'px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer',
                filterPeriod === 'all' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-600'
              )}
            >
              Toate ({contracts.length})
            </button>
            <button
              onClick={() => setFilterPeriod('30')}
              className={clsx(
                'px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1',
                filterPeriod === '30' ? 'bg-rose-50 text-rose-800 shadow-xs font-semibold' : 'text-zinc-600'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>≤ 30 zile</span>
            </button>
            <button
              onClick={() => setFilterPeriod('60')}
              className={clsx(
                'px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1',
                filterPeriod === '60' ? 'bg-amber-50 text-amber-800 shadow-xs font-semibold' : 'text-zinc-600'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>≤ 60 zile</span>
            </button>
            <button
              onClick={() => setFilterPeriod('90')}
              className={clsx(
                'px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1',
                filterPeriod === '90' ? 'bg-blue-50 text-blue-800 shadow-xs font-semibold' : 'text-zinc-600'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>≤ 90 zile</span>
            </button>
          </div>

          <Button size="sm" variant="primary" onClick={() => setIsAddOpen(true)} className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Adaugă Contract</span>
          </Button>
        </div>
      </div>

      {/* Contract Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Titlu Contract & Furnizor</th>
                <th className="px-4 py-3">Valoare Anuală</th>
                <th className="px-4 py-3">Termen Expirare</th>
                <th className="px-4 py-3">Termen Notificare Preaviz</th>
                <th className="px-4 py-3">Prelungire Tacită</th>
                <th className="px-4 py-3 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                    Nu există contracte care să corespundă filtrului.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((ctr) => {
                  const isExpiringSoon = (ctr.daysUntilExpiry ?? 999) <= 60;
                  const isNoticeUrgent = (ctr.daysUntilNotice ?? 999) <= 15;

                  return (
                    <tr
                      key={ctr.id}
                      className={clsx(
                        'hover:bg-zinc-50/80 transition-colors',
                        isExpiringSoon && 'bg-rose-50/20'
                      )}
                    >
                      {/* Contract Title & Supplier */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 truncate max-w-xs">{ctr.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-zinc-500 font-mono">{ctr.supplierName}</span>
                              <Badge variant="default" size="sm">{ctr.category}</Badge>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Annual Value */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-mono font-bold text-zinc-900">
                            {ctr.annualValue.toLocaleString('ro-RO')} {ctr.currency}
                          </p>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {(ctr.annualValue / 12).toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei/lună
                          </span>
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="px-4 py-3.5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="font-mono font-medium text-zinc-900">{ctr.expiryDate}</span>
                          </div>
                          <div className="mt-1">
                            {(ctr.daysUntilExpiry ?? 999) <= 30 ? (
                              <Badge variant="danger" size="sm">
                                Expiră în {ctr.daysUntilExpiry} zile!
                              </Badge>
                            ) : (ctr.daysUntilExpiry ?? 999) <= 60 ? (
                              <Badge variant="warning" size="sm">
                                Expiră în {ctr.daysUntilExpiry} zile
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                În {ctr.daysUntilExpiry} zile
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Notice Deadline */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-mono text-zinc-800 font-medium">{ctr.noticeDeadline}</p>
                          <div className="mt-1">
                            {isNoticeUrgent ? (
                              <Badge variant="danger" size="sm">
                                {ctr.daysUntilNotice && ctr.daysUntilNotice <= 0
                                  ? 'Preaviz Depășit!'
                                  : `Preaviz în ${ctr.daysUntilNotice} zile`}
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {ctr.noticePeriodDays} zile preaviz
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Auto-Renewal */}
                      <td className="px-4 py-3.5">
                        {ctr.automaticRenewal ? (
                          <Badge variant="warning" size="sm" className="gap-1">
                            <RefreshCw className="w-3 h-3" />
                            <span>Tacită Prelungire</span>
                          </Badge>
                        ) : (
                          <Badge variant="subtle" size="sm">
                            Fără reînnoire
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="emerald"
                          onClick={() => {
                            createOptimizationRequest({
                              supplierId: ctr.supplierId,
                              supplierName: ctr.supplierName,
                              initialAnnualCost: ctr.annualValue,
                              clientNotes: `Cerere de renegociere contract ${ctr.title} înainte de expirare.`,
                            });
                          }}
                          className="h-7 text-xs px-2.5 gap-1"
                        >
                          <span>Renegociază</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contract Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Adaugă Contract Furnizor Nou"
        description="Monitorizează termenele de reînnoire, preavizul și clauzele de indexare."
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">Titlu Contract</label>
            <input
              type="text"
              required
              placeholder="ex: Abonament Flotă Voce & Date Mobile"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Furnizor</label>
              <input
                type="text"
                required
                placeholder="ex: Orange România SA"
                value={newSupplier}
                onChange={(e) => setNewSupplier(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Categorie</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
              >
                <option value="Telecom">Telecom</option>
                <option value="Software">Software</option>
                <option value="Curierat">Curierat</option>
                <option value="Consumabile">Consumabile</option>
                <option value="Energie">Energie</option>
                <option value="Servicii">Servicii</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Valoare Anuală (RON)</label>
              <input
                type="number"
                required
                value={newAnnualValue}
                onChange={(e) => setNewAnnualValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Zile Notificare Preaviz</label>
              <input
                type="number"
                required
                value={newNoticeDays}
                onChange={(e) => setNewNoticeDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Data Început</label>
              <input
                type="date"
                required
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Data Expirare</label>
              <input
                type="date"
                required
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              id="newAutoRenew"
              type="checkbox"
              checked={newAutoRenewal}
              onChange={(e) => setNewAutoRenewal(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-zinc-300"
            />
            <label htmlFor="newAutoRenew" className="text-xs font-medium text-zinc-800">
              Contractul are clauză de tacită prelungire automată
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Anulează
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Salvează Contractul
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
