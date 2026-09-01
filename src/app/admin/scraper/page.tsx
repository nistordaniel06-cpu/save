'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  scrapeNationalLeads, 
  NationalLead, 
  EntityType, 
  RomanianRegion, 
  ROMANIAN_COUNTIES 
} from '@/lib/prospects/national-scraper';
import { generateNationalPitch, NationalPitchTemplates } from '@/lib/prospects/national-pitch-engine';
import { triggerCsvDownload } from '@/lib/utils/export-csv';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Building2, 
  UserCheck, 
  Search, 
  Filter, 
  Download, 
  Sparkles, 
  TrendingDown, 
  Mail, 
  MessageSquare, 
  Copy, 
  Check, 
  X, 
  ExternalLink,
  Phone,
  Target,
  ArrowLeft,
  Lock,
  AlertOctagon,
  MapPin,
  Briefcase,
  Share2
} from 'lucide-react';
import clsx from 'clsx';
import { ScraperAuthGate } from '@/components/admin/scraper-auth-gate';

export default function MasterNationalScraperPage() {
  const [selectedEntityType, setSelectedEntityType] = useState<'all' | EntityType>('all');
  const [selectedCounty, setSelectedCounty] = useState<string>('Toate Județele');
  const [selectedRegion, setSelectedRegion] = useState<'all' | RomanianRegion>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'critical' | 'poor' | 'moderate' | 'good'>('critical');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedLead, setSelectedLead] = useState<NationalLead | null>(null);
  const [pitchTemplates, setPitchTemplates] = useState<NationalPitchTemplates | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp' | 'linkedin'>('email');
  const [copied, setCopied] = useState(false);

  const leads = scrapeNationalLeads({
    entityType: selectedEntityType,
    county: selectedCounty,
    region: selectedRegion,
    industry: selectedIndustry,
    scoreFilter,
    searchQuery,
  });

  const pjCount = leads.filter((l) => l.entityType === 'juridica').length;
  const pfCount = leads.filter((l) => l.entityType === 'fizica_profesie_liberala').length;
  const totalPotentialSavings = leads.reduce((sum, l) => sum + (l.estimatedAnnualSavingsMin + l.estimatedAnnualSavingsMax) / 2, 0);

  const openPitchModal = (lead: NationalLead) => {
    setSelectedLead(lead);
    setPitchTemplates(generateNationalPitch(lead));
    setCopied(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = () => {
    const headers = [
      'Tip Entitate',
      'Denumire / Nume Cabinet',
      'Factor Decizie',
      'Functie / Titlu',
      'CUI / Identificator Fiscal',
      'Oras',
      'Judet',
      'Regiune',
      'Industrie / Domeniu',
      'Dimensiune / Echipă',
      'Scor SAVE Estimat',
      'Scurgere Principala Cost',
      'OPEX Anual Estimat (RON)',
      'Economie Minima (RON)',
      'Economie Maxima (RON)',
      'Email Direct',
      'Telefon Direct',
      'Website / LinkedIn'
    ];

    const rows = leads.map((l) => [
      `"${l.entityTypeLabel}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.decisionMakerName}"`,
      `"${l.roleTitle}"`,
      l.cuiOrFiscalId,
      `"${l.city}"`,
      `"${l.county}"`,
      `"${l.region}"`,
      `"${l.industry}"`,
      `"${l.sizeOrStaffRange}"`,
      `${l.saveScore}%`,
      `"${l.criticalCostLeaks[0] || ''}"`,
      l.estimatedAnnualOpexRon,
      l.estimatedAnnualSavingsMin,
      l.estimatedAnnualSavingsMax,
      l.email,
      l.phone,
      l.websiteOrLinkedIn
    ]);

    triggerCsvDownload('SAVE_Master_Leads_Romania_PJ_PF.csv', headers, rows);
  };

  return (
    <ScraperAuthGate>
      <div className="space-y-8">
      {/* Header & Access Lock */}
      <div className="pb-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link 
              href="/admin" 
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
            <span className="text-zinc-300">•</span>
            <Badge variant="purple" size="sm">Master National Scraper (Owner Exclusive)</Badge>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-emerald-600" />
            <span>Master Lead Scraper România — Persoane Juridice & Persoane Fizice (Toate Județele)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Acces exclusiv admin: Găsește companii SRL/SA și profesii liberale (medici, avocați, notari, arhitecți, PFA) din toate cele 41 județe ale României.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Owner Only Access</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={leads.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-zinc-600" />
            <span>Exportă România CSV ({leads.length})</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lead-uri Identificate (România)"
          value={leads.length}
          subtitle={`${pjCount} Persoane Juridice · ${pfCount} Persoane Fizice/PFA`}
          badgeText="Național"
          badgeVariant="default"
          icon={Globe}
        />
        <StatCard
          title="Persoane Fizice & Profesii Liberale"
          value={pfCount}
          subtitle="Medici, Avocați, Notari, PFA"
          badgeText="Profesii Liberale"
          badgeVariant="purple"
          icon={UserCheck}
        />
        <StatCard
          title="Economii Posibile Agregate"
          value={`${Math.round(totalPotentialSavings).toLocaleString('ro-RO')} lei`}
          subtitle="Potențial național de optimizare"
          badgeText="Impact"
          badgeVariant="success"
          icon={TrendingDown}
          highlight={true}
        />
        <StatCard
          title="Comision Potențial SAVE"
          value={`${Math.round(totalPotentialSavings * 0.18).toLocaleString('ro-RO')} lei`}
          subtitle="La o rată medie de 18% succes"
          badgeText="Venit Estimat"
          badgeVariant="warning"
          icon={Sparkles}
        />
      </div>

      {/* Entity Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setSelectedEntityType('all')}
          className={clsx(
            'p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between',
            selectedEntityType === 'all'
              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
              : 'bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200'
          )}
        >
          <div>
            <p className="font-bold text-xs">Toate Entitățile (România)</p>
            <p className={clsx('text-[11px] mt-0.5', selectedEntityType === 'all' ? 'text-zinc-300' : 'text-zinc-500')}>
              Persoane Juridice + Persoane Fizice
            </p>
          </div>
          <Globe className="w-5 h-5 opacity-70" />
        </button>

        <button
          onClick={() => setSelectedEntityType('juridica')}
          className={clsx(
            'p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between',
            selectedEntityType === 'juridica'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200'
          )}
        >
          <div>
            <p className="font-bold text-xs">Persoane Juridice (SRL / SA)</p>
            <p className={clsx('text-[11px] mt-0.5', selectedEntityType === 'juridica' ? 'text-emerald-100' : 'text-zinc-500')}>
              Companii, Distribuție, Logistică, IT
            </p>
          </div>
          <Building2 className="w-5 h-5 opacity-70" />
        </button>

        <button
          onClick={() => setSelectedEntityType('fizica_profesie_liberala')}
          className={clsx(
            'p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between',
            selectedEntityType === 'fizica_profesie_liberala'
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200'
          )}
        >
          <div>
            <p className="font-bold text-xs">Persoane Fizice & Profesii Liberale</p>
            <p className={clsx('text-[11px] mt-0.5', selectedEntityType === 'fizica_profesie_liberala' ? 'text-purple-100' : 'text-zinc-500')}>
              Medici, Avocați, Notari, Arhitecți, PFA
            </p>
          </div>
          <UserCheck className="w-5 h-5 opacity-70" />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Caută după nume firmă/persoană, CUI/CNP, oraș sau domeniu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white rounded-xl border border-zinc-300 focus:outline-emerald-600"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* County Selector */}
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="text-xs py-2 px-3 bg-white rounded-xl border border-zinc-300 focus:outline-emerald-600 font-medium"
            >
              {ROMANIAN_COUNTIES.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>

            {/* Region Selector */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as any)}
              className="text-xs py-2 px-3 bg-white rounded-xl border border-zinc-300 focus:outline-emerald-600 font-medium"
            >
              <option value="all">Toate Regiunile României</option>
              <option value="București-Ilfov">București-Ilfov</option>
              <option value="Transilvania">Transilvania (Cluj, Brașov, Sibiu)</option>
              <option value="Banat">Banat (Timiș, Caraș-Severin)</option>
              <option value="Moldova">Moldova (Iași, Bacău, Suceava)</option>
              <option value="Muntenia">Muntenia (Prahova, Argeș)</option>
              <option value="Oltenia">Oltenia (Dolj, Gorj)</option>
              <option value="Dobrogea">Dobrogea (Constanța, Tulcea)</option>
              <option value="Crișana">Crișana (Bihor, Arad)</option>
            </select>

            {/* Industry Selector */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="text-xs py-2 px-3 bg-white rounded-xl border border-zinc-300 focus:outline-emerald-600 font-medium"
            >
              <option value="all">Toate Industriile</option>
              <option value="Comerț">Comerț Online & Retail</option>
              <option value="Transport">Transport & Logistică</option>
              <option value="Sănătate">Sănătate & Cabinete Medicale</option>
              <option value="Juridic">Servicii Juridice & Notariate</option>
              <option value="Arhitectură">Arhitectură & Proiectare</option>
              <option value="IT">IT & Software</option>
              <option value="Producție">Producție & Ambalaje</option>
              <option value="Agricultură">Agricultură</option>
            </select>
          </div>
        </div>

        {/* Score Quick Filter Bar */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-zinc-200/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-zinc-700 flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrare Scor SAVE:</span>
            </span>

            <button
              onClick={() => setScoreFilter('critical')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1',
                scoreFilter === 'critical'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-zinc-700 hover:bg-zinc-200/80 border border-zinc-200'
              )}
            >
              <AlertOctagon className="w-3 h-3" />
              <span>🔴 Scor Critic (&lt; 50%) — Ținte Ideale</span>
            </button>

            <button
              onClick={() => setScoreFilter('poor')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                scoreFilter === 'poor'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-zinc-700 hover:bg-zinc-200/80 border border-zinc-200'
              )}
            >
              <span>🟠 Ineficient (50% - 65%)</span>
            </button>

            <button
              onClick={() => setScoreFilter('all')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                scoreFilter === 'all'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white text-zinc-700 hover:bg-zinc-200/80 border border-zinc-200'
              )}
            >
              Toate Scorurile ({scrapeNationalLeads({}).length})
            </button>
          </div>

          <span className="text-zinc-500 font-mono text-[11px]">
            {leads.length} lead-uri găsite în România
          </span>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Entitate & Tip</th>
                <th className="py-3.5 px-4">Factor de Decizie</th>
                <th className="py-3.5 px-4">Locație & Județ</th>
                <th className="py-3.5 px-4 text-center">Scor SAVE</th>
                <th className="py-3.5 px-4">Vulnerabilitate Cheie</th>
                <th className="py-3.5 px-4 text-right">Economii Posibile</th>
                <th className="py-3.5 px-4 text-center">Contact Direct</th>
                <th className="py-3.5 px-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-medium">
                    <p className="font-bold text-zinc-900 text-sm">{lead.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={clsx(
                        'px-1.5 py-0.2 rounded text-[9px] font-bold uppercase',
                        lead.entityType === 'juridica'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      )}>
                        {lead.entityType === 'juridica' ? 'Persoană Juridică' : 'Profesie Liberală / PFA'}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">CUI: {lead.cuiOrFiscalId}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-zinc-900">{lead.decisionMakerName}</p>
                    <p className="text-[11px] text-zinc-500">{lead.roleTitle}</p>
                    <p className="text-[10px] text-zinc-400">{lead.sizeOrStaffRange}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-zinc-900">{lead.city}</p>
                    <p className="text-[11px] text-zinc-500">Jud. {lead.county} ({lead.region})</p>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={clsx(
                        'px-2.5 py-0.5 rounded-full text-xs font-black font-mono border',
                        lead.saveScore < 50 ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        lead.saveScore < 65 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border-emerald-200'
                      )}>
                        {lead.saveScore}%
                      </span>
                      <span className="text-[9px] text-zinc-500 font-semibold mt-0.5">
                        {lead.saveScore < 50 ? '🔴 Critic' : lead.saveScore < 65 ? '🟠 Ineficient' : '🟢 Bun'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-[11px] text-zinc-700 leading-snug">
                      {lead.criticalCostLeaks[0]}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lead.topSpendCategories.map((cat, idx) => (
                        <span key={idx} className="bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded text-[9px] font-mono border border-zinc-200">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <p className="font-extrabold text-emerald-600 text-sm">
                      {lead.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – {lead.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei
                    </p>
                    <p className="text-[10px] text-zinc-500">din OPEX ~{lead.estimatedAnnualOpexRon.toLocaleString('ro-RO')} lei</p>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-zinc-600">
                      <a
                        href={lead.websiteOrLinkedIn}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                        title="Website / LinkedIn"
                      >
                        <Share2 className="w-4 h-4" />
                      </a>
                      <a
                        href={`mailto:${lead.email}`}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
                        title={`Email: ${lead.email}`}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                      <a
                        href={`tel:${lead.phone}`}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                        title={`Telefon: ${lead.phone}`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openPitchModal(lead)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] py-1.5 px-3 whitespace-nowrap shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      <span>Generează Pitch</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* National Pitch Modal */}
      {selectedLead && pitchTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold font-mono">
                  {selectedLead.saveScore}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900">
                      Pitch Personalizat — {selectedLead.name}
                    </h3>
                    <Badge variant={selectedLead.entityType === 'juridica' ? 'success' : 'purple'} size="sm">
                      {selectedLead.entityType === 'juridica' ? 'Persoană Juridică' : 'Profesie Liberală'}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    {selectedLead.decisionMakerName} ({selectedLead.roleTitle}) · {selectedLead.city}, Jud. {selectedLead.county} · Economie: {selectedLead.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – {selectedLead.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei/an
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLead(null)} 
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-3 flex flex-wrap gap-2 border-b border-zinc-200 bg-zinc-50 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('email')}
                className={clsx(
                  'px-3 py-2 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer',
                  activeTab === 'email' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-800'
                )}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Cold Email Național</span>
              </button>

              <button
                onClick={() => setActiveTab('whatsapp')}
                className={clsx(
                  'px-3 py-2 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer',
                  activeTab === 'whatsapp' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-800'
                )}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Scurt</span>
              </button>

              <button
                onClick={() => setActiveTab('linkedin')}
                className={clsx(
                  'px-3 py-2 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer',
                  activeTab === 'linkedin' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-800'
                )}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>LinkedIn Message</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {activeTab === 'email' && (
                <div className="space-y-2">
                  <div className="bg-zinc-100 p-2.5 rounded-lg text-xs font-mono text-zinc-800">
                    <span className="font-bold text-zinc-500">Subiect:</span> {pitchTemplates.emailSubject}
                  </div>
                  <div className="relative">
                    <textarea
                      readOnly
                      rows={12}
                      value={pitchTemplates.emailBody}
                      className="w-full text-xs p-3.5 rounded-xl border border-zinc-300 font-sans leading-relaxed bg-zinc-50 text-zinc-800 focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleCopy(`${pitchTemplates.emailSubject}\n\n${pitchTemplates.emailBody}`)}
                      className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiat!' : 'Copiază Email'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'whatsapp' && (
                <div className="relative">
                  <textarea
                    readOnly
                    rows={6}
                    value={pitchTemplates.whatsAppMessage}
                    className="w-full text-xs p-3.5 rounded-xl border border-zinc-300 font-sans leading-relaxed bg-zinc-50 text-zinc-800 focus:outline-hidden"
                  />
                  <button
                    onClick={() => handleCopy(pitchTemplates.whatsAppMessage)}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiat!' : 'Copiază Text'}</span>
                  </button>
                </div>
              )}

              {activeTab === 'linkedin' && (
                <div className="relative">
                  <textarea
                    readOnly
                    rows={6}
                    value={pitchTemplates.linkedInMessage}
                    className="w-full text-xs p-3.5 rounded-xl border border-zinc-300 font-sans leading-relaxed bg-zinc-50 text-zinc-800 focus:outline-hidden"
                  />
                  <button
                    onClick={() => handleCopy(pitchTemplates.linkedInMessage)}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiat!' : 'Copiază Text'}</span>
                  </button>
                </div>
              )}

              {/* Talking points */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
                <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  Puncte cheie pentru discuția cu {selectedLead.decisionMakerName}:
                </p>
                {pitchTemplates.keyTalkingPoints.map((pt, idx) => (
                  <p key={idx} className="text-xs text-emerald-900">• {pt}</p>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      </div>
    </ScraperAuthGate>
  );
}
