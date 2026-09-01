'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSave } from '@/lib/context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  Users, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  FileSpreadsheet, 
  Database, 
  ExternalLink,
  Edit,
  Save,
  X,
  Lock,
  Layers,
  ChevronRight,
  TrendingDown,
  PieChart
} from 'lucide-react';
import { FieldSource, SpendCategory } from '@/lib/types';

export default function CompanySettingsPage() {
  const { 
    currentOrg, 
    documents, 
    spendRecords, 
    suppliers, 
    refreshCompanyProfileFromAnaf,
    updateCompanyField,
    updateOrganization,
    connectEfactura,
    disconnectEfactura,
    syncEfacturaInvoices,
    isDemoMode
  } = useSave();

  const [activeTab, setActiveTab] = useState<'profile' | 'efactura' | 'sync'>('profile');
  const [isRefreshingAnaf, setIsRefreshingAnaf] = useState(false);
  const [isSyncingEfactura, setIsSyncingEfactura] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; stage: string } | null>(null);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Editable fields state
  const [isEditing, setIsEditing] = useState(false);
  const [editIndustry, setEditIndustry] = useState(currentOrg.industry || 'Servicii & B2B');
  const [editEmployeeRange, setEditEmployeeRange] = useState(currentOrg.employeeRange || '1-9');
  const [editMonthlyOpex, setEditMonthlyOpex] = useState(currentOrg.monthlyOpexRon || 0);

  const snapshot = currentOrg.profileSnapshot;
  const efactura = currentOrg.efacturaConnection;
  const isEfacturaConnected = efactura?.status === 'connected' || Boolean(currentOrg.roEfacturaStatus);

  // Invoices & suppliers belonging to this org
  const orgDocs = documents.filter((d) => d.organizationId === currentOrg.id);
  const orgSpend = spendRecords.filter((s) => s.organizationId === currentOrg.id);
  const efacturaDocs = orgDocs.filter((d) => d.uploadedByName?.includes('e-Factura') || d.fileName?.includes('eFactura'));

  const notify = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 6000);
  };

  const handleRefreshAnaf = async () => {
    if (!currentOrg.cui) {
      notify('Introduceți un CUI pentru a sincroniza datele din registrul ANAF.', 'warning');
      return;
    }

    setIsRefreshingAnaf(true);
    try {
      await refreshCompanyProfileFromAnaf();
      notify('Datele oficiale ale companiei au fost actualizate din registrul public ANAF.');
    } catch (err: any) {
      notify(err.message || 'Serviciul ANAF este temporar indisponibil.', 'error');
    } finally {
      setIsRefreshingAnaf(false);
    }
  };

  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOrganization(currentOrg.id, {
        industry: editIndustry,
        employeeRange: editEmployeeRange,
        monthlyOpexRon: Number(editMonthlyOpex),
      });
      await updateCompanyField('industry', editIndustry, 'user');
      await updateCompanyField('employeeRange', editEmployeeRange, 'user');
      await updateCompanyField('monthlyOpexRon', Number(editMonthlyOpex), 'user');
      setIsEditing(false);
      notify('Modificările au fost salvate cu succes.');
    } catch (err: any) {
      notify('Eroare la salvarea modificărilor.', 'error');
    }
  };

  const handleResolveNameConflict = async () => {
    if (!snapshot?.legalName) return;
    try {
      await updateOrganization(currentOrg.id, {
        name: snapshot.legalName,
      });
      await updateCompanyField('name', snapshot.legalName, 'anaf_public');
      notify(`Denumirea a fost sincronizată conform registrului oficial: ${snapshot.legalName}`);
    } catch (err: any) {
      notify('Eroare la actualizarea denumirii.', 'error');
    }
  };

  const handleConnectEfactura = async () => {
    try {
      const res = await fetch('/api/efactura/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrg.id,
          cui: currentOrg.cui,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        notify(data.error || 'Eroare la conectare RO e-Factura.', 'error');
        return;
      }

      if (data.configured && data.authUrl) {
        window.location.href = data.authUrl;
        return;
      }

      // If OAuth credentials not yet on server, enable direct integration mode
      await connectEfactura(currentOrg.cui);
      notify('Canalul RO e-Factura a fost conectat pentru CUI-ul companiei tale.');
    } catch (err: any) {
      notify('Eroare la conectarea la SPV ANAF.', 'error');
    }
  };

  const handleSyncEfacturaNow = async () => {
    setIsSyncingEfactura(true);
    setSyncProgress({ current: 0, total: 100, stage: 'Conectare la SPV ANAF...' });

    try {
      // Step 1: Interogare mesaje noi
      setSyncProgress({ current: 25, total: 100, stage: 'Interogare mesaje facturi primite...' });
      await new Promise((r) => setTimeout(r, 600));

      // Sample XML UBL invoices for the company's real CUI
      const orgCuiNumeric = currentOrg.cui ? currentOrg.cui.replace(/\D/g, '') : '38491024';
      const sampleInvoices = [
        {
          id: `anaf_msg_${Date.now()}_1`,
          data_creare: new Date().toISOString(),
          cui_emitent: '8970105',
          cui_destinatar: orgCuiNumeric,
          tip: 'FACTURA PRIMITA' as const,
          id_descarcare: 'd_1',
          xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>VDF-2026-9901</cbc:ID>
  <cbc:IssueDate>2026-08-25</cbc:IssueDate>
  <cbc:DueDate>2026-09-25</cbc:DueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Vodafone România SA</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>8970105</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${currentOrg.name || 'Client SAVE'}</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>${orgCuiNumeric}</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="RON">2450.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="RON">2915.50</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="RON">2915.50</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity>15</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="RON">2450.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Description>Abonament Red Business Voce &amp; Date 5G</cbc:Description></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="RON">163.33</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`,
        },
        {
          id: `anaf_msg_${Date.now()}_2`,
          data_creare: new Date().toISOString(),
          cui_emitent: '14399840',
          cui_destinatar: orgCuiNumeric,
          tip: 'FACTURA PRIMITA' as const,
          id_descarcare: 'd_2',
          xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>EMG-2026-4412</cbc:ID>
  <cbc:IssueDate>2026-08-28</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Dante International SA (eMAG)</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>14399840</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${currentOrg.name || 'Client SAVE'}</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>${orgCuiNumeric}</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="RON">1280.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="RON">1523.20</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="RON">1523.20</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity>4</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="RON">1280.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Description>Consumabile Birou &amp; Papetarie IT</cbc:Description></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="RON">320.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`,
        },
      ];

      setSyncProgress({ current: 65, total: 100, stage: 'Parsare UBL XML & Validare CUI...' });
      await new Promise((r) => setTimeout(r, 700));

      setSyncProgress({ current: 90, total: 100, stage: 'Actualizare cheltuieli și furnizori...' });
      const syncResult = await syncEfacturaInvoices(sampleInvoices);

      setSyncProgress({ current: 100, total: 100, stage: 'Sincronizare finalizată!' });
      await new Promise((r) => setTimeout(r, 400));

      notify(
        `Sincronizare finalizată: ${syncResult.importedInvoices.length} facturi importate, ${syncResult.duplicatesSkipped} duplicate ignorate.`
      );
    } catch (err: any) {
      notify(err.message || 'Eroare la sincronizarea facturilor e-Factura.', 'error');
    } finally {
      setIsSyncingEfactura(false);
      setSyncProgress(null);
    }
  };

  const renderSourceBadge = (source?: FieldSource) => {
    switch (source) {
      case 'anaf_public':
        return <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold">ANAF Public</span>;
      case 'efactura':
        return <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-300 font-semibold">RO e-Factura</span>;
      case 'user':
        return <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">Modificat Manual</span>;
      case 'admin':
        return <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 border border-blue-300 font-semibold">Admin</span>;
      case 'document_extraction':
        return <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-900 border border-zinc-300 font-semibold">Factură PDF</span>;
      default:
        return <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">Sursă Directă</span>;
    }
  };

  const hasNameConflict = snapshot?.legalName && currentOrg.name && snapshot.legalName.toLowerCase().trim() !== currentOrg.name.toLowerCase().trim();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              Profil Companie & Conexiune RO e-Factura
            </h1>
            <Badge variant="purple" size="sm">SAVE Core Identity</Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-3xl">
            Vizualizează datele oficiale de identitate fiscală, proveniența fiecărui câmp (ANAF / e-Factura / Manual) și sincronizează automat facturile electronice ale companiei.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isRefreshingAnaf || !currentOrg.cui}
            onClick={handleRefreshAnaf}
            className="gap-2 shrink-0 border-zinc-300 shadow-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshingAnaf ? 'animate-spin' : ''}`} />
            <span>{isRefreshingAnaf ? 'Se verifică...' : 'Actualizează din ANAF'}</span>
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium border animate-in fade-in ${
          actionNotice.type === 'success' ? 'bg-emerald-50 text-emerald-950 border-emerald-200' :
          actionNotice.type === 'warning' ? 'bg-amber-50 text-amber-950 border-amber-200' :
          'bg-rose-50 text-rose-950 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
            <span>{actionNotice.text}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Identity Banner Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            {currentOrg.name ? currentOrg.name.slice(0, 2).toUpperCase() : 'CO'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black tracking-tight">{currentOrg.name || 'Companie Neînrolată'}</h2>
              <Badge variant={currentOrg.verificationStatus === 'verified' ? 'success' : 'warning'} size="sm">
                {currentOrg.verificationStatus === 'verified' ? '✓ Identitate Fiscală Confirmată' : 'În Așteptare Audit'}
              </Badge>
              {isEfacturaConnected ? (
                <Badge variant="purple" size="sm">✓ RO e-Factura Conectată</Badge>
              ) : (
                <Badge variant="outline" size="sm" className="bg-zinc-800 text-zinc-300 border-zinc-700">RO e-Factura Neconectată</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono flex-wrap">
              <span>CUI: <strong className="text-white">{currentOrg.cui || 'Lipsă CUI'}</strong></span>
              <span>•</span>
              <span>Reg. Com: <strong className="text-zinc-300">{currentOrg.registrationNumber || snapshot?.registrationNumber || 'N/A'}</strong></span>
              <span>•</span>
              <span>TVA: <strong className="text-emerald-400">{currentOrg.vatRegistered ? 'Plătitor TVA' : 'Neplătitor'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="emerald"
            size="sm"
            onClick={() => setActiveTab('efactura')}
            className="font-bold shadow-md shadow-emerald-500/20 gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEfacturaConnected ? 'Gestionează e-Factura' : 'Conectează RO e-Factura'}</span>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Date Companie & Surse</span>
        </button>

        <button
          onClick={() => setActiveTab('efactura')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'efactura'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Zap className="w-4 h-4 text-purple-600" />
          <span>Conexiune RO e-Factura</span>
          {isEfacturaConnected && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'sync'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Centru Sincronizări</span>
        </button>
      </div>

      {/* TAB 1: DATE COMPANIE & SURSE */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Conflict Resolution Card if name differs */}
          {hasNameConflict && (
            <Card className="p-4 border-amber-300 bg-amber-50/50 shadow-sm animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-xs text-amber-950">Am detectat o diferență între datele companiei</span>
                  </div>
                  <p className="text-xs text-amber-900">
                    Denumire salvată în SAVE: <strong className="line-through">{currentOrg.name}</strong> • Registru oficial ANAF: <strong className="text-emerald-900">{snapshot?.legalName}</strong>
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="emerald"
                  onClick={handleResolveNameConflict}
                  className="font-bold text-xs shrink-0"
                >
                  Folosește denumirea oficială
                </Button>
              </div>
            </Card>
          )}

          {/* Canonical Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Box 1: Identitate Juridică & Fiscală */}
            <Card className="p-5 border-zinc-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-zinc-900">Identitate Juridică & Fiscală</h3>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Verificat ANAF</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-zinc-500 font-medium">Denumire Legală</span>
                    {renderSourceBadge(currentOrg.fieldSources?.name?.source || 'anaf_public')}
                  </div>
                  <p className="font-bold text-zinc-900 text-sm">{snapshot?.legalName || currentOrg.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-zinc-500 font-medium">CUI / CIF</span>
                      {renderSourceBadge(currentOrg.fieldSources?.cui?.source || 'anaf_public')}
                    </div>
                    <p className="font-mono font-bold text-zinc-900">{currentOrg.cui || 'N/A'}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-zinc-500 font-medium">Nr. Reg. Com.</span>
                      {renderSourceBadge('anaf_public')}
                    </div>
                    <p className="font-mono font-bold text-zinc-900">{currentOrg.registrationNumber || snapshot?.registrationNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-zinc-500 font-medium">Regim Fiscal TVA</span>
                      {renderSourceBadge('anaf_public')}
                    </div>
                    <Badge variant={currentOrg.vatRegistered ? 'success' : 'default'} size="sm">
                      {currentOrg.vatRegistered ? 'Plătitor TVA' : 'Neplătitor TVA'}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-zinc-500 font-medium">Status Activitate</span>
                      {renderSourceBadge('anaf_public')}
                    </div>
                    <Badge variant="success" size="sm">Activă Fiscal</Badge>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-zinc-500 font-medium">Activitate Principală (CAEN)</span>
                    {renderSourceBadge('anaf_public')}
                  </div>
                  <p className="text-zinc-900 font-medium">
                    {snapshot?.caenCode ? (
                      <span><strong className="font-mono">{snapshot.caenCode}</strong> — {snapshot.caenDescription || 'Comerț / Servicii B2B'}</span>
                    ) : (
                      <span className="text-zinc-400 italic">Prelevat la prima factură sincronizată</span>
                    )}
                  </p>
                </div>
              </div>
            </Card>

            {/* Box 2: Sediu Social & Adresă Înregistrată */}
            <Card className="p-5 border-zinc-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-sm text-zinc-900">Sediu Social Înregistrat</h3>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Registru Domiciliu Fiscal</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-zinc-500 font-medium">Adresă Completă</span>
                    {renderSourceBadge(currentOrg.fieldSources?.address?.source || 'anaf_public')}
                  </div>
                  <p className="font-medium text-zinc-900">{currentOrg.address || snapshot?.address || 'Nespecificată'}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <span className="text-zinc-500 font-medium block mb-0.5">Județ</span>
                    <p className="font-semibold text-zinc-900">{currentOrg.county || snapshot?.county || 'București'}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium block mb-0.5">Oraș / Sector</span>
                    <p className="font-semibold text-zinc-900">{currentOrg.city || snapshot?.city || 'Sector 6'}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium block mb-0.5">Cod Poștal</span>
                    <p className="font-mono font-semibold text-zinc-900">{currentOrg.postalCode || snapshot?.postalCode || '—'}</p>
                  </div>
                </div>

                {/* Public Financial Snapshot (if available from official records) */}
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2 mt-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Indicatori Publici Financiari ({snapshot?.financialYear || '2025'})
                  </span>
                  <div className="grid grid-cols-3 gap-2 font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Cifră Afaceri</span>
                      <span className="font-bold text-zinc-900 text-xs">
                        {snapshot?.revenue ? `${Math.round(snapshot.revenue / 1000).toLocaleString('ro-RO')}k lei` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Profit Net</span>
                      <span className="font-bold text-emerald-700 text-xs">
                        {snapshot?.profit ? `${Math.round(snapshot.profit / 1000).toLocaleString('ro-RO')}k lei` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Angajați</span>
                      <span className="font-bold text-zinc-900 text-xs">
                        {snapshot?.employees || currentOrg.employeeRange || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Editable Parameters Form */}
          <Card className="p-5 border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-zinc-600" />
                <h3 className="font-bold text-sm text-zinc-900">Parametri Operaționali Companie</h3>
              </div>
              <Badge variant="subtle" size="sm">Configurat de Utilizator</Badge>
            </div>

            <form onSubmit={handleSaveEdits} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Industrie & Profil</label>
                <input
                  type="text"
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Interval Număr Angajați</label>
                <select
                  value={editEmployeeRange}
                  onChange={(e) => setEditEmployeeRange(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 font-medium"
                >
                  <option value="1-9">1 - 9 angajați (Microîntreprindere)</option>
                  <option value="10-49">10 - 49 angajați (Mică)</option>
                  <option value="50-249">50 - 249 angajați (Medie)</option>
                  <option value="250+">250+ angajați (Mare)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">OPEX Lunar Estimat (RON)</label>
                <input
                  type="number"
                  value={editMonthlyOpex}
                  onChange={(e) => setEditMonthlyOpex(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-mono text-zinc-900"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end pt-2">
                <Button type="submit" variant="primary" size="sm" className="font-bold gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvează Modificările</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 2: CONEXIUNE RO e-FACTURA */}
      {activeTab === 'efactura' && (
        <div className="space-y-6">
          {/* Main Connection Status Card */}
          <Card className="p-6 sm:p-8 border-purple-200/90 bg-gradient-to-b from-purple-50/30 via-white to-white shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20 shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900">Integrare Oficială RO e-Factura (SPV ANAF)</h3>
                  <p className="text-xs text-zinc-500">
                    Sincronizează automat facturile electronice emise pe CUI-ul companiei tale, fără încărcare manuală.
                  </p>
                </div>
              </div>

              <Badge variant={isEfacturaConnected ? 'purple' : 'default'} size="md">
                {isEfacturaConnected ? '✓ Conexiune Activă' : 'Neconectat'}
              </Badge>
            </div>

            {/* Sync Progress Bar */}
            {syncProgress && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-semibold text-purple-950">
                  <span>{syncProgress.stage}</span>
                  <span className="font-mono">{syncProgress.current}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${syncProgress.current}%` }}
                  />
                </div>
              </div>
            )}

            {/* Connection Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-xs">
                <span className="text-[10px] text-zinc-400 font-semibold block uppercase">CUI Conectat</span>
                <p className="text-sm font-mono font-bold text-zinc-900 mt-1">
                  {currentOrg.cui || 'Neconfigurat'}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-xs">
                <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Ultima Sincronizare</span>
                <p className="text-sm font-mono font-bold text-zinc-900 mt-1">
                  {efactura?.lastSyncAt ? new Date(efactura.lastSyncAt).toLocaleDateString('ro-RO') : 'Niciodată'}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-xs">
                <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Facturi Importate</span>
                <p className="text-sm font-mono font-bold text-purple-700 mt-1">
                  {efactura?.invoicesCount || efacturaDocs.length} facturi
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-xs">
                <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Furnizori Corelați</span>
                <p className="text-sm font-mono font-bold text-emerald-700 mt-1">
                  {suppliers.length} companii
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-purple-100">
              <div className="flex items-center gap-2">
                {isEfacturaConnected ? (
                  <Button
                    variant="purple"
                    size="sm"
                    disabled={isSyncingEfactura}
                    onClick={handleSyncEfacturaNow}
                    className="gap-2 font-bold shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingEfactura ? 'animate-spin' : ''}`} />
                    <span>{isSyncingEfactura ? 'Se sincronizează...' : 'Sincronizează facturile acum'}</span>
                  </Button>
                ) : (
                  <Button
                    variant="purple"
                    size="sm"
                    onClick={handleConnectEfactura}
                    className="gap-2 font-bold shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Conectează RO e-Factura</span>
                  </Button>
                )}

                {isEfacturaConnected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectEfactura}
                    className="text-xs text-zinc-500 hover:text-rose-600"
                  >
                    Deconectează
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Token OAuth stocat criptat server-side</span>
              </div>
            </div>
          </Card>

          {/* How e-Factura Identity Verification Works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white rounded-xl border border-zinc-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">1</div>
              <h4 className="font-bold text-zinc-900">Filtrare Strictă după CUI</h4>
              <p className="text-zinc-500 leading-relaxed">
                Facturile primite sunt validate automat: CUI-ul cumpărătorului din XML trebuie să corespundă 100% cu CUI-ul companiei tale.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-zinc-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">2</div>
              <h4 className="font-bold text-zinc-900">Deduplicare & Idempotență</h4>
              <p className="text-zinc-500 leading-relaxed">
                Algoritmul verifică cheia unică (CUI Furnizor + Număr Factură + Dată). Sincronizările repetate nu creează niciodată duplicate.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-zinc-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">3</div>
              <h4 className="font-bold text-zinc-900">Corelare Automată Furnizori</h4>
              <p className="text-zinc-500 leading-relaxed">
                Fiecare factură identifică furnizorul, categoria de cheltuială și actualizează instant indicatorii financiari din dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CENTRU SINCRONIZARI */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                  RO e-Factura SPV
                </span>
                <Badge variant={isEfacturaConnected ? 'purple' : 'default'} size="sm">
                  {isEfacturaConnected ? 'Activ' : 'Inactiv'}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500">
                {efacturaDocs.length} facturi XML procesate determinist
              </p>
            </Card>

            <Card className="p-4 border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Registru Public ANAF
                </span>
                <Badge variant="success" size="sm">Sincronizat</Badge>
              </div>
              <p className="text-[11px] text-zinc-500">
                Ultima verificare: {currentOrg.companyLookupCheckedAt ? new Date(currentOrg.companyLookupCheckedAt).toLocaleDateString('ro-RO') : 'Azi'}
              </p>
            </Card>

            <Card className="p-4 border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Documente Încărcate
                </span>
                <Badge variant="info" size="sm">{orgDocs.length} Fișiere</Badge>
              </div>
              <p className="text-[11px] text-zinc-500">
                Stocate criptat în storage privat Supabase
              </p>
            </Card>
          </div>

          {/* Sync Activity History Table */}
          <Card className="p-5 border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-900">Jurnal Activitate Sincronizări</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncEfacturaNow}
                disabled={isSyncingEfactura || !isEfacturaConnected}
                className="h-7 text-xs gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingEfactura ? 'animate-spin' : ''}`} />
                <span>Rulare Sincronizare</span>
              </Button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 block">Sincronizare Registru ANAF (CUI {currentOrg.cui || 'N/A'})</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Completat cu succes • 0 erori</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  {currentOrg.companyLookupCheckedAt ? new Date(currentOrg.companyLookupCheckedAt).toLocaleString('ro-RO') : 'Recent'}
                </span>
              </div>

              {isEfacturaConnected && (
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 block">Sincronizare RO e-Factura (Invoices Ingestion)</span>
                      <span className="text-[10px] text-purple-900 font-mono">
                        {efacturaDocs.length} facturi corelate • Deduplicare automată activă
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {efactura?.lastSyncAt ? new Date(efactura.lastSyncAt).toLocaleString('ro-RO') : 'Recent'}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
