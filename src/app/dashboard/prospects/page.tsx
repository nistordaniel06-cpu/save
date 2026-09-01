'use client';

import React, { useState } from 'react';
import { scrapeRomanianLeads, CompanyLead } from '@/lib/prospects/company-scraper';
import { generateProspectPitch, ColdPitchTemplates } from '@/lib/prospects/lead-scoring';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
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
  Target
} from 'lucide-react';

export default function ProspectsPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedLead, setSelectedLead] = useState<CompanyLead | null>(null);
  const [pitchTemplates, setPitchTemplates] = useState<ColdPitchTemplates | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp' | 'linkedin'>('email');
  const [copied, setCopied] = useState(false);

  const leads = scrapeRomanianLeads({
    industry: selectedIndustry,
    city: selectedCity,
  }).filter((l) => {
    const q = searchQuery.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.cui.toLowerCase().includes(q) || l.city.toLowerCase().includes(q);
  });

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
    const headers = ['Nume Companie', 'CUI', 'Oras', 'Judet', 'Industrie', 'Nr Angajati', 'OPEX Anual Estimat (RON)', 'Economii Estimate Min (RON)', 'Economii Estimate Max (RON)', 'Scor Oportunitate', 'Email', 'Telefon'];
    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      l.cui,
      `"${l.city}"`,
      `"${l.county}"`,
      `"${l.industry}"`,
      `"${l.employeeRange}"`,
      l.estimatedAnnualOpexRon,
      l.estimatedAnnualSavingsMin,
      l.estimatedAnnualSavingsMax,
      `${l.opportunityScore}%`,
      l.email || '',
      l.phone || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SAVE_B2B_Prospects_Romania_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Target className="w-6 h-6 text-emerald-600" />
            <span>Identificator Clienți Noi & Lead Scraper B2B</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Găsește IMM-uri din România cu cheltuieli mari de curierat, telecom, software și utilități unde SAVE poate genera economii garantate.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={leads.length === 0}
          className="shrink-0 flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-zinc-600" />
          <span>Exportă Lead-uri CSV ({leads.length})</span>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Firme Identificate"
          value={leads.length}
          subtitle="În filtrarea curentă"
          badgeText="Prospects"
          badgeVariant="default"
          icon={Building2}
        />
        <StatCard
          title="Economii Posibile Agregate"
          value={`${Math.round(totalPotentialSavings).toLocaleString('ro-RO')} lei`}
          subtitle="Potențial anual de reducere OPEX"
          badgeText="Impact"
          badgeVariant="success"
          icon={TrendingDown}
          highlight={true}
        />
        <StatCard
          title="Scor Mediu Oportunitate"
          value="92%"
          subtitle="Probabilitate mare de conversie"
          badgeText="Calificat"
          badgeVariant="purple"
          icon={Sparkles}
        />
        <StatCard
          title="Model de Vânzare"
          value="No Saving, No Fee"
          subtitle="15–20% comision pe succes"
          badgeText="Risc Zero"
          badgeVariant="info"
          icon={Target}
        />
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
                <th className="py-3.5 px-4">Locație</th>
                <th className="py-3.5 px-4">Industrie & Angajați</th>
                <th className="py-3.5 px-4">Categorii de Cost Atacabile</th>
                <th className="py-3.5 px-4 text-right">Economii Posibile (Anual)</th>
                <th className="py-3.5 px-4 text-center">Scor Oportunitate</th>
                <th className="py-3.5 px-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-medium">
                    <p className="font-bold text-zinc-900">{lead.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">CUI: {lead.cui}</p>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-600">
                    <p className="font-medium text-zinc-900">{lead.city}</p>
                    <p className="text-[10px] text-zinc-500">Jud. {lead.county}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-zinc-800">{lead.industry}</p>
                    <p className="text-[10px] text-zinc-500">{lead.employeeRange}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {lead.topSpendCategories.map((cat, idx) => (
                        <span key={idx} className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-zinc-200">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <p className="font-extrabold text-emerald-600">
                      {lead.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – {lead.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei
                    </p>
                    <p className="text-[10px] text-zinc-500">din OPEX ~{lead.estimatedAnnualOpexRon.toLocaleString('ro-RO')} lei</p>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={lead.opportunityScore >= 90 ? 'success' : 'purple'} size="sm">
                      {lead.opportunityScore}% Scor SAVE
                    </Badge>
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
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Pitch de Vânzare Personalizat — {selectedLead.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    CUI: {selectedLead.cui} · Economie estimată: {selectedLead.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – {selectedLead.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei/an
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg">
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
                <span>Cold Email Oficial</span>
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
                <span>WhatsApp / SMS Scurt</span>
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
                <span>LinkedIn Message</span>
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
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <p className="text-xs font-bold text-emerald-950">💡 Argumente cheie pentru discuție:</p>
                {pitchTemplates.keyTalkingPoints.map((pt, idx) => (
                  <p key={idx} className="text-xs text-emerald-900">• {pt}</p>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
