'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { scrapeRomanianLeads, CompanyLead } from '@/lib/prospects/company-scraper';
import { generateProspectPitch, ColdPitchTemplates } from '@/lib/prospects/lead-scoring';
import { triggerCsvDownload } from '@/lib/utils/export-csv';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Search, 
  Download, 
  Sparkles, 
  TrendingDown, 
  Mail, 
  MessageSquare, 
  Copy, 
  Check, 
  X, 
  ExternalLink,
  Target,
  ArrowLeft,
  Lock,
  AlertOctagon,
  AlertTriangle,
  Filter
} from 'lucide-react';
import clsx from 'clsx';

export default function AdminProspectsPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'critical' | 'poor' | 'moderate' | 'good'>('critical');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedLead, setSelectedLead] = useState<CompanyLead | null>(null);
  const [pitchTemplates, setPitchTemplates] = useState<ColdPitchTemplates | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp' | 'linkedin'>('email');
  const [copied, setCopied] = useState(false);

  const leads = scrapeRomanianLeads({
    industry: selectedIndustry,
    city: selectedCity,
    scoreFilter: scoreFilter,
  }).filter((l) => {
    const q = searchQuery.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.cui.toLowerCase().includes(q) || l.city.toLowerCase().includes(q);
  });

  const criticalLeadsCount = scrapeRomanianLeads({ scoreFilter: 'critical' }).length;
  const totalPotentialSavings = leads.reduce((sum, l) => sum + (l.estimatedAnnualSavingsMin + l.estimatedAnnualSavingsMax) / 2, 0);

  const openPitchModal = (lead: CompanyLead) => {
    setSelectedLead(lead);
    setPitchTemplates(generateProspectPitch(lead));
    setCopied(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = () => {
    const headers = ['Nume Companie', 'CUI', 'Oras', 'Judet', 'Industrie', 'Nr Angajati', 'Scor SAVE Estimat', 'Status Scor', 'Scurgeri Costuri', 'OPEX Anual Estimat (RON)', 'Economii Min (RON)', 'Economii Max (RON)', 'Email', 'Telefon'];
    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      l.cui,
      `"${l.city}"`,
      `"${l.county}"`,
      `"${l.industry}"`,
      `"${l.employeeRange}"`,
      `${l.saveScore}%`,
      l.saveScoreStatus,
      `"${l.criticalCostLeaks.join('; ').replace(/"/g, '""')}"`,
      l.estimatedAnnualOpexRon,
      l.estimatedAnnualSavingsMin,
      l.estimatedAnnualSavingsMax,
      l.email || '',
      l.phone || '',
    ]);

    triggerCsvDownload('SAVE_Admin_Prospects_Scor_Mic.csv', headers, rows);
  };

  return (
    <div className="space-y-8">
      {/* Admin Nav & Header */}
      <div className="pb-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link 
              href="/admin" 
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Înapoi la Admin Portal</span>
            </Link>
            <span className="text-zinc-300">•</span>
            <Badge variant="purple" size="sm">Admin Internal Engine</Badge>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Target className="w-6 h-6 text-emerald-600" />
            <span>Lead Scraper B2B — Firme cu Scor SAVE Mic (Ținte Ideale)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Identifică companii din România cu eficiență scăzută a achizițiilor (Scor SAVE &lt; 50%), unde potențialul de economisire și comisionul de succes sunt maxime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Restricted</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={leads.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-zinc-600" />
            <span>Exportă CSV ({leads.length})</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Firme cu Scor Critic (<50%)"
          value={criticalLeadsCount}
          subtitle="Ținte prioritare pentru outreach"
          badgeText="Urgență Mare"
          badgeVariant="danger"
          icon={AlertOctagon}
          highlight={true}
        />
        <StatCard
          title="Economii Posibile de Generat"
          value={`${Math.round(totalPotentialSavings).toLocaleString('ro-RO')} lei`}
          subtitle="Bază comision succes (15-20%)"
          badgeText="Impact B2B"
          badgeVariant="success"
          icon={TrendingDown}
        />
        <StatCard
          title="Comision Potențial SAVE"
          value={`${Math.round(totalPotentialSavings * 0.18).toLocaleString('ro-RO')} lei`}
          subtitle="La o rată medie de 18%"
          badgeText="Venit Estimat"
          badgeVariant="purple"
          icon={Sparkles}
        />
        <StatCard
          title="Rată de Răspuns Estimată"
          value="34% – 48%"
          subtitle="Datorită auditului cu scor critic"
          badgeText="Conversie"
          badgeVariant="info"
          icon={Building2}
        />
      </div>

      {/* Score Quick Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 rounded-xl border border-zinc-200">
        <span className="text-xs font-bold text-zinc-700 px-3 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtrare după Scorul SAVE:</span>
        </span>

        <button
          onClick={() => setScoreFilter('critical')}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5',
            scoreFilter === 'critical'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-zinc-700 hover:bg-zinc-200/80 border border-zinc-200'
          )}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>🔴 Scor Critic (&lt; 50%) — Ținte Ideale</span>
        </button>

        <button
          onClick={() => setScoreFilter('poor')}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5',
            scoreFilter === 'poor'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-zinc-700 hover:bg-zinc-200/80 border border-zinc-200'
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>🟠 Ineficiență Mare (50% - 65%)</span>
        </button>

        <button
          onClick={() => setScoreFilter('all')}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
            scoreFilter === 'all'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white text-zinc-700 hover:bg-zinc-200/80 border border-zinc-200'
          )}
        >
          Toate Firmele ({scrapeRomanianLeads({}).length})
        </button>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Caută după nume firmă, CUI sau oraș..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white rounded-xl border border-zinc-300 focus:outline-emerald-600"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="text-xs py-2 px-3 bg-white rounded-xl border border-zinc-300 focus:outline-emerald-600"
          >
            <option value="all">Toate Industriile</option>
            <option value="Comerț">Comerț Online & Distribuție</option>
            <option value="Transport">Transport & Logistică</option>
            <option value="IT">IT & Software</option>
            <option value="Producție">Producție & Ambalaje</option>
            <option value="Construcții">Construcții</option>
            <option value="Sănătate">Sănătate & Farmaceutice</option>
            <option value="Agricultură">Agricultură</option>
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs py-2 px-3 bg-white rounded-xl border border-zinc-300 focus:outline-emerald-600"
          >
            <option value="all">Toate Orașele</option>
            <option value="București">București</option>
            <option value="Cluj">Cluj-Napoca</option>
            <option value="Timiș">Timișoara</option>
            <option value="Iași">Iași</option>
            <option value="Brașov">Brașov</option>
            <option value="Constanța">Constanța</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Companie & CUI</th>
                <th className="py-3.5 px-4">Locație & Angajați</th>
                <th className="py-3.5 px-4 text-center">Scor SAVE Estimat</th>
                <th className="py-3.5 px-4">Vulnerabilități Principale (Cost Leaks)</th>
                <th className="py-3.5 px-4 text-right">Economii Posibile (Anual)</th>
                <th className="py-3.5 px-4 text-right">Acțiuni Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-medium">
                    <p className="font-bold text-zinc-900">{lead.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">CUI: {lead.cui} · {lead.industry}</p>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-600">
                    <p className="font-medium text-zinc-900">{lead.city}, {lead.county}</p>
                    <p className="text-[10px] text-zinc-500">{lead.employeeRange}</p>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-full text-xs font-black font-mono border',
                        lead.saveScore < 50 ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        lead.saveScore < 65 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border-emerald-200'
                      )}>
                        {lead.saveScore}/100
                      </span>
                      <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                        {lead.saveScore < 50 ? '🔴 Scor Critic' : lead.saveScore < 65 ? '🟠 Ineficient' : '🟢 Optimizat'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <ul className="text-[11px] text-zinc-700 space-y-0.5 list-disc list-inside">
                      {lead.criticalCostLeaks.map((leak, idx) => (
                        <li key={idx} className="truncate text-zinc-600">{leak}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <p className="font-extrabold text-emerald-600">
                      {lead.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – {lead.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei
                    </p>
                    <p className="text-[10px] text-zinc-500">din OPEX ~{lead.estimatedAnnualOpexRon.toLocaleString('ro-RO')} lei</p>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openPitchModal(lead)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] py-1.5 px-3"
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

      {/* Pitch Generator Modal */}
      {selectedLead && pitchTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold font-mono">
                  {selectedLead.saveScore}%
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Pitch de Outreach cu Scor Critic — {selectedLead.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    CUI: {selectedLead.cui} · Economii țintă: {selectedLead.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – {selectedLead.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei/an
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-5 pt-4 flex gap-2 border-b border-zinc-200 bg-zinc-50">
              <button
                onClick={() => setActiveTab('email')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'email'
                    ? 'border-emerald-600 text-emerald-700 bg-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Cold Email Bazat pe Scor</span>
              </button>

              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'whatsapp'
                    ? 'border-emerald-600 text-emerald-700 bg-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Scurt</span>
              </button>

              <button
                onClick={() => setActiveTab('linkedin')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'linkedin'
                    ? 'border-emerald-600 text-emerald-700 bg-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>LinkedIn InMail</span>
              </button>
            </div>

            {/* Modal Body */}
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
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5">
                <p className="text-xs font-bold text-rose-950">🎯 Puncte cheie de abordare bazate pe scor critic:</p>
                {pitchTemplates.keyTalkingPoints.map((pt, idx) => (
                  <p key={idx} className="text-xs text-rose-900">• {pt}</p>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
