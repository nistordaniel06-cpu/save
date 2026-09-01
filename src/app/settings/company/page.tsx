'use client';

import React, { useState, useRef } from 'react';
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
  PieChart,
  Upload,
  FolderArchive,
  Info,
  Check
} from 'lucide-react';
import { FieldSource, SpendCategory } from '@/lib/types';
import { SpvBulkImportResult } from '@/lib/efactura/spv-bulk-importer';

export default function CompanySettingsPage() {
  const { 
    currentOrg, 
    documents, 
    spendRecords, 
    suppliers, 
    importBatches,
    refreshCompanyProfileFromAnaf,
    updateCompanyField,
    updateOrganization,
    connectEfactura,
    disconnectEfactura,
    importSpvInvoices,
    currentUser,
    isDemoMode
  } = useSave();

  const [activeTab, setActiveTab] = useState<'profile' | 'efactura' | 'history'>('efactura');
  const [isRefreshingAnaf, setIsRefreshingAnaf] = useState(false);
  const [isImportingSpv, setIsImportingSpv] = useState(false);
  const [spvProgress, setSpvProgress] = useState<{ current: number; total: number; stage: string } | null>(null);
  const [lastImportResult, setLastImportResult] = useState<SpvBulkImportResult | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Edit State for Operational Parameters
  const [editIndustry, setEditIndustry] = useState(currentOrg.industry || 'Servicii & B2B');
  const [editEmployeeRange, setEditEmployeeRange] = useState(currentOrg.employeeRange || '10-49');
  const [editMonthlyOpex, setEditMonthlyOpex] = useState(currentOrg.monthlyOpexRon || 0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const snapshot = currentOrg.profileSnapshot;
  const efactura = currentOrg.efacturaConnection;
  const isEfacturaConnected = efactura?.status === 'connected' || Boolean(currentOrg.roEfacturaStatus);
  const orgDocs = documents.filter((d) => d.organizationId === currentOrg.id);
  const efacturaDocs = orgDocs.filter((d) => d.uploadedByName?.includes('e-Factura') || d.uploadedByName?.includes('SPV') || d.extraction?.confidence === 100);

  const notify = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setActionNotice({ type, text });
    setTimeout(() => setActionNotice(null), 6000);
  };

  const handleRefreshAnaf = async () => {
    if (!currentOrg.cui) {
      notify('Configurează un CUI valid pentru a interoga registrul ANAF.', 'warning');
      return;
    }
    setIsRefreshingAnaf(true);
    try {
      await refreshCompanyProfileFromAnaf(currentOrg.id);
      notify('Datele oficiale ale companiei au fost actualizate cu succes din registrul public ANAF.');
    } catch (err: any) {
      notify(err.message || 'Eroare la actualizarea datelor din ANAF.', 'error');
    } finally {
      setIsRefreshingAnaf(false);
    }
  };

  const handleSaveOperational = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOrganization(currentOrg.id, {
        industry: editIndustry,
        employeeRange: editEmployeeRange,
        monthlyOpexRon: Number(editMonthlyOpex),
      });
      notify('Parametrii operaționali au fost salvați.');
    } catch (err: any) {
      notify('Eroare la salvarea parametrilor.', 'error');
    }
  };

  const handleUseOfficialName = async () => {
    if (!snapshot?.legalName) return;
    try {
      await updateCompanyField('name', snapshot.legalName, 'anaf_public');
      notify(`Denumirea a fost actualizată la cea oficială: ${snapshot.legalName}`);
    } catch (err) {
      notify('Eroare la sincronizarea denumirii.', 'error');
    }
  };

  // SPV Bulk Upload Handler
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsImportingSpv(true);
    setSpvProgress({ current: 0, total: files.length, stage: 'Se citesc fișierele și arhivele ZIP...' });

    try {
      const rawFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        rawFiles.push({
          name: file.name,
          data: arrayBuffer,
        });
      }

      setSpvProgress({ current: Math.floor(rawFiles.length / 2), total: rawFiles.length, stage: 'Extragere XML & Validare CUI...' });

      const result = await importSpvInvoices(rawFiles, currentUser?.fullName || 'Utilizator');
      setLastImportResult(result);

      if (result.importedCount > 0) {
        notify(`Import finalizat cu succes: ${result.importedCount} facturi importate, ${result.duplicatesCount} duplicate ignorate.`);
      } else if (result.duplicatesCount > 0) {
        notify(`Toate cele ${result.duplicatesCount} facturi erau deja importate (duplicate ignorate).`, 'warning');
      } else if (result.mismatchedCuiCount > 0) {
        notify(`Facturile încărcate aparțin altei companii (CUI nepotrivit). Nu au fost importate.`, 'error');
      } else {
        notify(`Nicio factură validă nu a fost găsită în fișierele selectate.`, 'error');
      }
    } catch (err: any) {
      notify(err.message || 'Eroare la importul fișierelor din SPV.', 'error');
    } finally {
      setIsImportingSpv(false);
      setSpvProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    <div className="space-y-8 pb-12 font-sans">
      {/* Hidden Multi-file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelected}
        multiple
        accept=".xml,.zip"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              Profil Companie & Integrare RO e-Factura
            </h1>
            <Badge variant="purple" size="sm">Two-Stage Pipeline</Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-3xl">
            Importă facturile descărcate din SPV ANAF (XML / ZIP) sau vizualizează datele canonice ale companiei tale.
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
                <Badge variant="purple" size="sm">✓ Facturi SPV Sincronizate</Badge>
              ) : (
                <Badge variant="outline" size="sm" className="bg-zinc-800 text-zinc-300 border-zinc-700">SPV Nesincronizat</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono flex-wrap">
              <span>CUI: <strong className="text-white">{currentOrg.cui || 'Lipsă CUI'}</strong></span>
              <span>•</span>
              <span>Regim TVA: <strong className="text-white">{currentOrg.vatRegistered ? 'Plătitor' : 'Neplătitor'}</strong></span>
              <span>•</span>
              <span>Facturi e-Factura: <strong className="text-purple-300">{efactura?.invoicesCount || efacturaDocs.length}</strong></span>
              <span>•</span>
              <span>Furnizori Identificați: <strong className="text-emerald-300">{suppliers.length}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="purple"
            size="sm"
            onClick={() => {
              setActiveTab('efactura');
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            className="gap-2 font-bold shadow-md shadow-purple-900/40"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importă din SPV (XML / ZIP)</span>
          </Button>
        </div>
      </div>

      {/* Conflict Resolution Card (If names differ) */}
      {hasNameConflict && (
        <Card className="p-4 sm:p-5 border-amber-300 bg-amber-50/50 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  Am detectat o diferență între denumirea contului și registrul oficial ANAF
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  În SAVE: <strong>„{currentOrg.name}”</strong> | În registrul ANAF: <strong>„{snapshot.legalName}”</strong>
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleUseOfficialName}
              className="gap-1.5 text-xs font-bold border-amber-400 text-amber-950 bg-white hover:bg-amber-100 shrink-0"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Folosește denumirea oficială</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('efactura')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'efactura'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Integrare RO e-Factura & SPV</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Date Juridice & Fiscale (ANAF)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Istoric Importuri SPV ({importBatches?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: INTEGRARE RO e-FACTURA & IMPORT SPV */}
      {activeTab === 'efactura' && (
        <div className="space-y-6">
          {/* STAGE 1 (PRODUCTION NOW) — HERO IMPORT SPV CARD */}
          <Card className="p-6 sm:p-8 border-purple-300 bg-gradient-to-b from-purple-50/50 via-white to-white shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold border border-purple-200">
                      Etapa 1 • Producție Activă
                    </span>
                    <h3 className="font-black text-lg text-zinc-900">Importă Facturi din SPV (e-Factura)</h3>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">
                    Descarcă facturile din RO e-Factura/SPV și încarcă-le aici. SAVE le va importa automat, determinist și fără interpretări aproximative.
                  </p>
                </div>
              </div>

              <Button
                variant="purple"
                size="md"
                disabled={isImportingSpv}
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="gap-2 font-bold shadow-md shadow-purple-600/20 shrink-0"
              >
                <FolderArchive className="w-4 h-4" />
                <span>Selectează Fișiere XML / ZIP</span>
              </Button>
            </div>

            {/* Drag and Drop Zone */}
            <div 
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl p-8 text-center bg-purple-50/20 hover:bg-purple-50/40 cursor-pointer transition-all space-y-3"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-zinc-900">
                  Trage fișierele XML sau arhiva .ZIP descărcată din SPV aici
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Acceptă fișiere individuale <strong className="font-mono text-zinc-700">.xml</strong> sau arhive <strong className="font-mono text-zinc-700">.zip</strong> cu multiple facturi descărcate din SPV ANAF.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-mono pt-2">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Parsare UBL Deterministă</span>
                <span>•</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Validare CUI Cumpărător</span>
                <span>•</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 0 Duplicate Create</span>
              </div>
            </div>

            {/* Progress Bar */}
            {spvProgress && (
              <div className="p-4 bg-purple-100/60 border border-purple-200 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                  <span>{spvProgress.stage}</span>
                  <span className="font-mono">{spvProgress.current} / {spvProgress.total}</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(10, Math.round((spvProgress.current / Math.max(1, spvProgress.total)) * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Completion Summary Card (if just finished) */}
            {lastImportResult && (
              <div className="p-5 bg-zinc-900 text-white rounded-2xl space-y-4 animate-in fade-in border border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-sm">Rezumat Import SPV Finalizat</h4>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {new Date(lastImportResult.batch.createdAt).toLocaleTimeString('ro-RO')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-zinc-800/80 rounded-xl">
                    <span className="text-[10px] text-zinc-400 uppercase block">Procesate</span>
                    <span className="text-xl font-bold font-mono text-white">{lastImportResult.totalProcessed}</span>
                  </div>
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/50 rounded-xl">
                    <span className="text-[10px] text-emerald-300 uppercase block">Importate</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">{lastImportResult.importedCount}</span>
                  </div>
                  <div className="p-3 bg-zinc-800/80 rounded-xl">
                    <span className="text-[10px] text-zinc-400 uppercase block">Duplicate Ignorate</span>
                    <span className="text-xl font-bold font-mono text-zinc-300">{lastImportResult.duplicatesCount}</span>
                  </div>
                  <div className="p-3 bg-rose-950/60 border border-rose-800/50 rounded-xl">
                    <span className="text-[10px] text-rose-300 uppercase block">CUI Nepotrivit / Erori</span>
                    <span className="text-xl font-bold font-mono text-rose-400">
                      {lastImportResult.mismatchedCuiCount + lastImportResult.invalidCount}
                    </span>
                  </div>
                </div>

                {lastImportResult.errors.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs">
                    <span className="text-[11px] text-amber-300 font-semibold block">Avertismente / Notificări:</span>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-2">
                      {lastImportResult.errors.map((err, idx) => (
                        <p key={idx} className="text-zinc-300 font-mono text-[11px] bg-zinc-800/60 p-1.5 rounded">
                          • {err}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Connection Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-xs">
                <span className="text-[10px] text-zinc-400 font-semibold block uppercase">CUI Companie</span>
                <p className="text-sm font-mono font-bold text-zinc-900 mt-1">
                  {currentOrg.cui || 'Neconfigurat'}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-xs">
                <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Ultimul Import SPV</span>
                <p className="text-sm font-mono font-bold text-zinc-900 mt-1">
                  {efactura?.lastSyncAt ? new Date(efactura.lastSyncAt).toLocaleDateString('ro-RO') : 'Niciodată'}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-xs">
                <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Facturi Înrolate</span>
                <p className="text-sm font-mono font-bold text-purple-700 mt-1">
                  {efactura?.invoicesCount || efacturaDocs.length} facturi
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-xs">
                <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Furnizori Identificați</span>
                <p className="text-sm font-mono font-bold text-emerald-700 mt-1">
                  {suppliers.length} furnizori
                </p>
              </div>
            </div>
          </Card>

          {/* STAGE 2 — AUTOMATIC ANAF OAUTH CARD */}
          <Card className="p-6 bg-zinc-50 border-zinc-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 font-bold">
                      Etapa 2 • Sincronizare Automată
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900">Conectează automat ANAF (OAuth2 API)</h4>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Conectarea automată necesită configurarea aplicației SAVE în serviciile OAuth ANAF și autorizarea certificatului digital.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href="/admin/efactura-diagnostics">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 border-zinc-300 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Vezi Diagnostic Configurare OAuth</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Verification Rules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white rounded-xl border border-zinc-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">1</div>
              <h4 className="font-bold text-zinc-900">Filtrare Strictă după CUI</h4>
              <p className="text-zinc-500 leading-relaxed">
                Facturile primite sunt validate: CUI-ul cumpărătorului din XML trebuie să corespundă 100% cu CUI-ul companiei tale. Facturile altor companii sunt respinse.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-zinc-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">2</div>
              <h4 className="font-bold text-zinc-900">Deduplicare & Idempotență</h4>
              <p className="text-zinc-500 leading-relaxed">
                Algoritmul verifică cheia unică (CUI Furnizor + Număr Factură + Dată). Încărcarea aceleiași arhive de mai multe ori nu creează duplicate.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-zinc-200 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">3</div>
              <h4 className="font-bold text-zinc-900">Actualizare Tablou de Bord</h4>
              <p className="text-zinc-500 leading-relaxed">
                Fiecare factură creează automat furnizorul, înregistrarea de cheltuială și actualizează instant metricile reale de achiziții.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATE JURIDICE & FISCALE (ANAF) */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card className="p-6 border-zinc-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-zinc-900">Identitate Fiscală Oficială (Registrul ANAF)</h3>
              </div>
              <div className="flex items-center gap-2">
                {renderSourceBadge('anaf_public')}
                <span className="text-[10px] text-zinc-400 font-mono">
                  Verificat: {currentOrg.companyLookupCheckedAt ? new Date(currentOrg.companyLookupCheckedAt).toLocaleDateString('ro-RO') : 'Azi'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Denumire Legală</span>
                <p className="font-bold text-zinc-900 text-sm">{snapshot?.legalName || currentOrg.name || 'N/A'}</p>
                <div className="pt-1">{renderSourceBadge(currentOrg.fieldSources?.name?.source || 'anaf_public')}</div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">CUI / CIF</span>
                <p className="font-mono font-bold text-zinc-900 text-sm">{currentOrg.cui || 'N/A'}</p>
                <div className="pt-1">{renderSourceBadge('anaf_public')}</div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Regim Fiscal TVA</span>
                <p className="font-bold text-emerald-700 text-sm">
                  {currentOrg.vatRegistered ? '✓ Plătitor TVA' : 'Neplătitor TVA'}
                </p>
                <div className="pt-1">{renderSourceBadge('anaf_public')}</div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Număr Registrul Comerțului</span>
                <p className="font-mono font-medium text-zinc-800">{snapshot?.registrationNumber || currentOrg.registrationNumber || 'N/A'}</p>
                <div className="pt-1">{renderSourceBadge('anaf_public')}</div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Activitate Principală (CAEN)</span>
                <p className="font-medium text-zinc-800">
                  {snapshot?.caenCode ? `${snapshot.caenCode} - ${snapshot.caenDescription || ''}` : 'N/A'}
                </p>
                <div className="pt-1">{renderSourceBadge('anaf_public')}</div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Stare Activitate Fiscală</span>
                <p className="font-bold text-emerald-700">
                  {snapshot?.active !== false ? '✓ Activă (Fără suspendare)' : 'Inactivă'}
                </p>
                <div className="pt-1">{renderSourceBadge('anaf_public')}</div>
              </div>
            </div>

            {/* Address Row */}
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Sediu Social / Adresă Fiscală</span>
                {renderSourceBadge('anaf_public')}
              </div>
              <p className="font-medium text-zinc-900">
                {snapshot?.address || currentOrg.address || 'Adresă fiscală confirmată ANAF'}
              </p>
            </div>
          </Card>

          {/* Operational Parameters Editing */}
          <Card className="p-6 border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-zinc-900">Parametri Operaționali Companie</h3>
              </div>
              {renderSourceBadge('user')}
            </div>

            <form onSubmit={handleSaveOperational} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Industrie / Sector</label>
                <input
                  type="text"
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white font-medium text-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Interval Număr Angajați</label>
                <select
                  value={editEmployeeRange}
                  onChange={(e) => setEditEmployeeRange(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 font-medium cursor-pointer"
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

      {/* TAB 3: ISTORIC IMPORTURI SPV */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card className="p-5 border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">Jurnal Importuri RO e-Factura</h3>
                <p className="text-xs text-zinc-500">
                  Evidența tuturor pachetelor de facturi XML și arhive ZIP încărcate în SAVE.
                </p>
              </div>

              <Button
                variant="purple"
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="gap-1.5 text-xs font-bold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Nou</span>
              </Button>
            </div>

            {(!importBatches || importBatches.length === 0) ? (
              <div className="py-10 text-center text-xs text-zinc-400 space-y-2">
                <FolderArchive className="w-8 h-8 mx-auto text-zinc-300" />
                <p>Nu există încă importuri înregistrate pentru această organizație.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Dată & Oră</th>
                      <th className="py-3 px-4">Sursă</th>
                      <th className="py-3 px-4">Fișiere / Arhivă</th>
                      <th className="py-3 px-4">Importate</th>
                      <th className="py-3 px-4">Duplicate</th>
                      <th className="py-3 px-4">CUI Nepotrivit</th>
                      <th className="py-3 px-4">Încărcat de</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {importBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-zinc-800">
                          {new Date(batch.createdAt).toLocaleString('ro-RO')}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="purple" size="sm">
                            {batch.source === 'spv_manual' ? 'SPV Manual' : 'OAuth Auto'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-900">
                          {batch.fileName || `${batch.totalFiles} fișiere XML`}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                          {batch.importedCount}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500">
                          {batch.duplicatesCount}
                        </td>
                        <td className="py-3 px-4 font-mono text-rose-600">
                          {batch.mismatchedCuiCount || 0}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          {batch.uploadedBy || 'Utilizator'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
