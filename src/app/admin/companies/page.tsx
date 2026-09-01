'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSave } from '@/lib/context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { 
  Building2, 
  ShieldCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  PieChart, 
  Sparkles, 
  ChevronRight, 
  Edit, 
  Eye, 
  Ban, 
  X,
  Users,
  Check
} from 'lucide-react';
import { Organization, VerificationStatus, SpendCategory } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';

export default function AdminCompaniesPage() {
  const { 
    organizations, 
    documents, 
    spendRecords, 
    contracts, 
    opportunities, 
    poolInterests, 
    updateOrganization,
    currentUser
  } = useSave();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRefreshingAnaf, setIsRefreshingAnaf] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCui, setEditCui] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editEmployeeRange, setEditEmployeeRange] = useState('');
  const [editMonthlyOpex, setEditMonthlyOpex] = useState<number>(0);

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const recordAuditEvent = async (action: string, orgId: string, metadata: any) => {
    try {
      await supabase.from('audit_events').insert({
        organization_id: orgId,
        actor_id: currentUser.id || null,
        action,
        entity_type: 'organization',
        entity_id: orgId,
        metadata: {
          ...metadata,
          actor_email: currentUser.email || 'admin@save.ro',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.warn('Could not write admin audit event:', e);
    }
  };

  // Filter organizations
  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch = 
      (org.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.cui || '').toLowerCase().includes(searchTerm.toLowerCase());

    const currentStatus: VerificationStatus = org.verificationStatus || 'unverified';
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenDetail = (org: Organization) => {
    setSelectedOrg(org);
  };

  const handleOpenEdit = (org: Organization) => {
    setSelectedOrg(org);
    setEditName(org.name);
    setEditCui(org.cui || '');
    setEditIndustry(org.industry);
    setEditEmployeeRange(org.employeeRange);
    setEditMonthlyOpex(org.monthlyOpexRon || 0);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    try {
      await updateOrganization(selectedOrg.id, {
        name: editName.trim(),
        cui: editCui.trim() || undefined,
        industry: editIndustry,
        employeeRange: editEmployeeRange,
        monthlyOpexRon: Number(editMonthlyOpex),
      });

      await recordAuditEvent('admin_edit_organization', selectedOrg.id, {
        previous: { name: selectedOrg.name, cui: selectedOrg.cui },
        updated: { name: editName.trim(), cui: editCui.trim() },
      });

      // Update local selectedOrg view
      setSelectedOrg((prev) => prev ? {
        ...prev,
        name: editName.trim(),
        cui: editCui.trim() || undefined,
        industry: editIndustry,
        employeeRange: editEmployeeRange,
        monthlyOpexRon: Number(editMonthlyOpex),
      } : null);

      setIsEditModalOpen(false);
      notify(`Datele companiei ${editName} au fost actualizate.`);
    } catch (err: any) {
      notify('Eroare la salvarea modificărilor.', 'error');
    }
  };

  const handleVerifyOrg = async (org: Organization, newStatus: VerificationStatus) => {
    try {
      const now = new Date().toISOString();
      await updateOrganization(org.id, {
        verificationStatus: newStatus,
        verifiedAt: newStatus === 'verified' ? now : undefined,
        verifiedBy: currentUser.fullName || currentUser.email || 'Admin',
      });

      await recordAuditEvent(`admin_${newStatus}_organization`, org.id, {
        newStatus,
        verifiedBy: currentUser.email,
      });

      setSelectedOrg((prev) => prev?.id === org.id ? {
        ...prev,
        verificationStatus: newStatus,
        verifiedAt: newStatus === 'verified' ? now : undefined,
      } : prev);

      notify(`Statusul companiei ${org.name} a fost modificat în: ${newStatus.toUpperCase()}`);
    } catch (err) {
      notify('Eroare la actualizarea statusului de verificare.', 'error');
    }
  };

  const handleRefreshAnaf = async (org: Organization) => {
    if (!org.cui) {
      notify('Compania nu are un CUI salvat pentru verificare.', 'error');
      return;
    }

    setIsRefreshingAnaf(true);
    try {
      const res = await fetch('/api/company-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cui: org.cui }),
      });

      const data = await res.json();
      if (data.success && data.company) {
        const c = data.company;
        const now = new Date().toISOString();
        await updateOrganization(org.id, {
          companyLookupSource: c.source,
          companyLookupCheckedAt: now,
          companyLookupStatus: c.status,
          address: c.address,
          vatRegistered: c.vatRegistered,
          roEfacturaStatus: c.roEfacturaRegistered ? 'inregistrat' : undefined,
          registrationNumber: c.registrationNumber || org.registrationNumber,
        });

        await recordAuditEvent('admin_refresh_anaf_lookup', org.id, {
          cui: org.cui,
          anafStatus: c.status,
          vatRegistered: c.vatRegistered,
        });

        setSelectedOrg((prev) => prev?.id === org.id ? {
          ...prev,
          companyLookupSource: c.source,
          companyLookupCheckedAt: now,
          companyLookupStatus: c.status,
          address: c.address,
          vatRegistered: c.vatRegistered,
          roEfacturaStatus: c.roEfacturaRegistered ? 'inregistrat' : undefined,
          registrationNumber: c.registrationNumber || prev.registrationNumber,
        } : prev);

        notify(`Datele ANAF pentru ${org.name} au fost sincronizate cu succes.`);
      } else {
        notify(data.error?.userMessage || 'Nu s-au putut prelua datele din registrul ANAF.', 'error');
      }
    } catch (err) {
      notify('Serviciul ANAF nu este disponibil momentan.', 'error');
    } finally {
      setIsRefreshingAnaf(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Gestiune Companii & Înrolări (Admin Companies)
            </h1>
            <Badge variant="purple" size="sm">Admin Management</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Validare date fiscale ANAF, audit companii înregistrate, status de verificare și monitorizare documente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            ← Înapoi la Panou General
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium border ${
          actionNotice.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{actionNotice.text}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Companii"
          value={organizations.length}
          subtitle="Înrolate în platformă"
          badgeText="Total"
          badgeVariant="default"
          icon={Building2}
        />
        <StatCard
          title="Verificate Oficial"
          value={organizations.filter(o => o.verificationStatus === 'verified').length}
          subtitle="Date ANAF confirmate"
          badgeText="Verified"
          badgeVariant="success"
          icon={ShieldCheck}
        />
        <StatCard
          title="În Așteptare Audit"
          value={organizations.filter(o => !o.verificationStatus || o.verificationStatus === 'unverified' || o.verificationStatus === 'pending').length}
          subtitle="Necesită verificare CUI"
          badgeText="Pending"
          badgeVariant="warning"
          icon={Clock}
        />
        <StatCard
          title="Suspendate"
          value={organizations.filter(o => o.verificationStatus === 'suspended').length}
          subtitle="Acces restricționat"
          badgeText="Suspended"
          badgeVariant="danger"
          icon={Ban}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Caută după denumire companie, CUI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-zinc-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtru:
          </span>
          {(['all', 'unverified', 'pending', 'verified', 'rejected', 'suspended'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {st === 'all' ? 'Toate' : st === 'unverified' ? 'Neverificat' : st === 'pending' ? 'În Așteptare' : st === 'verified' ? 'Verificat' : st === 'rejected' ? 'Respins' : 'Suspendat'}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Companie</th>
                <th className="py-3.5 px-4">CUI / CIF</th>
                <th className="py-3.5 px-4">Industrie & Dimensiune</th>
                <th className="py-3.5 px-4">Status Verificare</th>
                <th className="py-3.5 px-4">Documente</th>
                <th className="py-3.5 px-4">OPEX Lunar</th>
                <th className="py-3.5 px-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">
                    Nu a fost găsită nicio companie care să corespundă criteriilor de căutare.
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => {
                  const orgDocs = documents.filter((d) => d.organizationId === org.id);
                  const verStatus = org.verificationStatus || 'unverified';

                  return (
                    <tr key={org.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs shrink-0">
                            {org.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block">{org.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              Înrolat: {org.createdAt ? new Date(org.createdAt).toLocaleDateString('ro-RO') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-zinc-800">
                        {org.cui || <span className="text-zinc-400 italic">Lipsă</span>}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600">
                        <div>{org.industry}</div>
                        <span className="text-[10px] text-zinc-400">{org.employeeRange}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge 
                          variant={
                            verStatus === 'verified' ? 'success' : 
                            verStatus === 'suspended' ? 'danger' : 
                            verStatus === 'rejected' ? 'danger' : 
                            verStatus === 'pending' ? 'warning' : 'default'
                          } 
                          size="sm"
                        >
                          {verStatus === 'verified' ? '✓ Verificat' : 
                           verStatus === 'suspended' ? 'Suspendat' : 
                           verStatus === 'rejected' ? 'Respins' : 
                           verStatus === 'pending' ? 'În Așteptare' : 'Neverificat'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold text-zinc-800">{orgDocs.length}</span>
                        <span className="text-[10px] text-zinc-400 block">fișiere</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-800">
                        {org.monthlyOpexRon ? `${org.monthlyOpexRon.toLocaleString('ro-RO')} lei` : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetail(org)}
                            className="h-7 px-2 text-xs text-zinc-700 hover:bg-zinc-100"
                            title="Inspectează detalii"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(org)}
                            className="h-7 px-2 text-xs text-zinc-700 hover:bg-zinc-100"
                            title="Editează companie"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedOrg && !isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-zinc-950 font-black text-base flex items-center justify-center shadow-sm">
                  {selectedOrg.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base flex items-center gap-2">
                    <span>{selectedOrg.name}</span>
                    <Badge variant={selectedOrg.verificationStatus === 'verified' ? 'success' : 'default'} size="sm">
                      {selectedOrg.verificationStatus || 'unverified'}
                    </Badge>
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    ID: {selectedOrg.id} • CUI: {selectedOrg.cui || 'N/A'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrg(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verification & Public ANAF Info */}
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Date Verificare Publică (ANAF)
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isRefreshingAnaf || !selectedOrg.cui}
                  onClick={() => handleRefreshAnaf(selectedOrg)}
                  className="h-7 text-xs gap-1.5 border-zinc-300"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingAnaf ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingAnaf ? 'Se interoghează...' : 'Actualizează din ANAF'}</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Sursă verificare:</span>
                  <span className="font-medium text-zinc-800">{selectedOrg.companyLookupSource || 'Neefectuat'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Ultima verificare:</span>
                  <span className="font-mono text-zinc-800">
                    {selectedOrg.companyLookupCheckedAt ? new Date(selectedOrg.companyLookupCheckedAt).toLocaleString('ro-RO') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Regim TVA:</span>
                  <span className="font-medium text-zinc-800">
                    {selectedOrg.vatRegistered ? 'Plătitor TVA' : 'Neplătitor TVA'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">RO e-Factura:</span>
                  <span className="font-medium text-emerald-700">
                    {selectedOrg.roEfacturaStatus ? 'Înregistrat' : 'Nesincronizat'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Nr. Reg. Com.:</span>
                  <span className="font-mono text-zinc-800">{selectedOrg.registrationNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Status ANAF:</span>
                  <span className="font-medium text-zinc-800">{selectedOrg.companyLookupStatus || 'N/A'}</span>
                </div>
              </div>

              {selectedOrg.address && (
                <div className="pt-2 border-t border-zinc-200 text-xs">
                  <span className="text-[10px] text-zinc-400 block">Adresă Fiscală:</span>
                  <span className="text-zinc-800">{selectedOrg.address}</span>
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Documente</span>
                <p className="text-lg font-bold text-zinc-900 font-mono mt-0.5">
                  {documents.filter(d => d.organizationId === selectedOrg.id).length}
                </p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Contracte</span>
                <p className="text-lg font-bold text-zinc-900 font-mono mt-0.5">
                  {contracts.filter(c => c.organizationId === selectedOrg.id).length}
                </p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Economii</span>
                <p className="text-lg font-bold text-emerald-600 font-mono mt-0.5">
                  {opportunities.filter(o => o.organizationId === selectedOrg.id).length}
                </p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Pool Interests</span>
                <p className="text-lg font-bold text-purple-600 font-mono mt-0.5">
                  {poolInterests.filter(p => p.organizationId === selectedOrg.id).length}
                </p>
              </div>
            </div>

            {/* Admin Actions Bar */}
            <div className="p-4 bg-zinc-900 text-white rounded-xl space-y-2">
              <span className="text-xs font-semibold text-zinc-300 block">Acțiuni Administrator:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="emerald"
                  onClick={() => handleVerifyOrg(selectedOrg, 'verified')}
                  className="text-xs h-8 gap-1 font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprobă & Verifică</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVerifyOrg(selectedOrg, 'rejected')}
                  className="text-xs h-8 gap-1 text-rose-300 border-zinc-700 hover:bg-zinc-800"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Respinge</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVerifyOrg(selectedOrg, selectedOrg.verificationStatus === 'suspended' ? 'verified' : 'suspended')}
                  className="text-xs h-8 gap-1 text-amber-300 border-zinc-700 hover:bg-zinc-800"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{selectedOrg.verificationStatus === 'suspended' ? 'Reactivează Companie' : 'Suspendă Companie'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(selectedOrg)}
                  className="text-xs h-8 gap-1 text-zinc-300 border-zinc-700 hover:bg-zinc-800"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editează Date</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedOrg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-zinc-900 text-base">Editează Companie (Admin)</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Denumire Companie *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">CUI / CIF</label>
                <input
                  type="text"
                  value={editCui}
                  onChange={(e) => setEditCui(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-mono text-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Industrie</label>
                <input
                  type="text"
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">Nr. Angajați</label>
                  <input
                    type="text"
                    value={editEmployeeRange}
                    onChange={(e) => setEditEmployeeRange(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700">OPEX Lunar (RON)</label>
                  <input
                    type="number"
                    value={editMonthlyOpex}
                    onChange={(e) => setEditMonthlyOpex(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-mono text-zinc-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  variant="emerald"
                  size="sm"
                  className="font-bold"
                >
                  Salvează Modificările
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
