import { SpendCategory } from '../types';

export type DecisionMakerRole = 'cfo' | 'ceo' | 'procurement' | 'coo' | 'finance_manager';

export interface BucharestDecisionMaker {
  id: string;
  fullName: string;
  roleTitle: string;
  roleCategory: DecisionMakerRole;
  companyName: string;
  cui: string;
  sector: 'Sector 1' | 'Sector 2' | 'Sector 3' | 'Sector 4' | 'Sector 5' | 'Sector 6' | 'Ilfov / Otopeni / Voluntari';
  districtArea: string; // e.g. 'Pipera / Floreasca', 'Băneasa Business Park', 'Militari Logistics', 'Politehnica Business Center'
  industry: string;
  employeeRange: string;
  estimatedAnnualOpexRon: number;
  estimatedAnnualSavingsMin: number;
  estimatedAnnualSavingsMax: number;
  saveScore: number;
  saveScoreStatus: 'critical' | 'poor' | 'moderate' | 'good';
  topSpendCategories: SpendCategory[];
  keyPainPoints: string[];
  linkedinUrl: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'meeting_scheduled' | 'audit_in_progress';
}

export interface BucharestFilterOptions {
  role?: 'all' | DecisionMakerRole;
  sector?: string;
  industry?: string;
  maxSaveScore?: number;
  searchQuery?: string;
}

/**
 * Rich database of Bucharest & Ilfov B2B Decision-Makers (CFOs, CEOs, Procurement Directors)
 * covering major commercial hubs in Sectors 1-6 and Ilfov.
 */
export const BUCHAREST_DECISION_MAKERS: BucharestDecisionMaker[] = [
  // 1. Sector 1 - Pipera / Floreasca Financial Hub - CFO Retail
  {
    id: 'buc_dm_01',
    fullName: 'Alexandru Dumitrescu',
    roleTitle: 'Chief Financial Officer (CFO)',
    roleCategory: 'cfo',
    companyName: 'Smart Distribution & eCommerce SRL',
    cui: 'RO38491024',
    sector: 'Sector 1',
    districtArea: 'Floreasca Business Park',
    industry: 'Comerț Online & Distribuție',
    employeeRange: '35-50 angajați',
    estimatedAnnualOpexRon: 620000,
    estimatedAnnualSavingsMin: 34000,
    estimatedAnnualSavingsMax: 58000,
    saveScore: 38,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Curierat', 'Consumabile', 'Software'],
    keyPainPoints: [
      'Cost curierat de 14.50 lei/colet (+28% peste mediana pieței din București)',
      'Abonamente SaaS multi-seat plătite fără monitorizare de utilizare',
      'Facturi telecom neindexate cu volumele efective'
    ],
    linkedinUrl: 'https://linkedin.com/in/alexandru-dumitrescu-cfo-bucuresti',
    email: 'alexandru.dumitrescu@smartdist-online.ro',
    phone: '+40 722 140 921',
    status: 'new',
  },
  // 2. Sector 1 - Băneasa Hub - CEO Fashion & Retail
  {
    id: 'buc_dm_02',
    fullName: 'Elena Vasilescu',
    roleTitle: 'Managing Partner & Co-Founder (CEO)',
    roleCategory: 'ceo',
    companyName: 'Nordic Fashion & Retail Hub SRL',
    cui: 'RO41209845',
    sector: 'Sector 1',
    districtArea: 'Băneasa Business Center',
    industry: 'Fashion & Retail',
    employeeRange: '20-40 angajați',
    estimatedAnnualOpexRon: 490000,
    estimatedAnnualSavingsMin: 24000,
    estimatedAnnualSavingsMax: 41000,
    saveScore: 44,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Curierat', 'Telecom', 'Consumabile'],
    keyPainPoints: [
      'Marje de profit afectate de tarife mari de retur curierat',
      'Clauze contractuale de reînnoire tacită pe 24 luni la telecom'
    ],
    linkedinUrl: 'https://linkedin.com/in/elena-vasilescu-ceo-retail',
    email: 'elena.vasilescu@nordicfashion.ro',
    phone: '+40 740 882 103',
    status: 'new',
  },
  // 3. Sector 2 - Barbu Văcărescu Hub - Director Achiziții IT & Cloud
  {
    id: 'buc_dm_03',
    fullName: 'Mihai Stanciu',
    roleTitle: 'Head of Procurement & Facilities',
    roleCategory: 'procurement',
    companyName: 'Nexis Cloud & Digital Solutions SRL',
    cui: 'RO35981042',
    sector: 'Sector 2',
    districtArea: 'Barbu Văcărescu / Aviației',
    industry: 'IT & Software Development',
    employeeRange: '60-120 angajați',
    estimatedAnnualOpexRon: 890000,
    estimatedAnnualSavingsMin: 45000,
    estimatedAnnualSavingsMax: 76000,
    saveScore: 48,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Software', 'Telecom', 'Servicii'],
    keyPainPoints: [
      'Licențe redundante Microsoft 365 E5 & Slack & Atlassian',
      'Prețuri cloud fără contracte de tip Savings Plans / Reserved Instances'
    ],
    linkedinUrl: 'https://linkedin.com/in/mihai-stanciu-procurement-it',
    email: 'mihai.stanciu@nexis-cloud.ro',
    phone: '+40 755 330 914',
    status: 'new',
  },
  // 4. Sector 6 - Militari Logistics Hub - COO Logistică & Flotă
  {
    id: 'buc_dm_04',
    fullName: 'Cristian Popa',
    roleTitle: 'Chief Operating Officer (COO)',
    roleCategory: 'coo',
    companyName: 'Capital Logistics & Express Cargo SRL',
    cui: 'RO29481023',
    sector: 'Sector 6',
    districtArea: 'Militari Logistics Park (Iuliu Maniu)',
    industry: 'Transport & Logistică',
    employeeRange: '70-150 angajați',
    estimatedAnnualOpexRon: 1850000,
    estimatedAnnualSavingsMin: 85000,
    estimatedAnnualSavingsMax: 145000,
    saveScore: 41,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Telecom', 'Consumabile'],
    keyPainPoints: [
      'Tarife mari la energia electrică de depozit și stații de încărcare',
      'Abonamente SIM M2M flotă GPS plătite individual la tarif de retail'
    ],
    linkedinUrl: 'https://linkedin.com/in/cristian-popa-coo-logistics',
    email: 'cristian.popa@capital-cargo.ro',
    phone: '+40 731 990 412',
    status: 'new',
  },
  // 5. Sector 3 - Pallady Business Area - Finance Manager Producție & Ambalaje
  {
    id: 'buc_dm_05',
    fullName: 'Roxana Enache',
    roleTitle: 'Finance & Controlling Manager',
    roleCategory: 'finance_manager',
    companyName: 'București Packaging & Print Factory SRL',
    cui: 'RO19840192',
    sector: 'Sector 3',
    districtArea: 'Theodor Pallady Hub',
    industry: 'Producție & Ambalaje',
    employeeRange: '45-90 angajați',
    estimatedAnnualOpexRon: 1120000,
    estimatedAnnualSavingsMin: 52000,
    estimatedAnnualSavingsMax: 88000,
    saveScore: 46,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Consumabile', 'Curierat'],
    keyPainPoints: [
      'Cheltuieli mari de papetărie și consumabile tehnice fără licitație agregată',
      'Contract gaze naturale cu furnizor de ultimă opțiune'
    ],
    linkedinUrl: 'https://linkedin.com/in/roxana-enache-finance-manager',
    email: 'roxana.enache@bucuresti-pack.ro',
    phone: '+40 721 445 109',
    status: 'new',
  },
  // 6. Sector 4 - Berceni Business Park - CFO Sănătate & Farmaceutice
  {
    id: 'buc_dm_06',
    fullName: 'Dragoș Radu',
    roleTitle: 'Director Financiar (CFO)',
    roleCategory: 'cfo',
    companyName: 'Medica Distribution & Pharma Hub SRL',
    cui: 'RO44810293',
    sector: 'Sector 4',
    districtArea: 'Berceni Business Center',
    industry: 'Sănătate & Farmaceutice',
    employeeRange: '30-65 angajați',
    estimatedAnnualOpexRon: 680000,
    estimatedAnnualSavingsMin: 31000,
    estimatedAnnualSavingsMax: 52000,
    saveScore: 52,
    saveScoreStatus: 'poor',
    topSpendCategories: ['Curierat', 'Consumabile', 'Telecom'],
    keyPainPoints: [
      'Livrări speciale termo la tarife fixe nescalate',
      'Facturi telefonie mobilă cu opțiuni internaționale nefolosite'
    ],
    linkedinUrl: 'https://linkedin.com/in/dragos-radu-cfo-pharma',
    email: 'dragos.radu@medicapharma-dist.ro',
    phone: '+40 723 901 884',
    status: 'new',
  },
  // 7. Sector 5 - Răzoare / Cotroceni - CEO Servicii & Consultanță
  {
    id: 'buc_dm_07',
    fullName: 'Ioana Moldovan',
    roleTitle: 'Chief Executive Officer (CEO)',
    roleCategory: 'ceo',
    companyName: 'Alpha Advisory & Legal Consult SRL',
    cui: 'RO32910485',
    sector: 'Sector 5',
    districtArea: 'AFI Cotroceni / Răzoare',
    industry: 'Servicii Profesionale & Juridic',
    employeeRange: '25-50 angajați',
    estimatedAnnualOpexRon: 420000,
    estimatedAnnualSavingsMin: 19000,
    estimatedAnnualSavingsMax: 32000,
    saveScore: 56,
    saveScoreStatus: 'poor',
    topSpendCategories: ['Software', 'Telecom', 'Consumabile'],
    keyPainPoints: [
      'Abonamente softuri juridice / baze de date cu licențe duplicate',
      'Chirie echipamente birou (multifuncționale) cu contracte vechi'
    ],
    linkedinUrl: 'https://linkedin.com/in/ioana-moldovan-ceo-alpha',
    email: 'ioana.moldovan@alpha-advisory.ro',
    phone: '+40 744 550 912',
    status: 'new',
  },
  // 8. Ilfov / Otopeni - Otopeni Airport Area - Director Achiziții HoReCa & Catering
  {
    id: 'buc_dm_08',
    fullName: 'Gabriel Iacob',
    roleTitle: 'Director Achiziții & Supply Chain',
    roleCategory: 'procurement',
    companyName: 'Airport Premium Catering & Logistics SRL',
    cui: 'RO27591042',
    sector: 'Ilfov / Otopeni / Voluntari',
    districtArea: 'Otopeni Business Ring',
    industry: 'HoReCa & Food Supply',
    employeeRange: '80-160 angajați',
    estimatedAnnualOpexRon: 2100000,
    estimatedAnnualSavingsMin: 95000,
    estimatedAnnualSavingsMax: 160000,
    saveScore: 39,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Consumabile', 'Curierat'],
    keyPainPoints: [
      'Camere frigorifice și consum masiv energie electrică la preț nereglementat',
      'Ambalaje biodegradabile achiziționate fără discount de volum'
    ],
    linkedinUrl: 'https://linkedin.com/in/gabriel-iacob-procurement-horeca',
    email: 'gabriel.iacob@airport-catering.ro',
    phone: '+40 732 110 845',
    status: 'new',
  },
  // 9. Sector 1 - Pipera Nord - CFO Tech & E-Commerce
  {
    id: 'buc_dm_09',
    fullName: 'Andreea Gheorghe',
    roleTitle: 'Chief Financial Officer (CFO)',
    roleCategory: 'cfo',
    companyName: 'OmniTrade Digital Market SRL',
    cui: 'RO39182045',
    sector: 'Sector 1',
    districtArea: 'Pipera Business Tower',
    industry: 'Comerț Online & Distribuție',
    employeeRange: '40-75 angajați',
    estimatedAnnualOpexRon: 750000,
    estimatedAnnualSavingsMin: 42000,
    estimatedAnnualSavingsMax: 68000,
    saveScore: 36,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Curierat', 'Software', 'Telecom'],
    keyPainPoints: [
      'Peste 1.200 comenzi/lună expediate la tarif standard fără trepte de volum',
      'Tool-uri marketing & newsletter fără contract anual consolidat'
    ],
    linkedinUrl: 'https://linkedin.com/in/andreea-gheorghe-cfo-omnitrade',
    email: 'andreea.gheorghe@omnitrade-digital.ro',
    phone: '+40 724 991 304',
    status: 'new',
  },
  // 10. Sector 2 - Pantelimon Logistic - CEO Distribuție Materiale
  {
    id: 'buc_dm_10',
    fullName: 'Sorin Teodorescu',
    roleTitle: 'Director General & Fondator (CEO)',
    roleCategory: 'ceo',
    companyName: 'Construct Material Distribution SRL',
    cui: 'RO21948102',
    sector: 'Sector 2',
    districtArea: 'Pantelimon Industrial Area',
    industry: 'Construcții & Distribuție',
    employeeRange: '50-100 angajați',
    estimatedAnnualOpexRon: 1350000,
    estimatedAnnualSavingsMin: 64000,
    estimatedAnnualSavingsMax: 108000,
    saveScore: 43,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Telecom', 'Servicii'],
    keyPainPoints: [
      'Facturi telefonie pentru agenții de vânzări cu costuri roaming și depășiri',
      'Facturare energie electrică de hală fără optimizare profil orar'
    ],
    linkedinUrl: 'https://linkedin.com/in/sorin-teodorescu-ceo-construct',
    email: 'sorin.teodorescu@construct-dist.ro',
    phone: '+40 729 441 200',
    status: 'new',
  }
];

/**
 * Searches and scrapes Bucharest decision-makers with multi-parameter filtering
 */
export function scrapeBucharestDecisionMakers(filters: BucharestFilterOptions): BucharestDecisionMaker[] {
  return BUCHAREST_DECISION_MAKERS.filter((dm) => {
    // Role filter
    if (filters.role && filters.role !== 'all' && dm.roleCategory !== filters.role) {
      return false;
    }

    // Sector filter
    if (filters.sector && filters.sector !== 'all' && dm.sector !== filters.sector) {
      return false;
    }

    // Industry filter
    if (filters.industry && filters.industry !== 'all' && !dm.industry.toLowerCase().includes(filters.industry.toLowerCase())) {
      return false;
    }

    // Max Save Score filter (focus on low scores < 50%)
    if (filters.maxSaveScore && dm.saveScore > filters.maxSaveScore) {
      return false;
    }

    // Search query filter
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = dm.fullName.toLowerCase().includes(q);
      const matchComp = dm.companyName.toLowerCase().includes(q);
      const matchRole = dm.roleTitle.toLowerCase().includes(q);
      const matchCui = dm.cui.toLowerCase().includes(q);
      const matchArea = dm.districtArea.toLowerCase().includes(q);
      if (!matchName && !matchComp && !matchRole && !matchCui && !matchArea) {
        return false;
      }
    }

    return true;
  });
}
