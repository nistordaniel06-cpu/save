'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  scrapeBucharestDecisionMakers, 
  BucharestDecisionMaker, 
  DecisionMakerRole 
} from '@/lib/prospects/bucharest-people-scraper';
import { generatePersonPitch, DecisionMakerPitch } from '@/lib/prospects/people-pitch-engine';
import { triggerCsvDownload } from '@/lib/utils/export-csv';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
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

export default function BucharestProspectsPage() {
  const [selectedRole, setSelectedRole] = useState<'all' | DecisionMakerRole>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [onlyCritical, setOnlyCritical] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedPerson, setSelectedPerson] = useState<BucharestDecisionMaker | null>(null);
  const [pitchTemplates, setPitchTemplates] = useState<DecisionMakerPitch | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp' | 'linkedin_note' | 'linkedin_inmail'>('email');
  const [copied, setCopied] = useState(false);

  const people = scrapeBucharestDecisionMakers({
    role: selectedRole,
    sector: selectedSector,
    industry: selectedIndustry,
    maxSaveScore: onlyCritical ? 49 : undefined,
    searchQuery,
  });

  const cfoCount = people.filter((p) => p.roleCategory === 'cfo' || p.roleCategory === 'finance_manager').length;
  const totalPotentialSavings = people.reduce((sum, p) => sum + (p.estimatedAnnualSavingsMin + p.estimatedAnnualSavingsMax) / 2, 0);

  const openPitchModal = (person: BucharestDecisionMaker) => {
    setSelectedPerson(person);
    setPitchTemplates(generatePersonPitch(person));
    setCopied(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = () => {
    const headers = [
      'Nume si Prenume',
      'Functie / Titlu',
      'Categorie Rol',
      'Companie',
      'CUI',
      'Sector / Judet',
      'Zona / Hub Birouri',
      'Industrie',
      'Nr Angajati',
      'Scor SAVE Estimat',
      'Scurgere Principala Cost',
      'Economie Minima (RON)',
      'Economie Maxima (RON)',
      'Email Direct',
      'Telefon Direct',
      'Profil LinkedIn'
    ];

    const rows = people.map((p) => [
      `"${p.fullName}"`,
      `"${p.roleTitle}"`,
      p.roleCategory,
      `"${p.companyName.replace(/"/g, '""')}"`,
      p.cui,
      `"${p.sector}"`,
      `"${p.districtArea}"`,
      `"${p.industry}"`,
      `"${p.employeeRange}"`,
      `${p.saveScore}%`,
      `"${p.keyPainPoints[0] || ''}"`,
      p.estimatedAnnualSavingsMin,
      p.estimatedAnnualSavingsMax,
      p.email,
      p.phone,
      p.linkedinUrl
    ]);

    triggerCsvDownload('SAVE_Decidenti_Bucuresti.csv', headers, rows);
  };

  return (
    <ScraperAuthGate>
      <div className="space-y-8">
      {/* Navigation & Header */}
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
            <Link 
              href="/admin/prospects" 
              className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Lead Scraper Firme
            </Link>
            <span className="text-zinc-300">•</span>
            <Badge variant="success" size="sm">București B2B Hub</Badge>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Lead Scraper București — Oameni & Factori de Decizie (CFO, CEO, Achiziții)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Găsește direct persoanele responsabile cu bugetele (CFO, CEO, Procurement) din București & Ilfov, cu pitch-uri de vânzare personalizate pe profilul fiecărui decident.
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
            disabled={people.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-zinc-600" />
            <span>Exportă Decidenți CSV ({people.length})</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Decidenți Identificați în București"
          value={people.length}
          subtitle="În hub-urile de business selectate"
          badgeText="București & Ilfov"
          badgeVariant="default"
          icon={Users}
        />
        <StatCard
          title="Directori Financiari (CFO)"
          value={cfoCount}
          subtitle="Interesați direct de EBITDA & OPEX"
          badgeText="Target Principal"
          badgeVariant="purple"
          icon={Briefcase}
        />
        <StatCard
          title="Economii Anuale Agregate"
          value={`${Math.round(totalPotentialSavings).toLocaleString('ro-RO')} lei`}
          subtitle="Potențial de reducere costuri"
          badgeText="Impact B2B"
          badgeVariant="success"
          icon={TrendingDown}
          highlight={true}
        />
        <StatCard
          title="Comision Potențial de Succes"
          value={`${Math.round(totalPotentialSavings * 0.18).toLocaleString('ro-RO')} lei`}
          subtitle="La o rată de succes de 18%"
          badgeText="Venit SAVE"
          badgeVariant="warning"
          icon={Sparkles}
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Caută după nume decident, companie, hub (Floreasca, Pipera, Băneasa, Militari)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white rounded-xl border border-zinc-300 focus:outline-emerald-600"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="text-xs py-2 px-3 bg-white rounded-xl border border-zinc-300 focus:outline-emerald-600 font-medium"
            >
              <option value="all">Toate Rolurile</option>
              <option value="cfo">CFO / Directori Financiari</option>
              <option value="ceo">CEO / Fondatori / General Managers</option>
              <option value="procurement">Directori Achiziții & Facilities</option>
              <option value="coo">COO / Directori Operaționali</option>
              <option value="finance_manager">Finance & Controlling Managers</option>
            </select>

            {/* Sector / District Filter */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="text-xs py-2 px-3 bg-white rounded-xl border border-zinc-300 focus:outline-emerald-600 font-medium"
            >
              <option value="all">Toate Sectoarele București</option>
              <option value="Sector 1">Sector 1 (Floreasca, Pipera, Băneasa)</option>
              <option value="Sector 2">Sector 2 (Barbu Văcărescu, Aviației, Pantelimon)</option>
              <option value="Sector 3">Sector 3 (Theodor Pallady, Unirii)</option>
              <option value="Sector 4">Sector 4 (Berceni Business Center)</option>
              <option value="Sector 5">Sector 5 (AFI Cotroceni, Răzoare)</option>
              <option value="Sector 6">Sector 6 (Militari Logistics, Iuliu Maniu)</option>
              <option value="Ilfov / Otopeni / Voluntari">Ilfov (Otopeni, Voluntari, Pipera Nord)</option>
            </select>

            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="text-xs py-2 px-3 bg-white rounded-xl border border-zinc-300 focus:outline-emerald-600 font-medium"
            >
              <option value="all">Toate Industriile</option>
              <option value="Comerț">Comerț Online & Retail</option>
              <option value="IT">IT & Software</option>
              <option value="Transport">Transport & Logistică</option>
              <option value="Producție">Producție & Ambalaje</option>
              <option value="Construcții">Construcții</option>
              <option value="HoReCa">HoReCa & Food Supply</option>
              <option value="Sănătate">Sănătate & Farmaceutice</option>
              <option value="Servicii">Servicii Profesionale & Juridic</option>
            </select>
          </div>
        </div>

        {/* Quick Toggle for Critical Score */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-200/80 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-700">
            <input
              type="checkbox"
              checked={onlyCritical}
              onChange={(e) => setOnlyCritical(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
            <span className="flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              Arată doar companiile cu Scor SAVE Critic (&lt; 50%) — Urgență Maximă
            </span>
          </label>

          <span className="text-zinc-500 font-mono text-[11px]">
            {people.length} decidenți găsiți în București
          </span>
        </div>
      </div>

      {/* Decision-Makers Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Factor de Decizie (Persoană)</th>
                <th className="py-3.5 px-4">Companie & Hub București</th>
                <th className="py-3.5 px-4 text-center">Scor SAVE</th>
                <th className="py-3.5 px-4">Vulnerabilitate Identificată</th>
                <th className="py-3.5 px-4 text-right">Economii Estimate</th>
                <th className="py-3.5 px-4 text-center">Contact Direct</th>
                <th className="py-3.5 px-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {people.map((person) => (
                <tr key={person.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-zinc-900 text-sm">{person.fullName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={clsx(
                        'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                        person.roleCategory === 'cfo' || person.roleCategory === 'finance_manager' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        person.roleCategory === 'ceo' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      )}>
                        {person.roleTitle}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-zinc-900">{person.companyName}</p>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span>{person.districtArea} ({person.sector})</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">CUI: {person.cui} · {person.employeeRange}</p>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={clsx(
                        'px-2.5 py-0.5 rounded-full text-xs font-black font-mono border',
                        person.saveScore < 50 ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        person.saveScore < 65 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border-emerald-200'
                      )}>
                        {person.saveScore}%
                      </span>
                      <span className="text-[9px] text-zinc-500 font-semibold mt-0.5">
                        {person.saveScore < 50 ? '🔴 Critic' : person.saveScore < 65 ? '🟠 Ineficient' : '🟢 Bun'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-[11px] text-zinc-700 leading-snug">
                      {person.keyPainPoints[0]}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {person.topSpendCategories.map((cat, idx) => (
                        <span key={idx} className="bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded text-[9px] font-mono border border-zinc-200">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <p className="font-extrabold text-emerald-600 text-sm">
                      {person.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – {person.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei
                    </p>
                    <p className="text-[10px] text-zinc-500">din OPEX ~{person.estimatedAnnualOpexRon.toLocaleString('ro-RO')} lei</p>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-zinc-600">
                      <a
                        href={person.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                        title="Profil LinkedIn"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={`mailto:${person.email}`}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
                        title={`Email: ${person.email}`}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                      <a
                        href={`tel:${person.phone}`}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                        title={`Telefon: ${person.phone}`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openPitchModal(person)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] py-1.5 px-3 whitespace-nowrap shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      <span>Pitch Personalizat</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-Specific Pitch Modal */}
      {selectedPerson && pitchTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900">
                      Pitch Personalizat pentru {selectedPerson.fullName}
                    </h3>
                    <Badge variant="purple" size="sm">{selectedPerson.roleTitle}</Badge>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    {selectedPerson.companyName} · {selectedPerson.districtArea} · Economie: {selectedPerson.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – {selectedPerson.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei/an
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPerson(null)} 
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
                <span>Cold Email Rol</span>
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
                onClick={() => setActiveTab('linkedin_note')}
                className={clsx(
                  'px-3 py-2 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer',
                  activeTab === 'linkedin_note' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-800'
                )}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>LinkedIn Cerere Conectare</span>
              </button>

              <button
                onClick={() => setActiveTab('linkedin_inmail')}
                className={clsx(
                  'px-3 py-2 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer',
                  activeTab === 'linkedin_inmail' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-zinc-500 hover:text-zinc-800'
                )}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>LinkedIn InMail Complet</span>
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

              {activeTab === 'linkedin_note' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-zinc-500 font-semibold">
                    Notă scurtă pentru cererea de conectare pe LinkedIn (&lt;300 caractere):
                  </p>
                  <div className="relative">
                    <textarea
                      readOnly
                      rows={4}
                      value={pitchTemplates.linkedInConnectionNote}
                      className="w-full text-xs p-3.5 rounded-xl border border-zinc-300 font-sans leading-relaxed bg-zinc-50 text-zinc-800 focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleCopy(pitchTemplates.linkedInConnectionNote)}
                      className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiat!' : 'Copiază Notă'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'linkedin_inmail' && (
                <div className="relative">
                  <textarea
                    readOnly
                    rows={6}
                    value={pitchTemplates.linkedInInMail}
                    className="w-full text-xs p-3.5 rounded-xl border border-zinc-300 font-sans leading-relaxed bg-zinc-50 text-zinc-800 focus:outline-hidden"
                  />
                  <button
                    onClick={() => handleCopy(pitchTemplates.linkedInInMail)}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiat!' : 'Copiază InMail'}</span>
                  </button>
                </div>
              )}

              {/* Executive talking points */}
              <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl space-y-1.5">
                <p className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                  Puncte forte de discuție pentru {selectedPerson.roleTitle}:
                </p>
                {pitchTemplates.executiveTalkingPoints.map((pt, idx) => (
                  <p key={idx} className="text-xs text-purple-900">• {pt}</p>
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
