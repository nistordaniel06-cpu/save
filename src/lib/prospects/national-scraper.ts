import { SpendCategory } from '../types';

export type EntityType = 'juridica' | 'fizica_profesie_liberala';

export type RomanianRegion = 
  | 'București-Ilfov'
  | 'Transilvania'
  | 'Moldova'
  | 'Muntenia'
  | 'Oltenia'
  | 'Banat'
  | 'Crișana'
  | 'Dobrogea';

export interface NationalLead {
  id: string;
  entityType: EntityType;
  entityTypeLabel: string; // 'SRL / SA (Persoană Juridică)' vs 'PFA / Profesie Liberală (Persoană Fizică)'
  name: string; // Nume firmă sau Nume Cabinet/Persoană
  decisionMakerName: string;
  roleTitle: string;
  cuiOrFiscalId: string;
  city: string;
  county: string; // Județ
  region: RomanianRegion;
  industry: string;
  sizeOrStaffRange: string;
  estimatedAnnualOpexRon: number;
  estimatedAnnualSavingsMin: number;
  estimatedAnnualSavingsMax: number;
  saveScore: number; // 0 - 100 (Scor mic = Eficiență scăzută, risipă mare)
  saveScoreStatus: 'critical' | 'poor' | 'moderate' | 'good';
  topSpendCategories: SpendCategory[];
  criticalCostLeaks: string[];
  email: string;
  phone: string;
  websiteOrLinkedIn: string;
  status: 'new' | 'contacted' | 'audit_in_progress' | 'client';
}

export interface NationalFilterOptions {
  entityType?: 'all' | EntityType;
  county?: string;
  region?: 'all' | RomanianRegion;
  industry?: string;
  scoreFilter?: 'all' | 'critical' | 'poor' | 'moderate' | 'good';
  searchQuery?: string;
}

export const ROMANIAN_COUNTIES = [
  'Toate Județele',
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov', 'Brăila',
  'București', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița',
  'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov',
  'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu',
  'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea'
];

/**
 * Master Database covering ALL ROMANIA (Persoane Juridice + Persoane Fizice / Profesii Liberale)
 */
export const NATIONAL_LEADS_DATABASE: NationalLead[] = [
  // ==========================================
  // 1. PERSOANE JURIDICE (SRL / SA) - TOATĂ ROMÂNIA
  // ==========================================
  {
    id: 'ro_pj_01',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Smart Distribution & eCommerce SRL',
    decisionMakerName: 'Alexandru Dumitrescu',
    roleTitle: 'Chief Financial Officer (CFO)',
    cuiOrFiscalId: 'RO38491024',
    city: 'București',
    county: 'București',
    region: 'București-Ilfov',
    industry: 'Comerț Online & Distribuție',
    sizeOrStaffRange: '35-50 angajați',
    estimatedAnnualOpexRon: 620000,
    estimatedAnnualSavingsMin: 34000,
    estimatedAnnualSavingsMax: 58000,
    saveScore: 38,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Curierat', 'Consumabile', 'Software'],
    criticalCostLeaks: [
      'Curierat la 14.50 lei/colet (+28% peste mediana pieței)',
      'Contracte telecom cu reînnoire tacită nesupravegheată'
    ],
    email: 'alexandru.dumitrescu@smartdist-online.ro',
    phone: '+40 722 140 921',
    websiteOrLinkedIn: 'https://linkedin.com/in/alexandru-dumitrescu-cfo',
    status: 'new',
  },
  {
    id: 'ro_pj_02',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Nordic Fashion & Retail Group SRL',
    decisionMakerName: 'Elena Vasilescu',
    roleTitle: 'Director General (CEO)',
    cuiOrFiscalId: 'RO41209845',
    city: 'Cluj-Napoca',
    county: 'Cluj',
    region: 'Transilvania',
    industry: 'Fashion & Retail',
    sizeOrStaffRange: '20-40 angajați',
    estimatedAnnualOpexRon: 490000,
    estimatedAnnualSavingsMin: 24000,
    estimatedAnnualSavingsMax: 41000,
    saveScore: 44,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Curierat', 'Telecom', 'Consumabile'],
    criticalCostLeaks: [
      'Cost retur curierat neoptimizat pe volum național',
      'Abonamente telecom cu tarife vechi din 2023'
    ],
    email: 'elena.vasilescu@nordicfashion.ro',
    phone: '+40 740 882 103',
    websiteOrLinkedIn: 'https://linkedin.com/in/elena-vasilescu-retail',
    status: 'new',
  },
  {
    id: 'ro_pj_03',
    entityType: 'juridica',
    entityTypeLabel: 'SA (Persoană Juridică)',
    name: 'Transilvania Logistic & Express SA',
    decisionMakerName: 'Cristian Popa',
    roleTitle: 'Chief Operating Officer (COO)',
    cuiOrFiscalId: 'RO29481023',
    city: 'Timișoara',
    county: 'Timiș',
    region: 'Banat',
    industry: 'Transport & Logistică',
    sizeOrStaffRange: '70-150 angajați',
    estimatedAnnualOpexRon: 1850000,
    estimatedAnnualSavingsMin: 85000,
    estimatedAnnualSavingsMax: 145000,
    saveScore: 41,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Telecom', 'Consumabile'],
    criticalCostLeaks: [
      'Energie electrică depozite la tarif de vârf nereglementat',
      'Abonamente flotă M2M fără agregare comercială'
    ],
    email: 'cristian.popa@capital-cargo.ro',
    phone: '+40 731 990 412',
    websiteOrLinkedIn: 'https://linkedin.com/in/cristian-popa-coo',
    status: 'new',
  },
  {
    id: 'ro_pj_04',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Moldova Software & Cloud Solutions SRL',
    decisionMakerName: 'Mihai Stanciu',
    roleTitle: 'Head of Procurement & IT',
    cuiOrFiscalId: 'RO35981042',
    city: 'Iași',
    county: 'Iași',
    region: 'Moldova',
    industry: 'IT & Software',
    sizeOrStaffRange: '50-100 angajați',
    estimatedAnnualOpexRon: 920000,
    estimatedAnnualSavingsMin: 46000,
    estimatedAnnualSavingsMax: 78000,
    saveScore: 48,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Software', 'Telecom', 'Servicii'],
    criticalCostLeaks: [
      'Licențe SaaS multi-seat plătite fără audit de utilizare activă',
      'Facturi cloud fără angajament de rezervare (Savings Plans)'
    ],
    email: 'mihai.stanciu@apexcloud.ro',
    phone: '+40 755 330 914',
    websiteOrLinkedIn: 'https://linkedin.com/in/mihai-stanciu-procurement',
    status: 'new',
  },
  {
    id: 'ro_pj_05',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'EuroPrint & Packaging Brașov SRL',
    decisionMakerName: 'Roxana Enache',
    roleTitle: 'Finance & Controlling Manager',
    cuiOrFiscalId: 'RO19840192',
    city: 'Brașov',
    county: 'Brașov',
    region: 'Transilvania',
    industry: 'Producție & Ambalaje',
    sizeOrStaffRange: '45-90 angajați',
    estimatedAnnualOpexRon: 1120000,
    estimatedAnnualSavingsMin: 52000,
    estimatedAnnualSavingsMax: 88000,
    saveScore: 46,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Consumabile', 'Curierat'],
    criticalCostLeaks: [
      'Consumabile tehnice și birotică birou fără licitație agregată',
      'Tarife mari la gazele naturale industriale'
    ],
    email: 'roxana.enache@bucuresti-pack.ro',
    phone: '+40 721 445 109',
    websiteOrLinkedIn: 'https://linkedin.com/in/roxana-enache-finance',
    status: 'new',
  },
  {
    id: 'ro_pj_06',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Danubius Marine & Logistics Constanța SRL',
    decisionMakerName: 'Dan Ionescu',
    roleTitle: 'Director General (CEO)',
    cuiOrFiscalId: 'RO32910485',
    city: 'Constanța',
    county: 'Constanța',
    region: 'Dobrogea',
    industry: 'Transport Maritim & Logistică',
    sizeOrStaffRange: '60-120 angajați',
    estimatedAnnualOpexRon: 1650000,
    estimatedAnnualSavingsMin: 78000,
    estimatedAnnualSavingsMax: 135000,
    saveScore: 45,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Telecom', 'Servicii'],
    criticalCostLeaks: [
      'Telefonie satelitară și mobilă cu opțiuni roaming supraevaluate',
      'Energie electrică dane portuare fără plafonare negociată'
    ],
    email: 'dan.ionescu@danubius-marine.ro',
    phone: '+40 744 550 912',
    websiteOrLinkedIn: 'https://linkedin.com/in/dan-ionescu-ceo-constanta',
    status: 'new',
  },
  {
    id: 'ro_pj_07',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Prahova Industrial Engineering & Parts SRL',
    decisionMakerName: 'Radu Marinescu',
    roleTitle: 'Chief Financial Officer (CFO)',
    cuiOrFiscalId: 'RO33910842',
    city: 'Ploiești',
    county: 'Prahova',
    region: 'Muntenia',
    industry: 'Inginerie & Echipamente Industriale',
    sizeOrStaffRange: '50-110 angajați',
    estimatedAnnualOpexRon: 1420000,
    estimatedAnnualSavingsMin: 68000,
    estimatedAnnualSavingsMax: 115000,
    saveScore: 43,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Consumabile', 'Telecom'],
    criticalCostLeaks: [
      'Gaze naturale și energie la tarif de furnizor implicit',
      'Cheltuieli curierat piese grele fără grilă de volum'
    ],
    email: 'radu.marinescu@prahova-eng.ro',
    phone: '+40 728 331 409',
    websiteOrLinkedIn: 'https://linkedin.com/in/radu-marinescu-cfo-ploiesti',
    status: 'new',
  },
  {
    id: 'ro_pj_08',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Crișana Agribusiness & Cereale SRL',
    decisionMakerName: 'Vasile Popescu',
    roleTitle: 'Director General & Fondator (CEO)',
    cuiOrFiscalId: 'RO28491024',
    city: 'Oradea',
    county: 'Bihor',
    region: 'Crișana',
    industry: 'Agricultură & Comerț',
    sizeOrStaffRange: '30-70 angajați',
    estimatedAnnualOpexRon: 1100000,
    estimatedAnnualSavingsMin: 49000,
    estimatedAnnualSavingsMax: 84000,
    saveScore: 47,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Telecom', 'Consumabile'],
    criticalCostLeaks: [
      'Abonamente telecom flotă utilaje fără discount de grup',
      'Consumabile industriale birou & silozuri fără contract cadru'
    ],
    email: 'vasile.popescu@crisana-agro.ro',
    phone: '+40 730 881 204',
    websiteOrLinkedIn: 'https://linkedin.com/in/vasile-popescu-oradea',
    status: 'new',
  },

  // ==========================================
  // 2. PERSOANE FIZICE / PROFESII LIBERALE / PFA
  // ==========================================
  {
    id: 'ro_pf_01',
    entityType: 'fizica_profesie_liberala',
    entityTypeLabel: 'Cabinet Medical Individual (Persoană Fizică / Profesie Liberală)',
    name: 'Cabinet Medical Stomatologic Dr. Andrei Mureșan',
    decisionMakerName: 'Dr. Andrei Mureșan',
    roleTitle: 'Medic Titular & Administrator',
    cuiOrFiscalId: 'RO21498102',
    city: 'Cluj-Napoca',
    county: 'Cluj',
    region: 'Transilvania',
    industry: 'Sănătate & Medicină Dentară',
    sizeOrStaffRange: '6-12 angajați',
    estimatedAnnualOpexRon: 185000,
    estimatedAnnualSavingsMin: 14000,
    estimatedAnnualSavingsMax: 24000,
    saveScore: 42,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Consumabile', 'Software', 'Energie'],
    criticalCostLeaks: [
      'Consumabile medicale și birotică cumpărate la preț de listă fără discount P25',
      'Abonamente soft gestiune clinică & imagistică plătite lunar cu suprataxă'
    ],
    email: 'dr.andrei.muresan@clinicadent-cluj.ro',
    phone: '+40 742 990 114',
    websiteOrLinkedIn: 'www.clinicadent-cluj.ro',
    status: 'new',
  },
  {
    id: 'ro_pf_02',
    entityType: 'fizica_profesie_liberala',
    entityTypeLabel: 'Societate Civilă Profesională de Avocați (Persoană Fizică / Profesie)',
    name: 'Ionescu, Popa & Asociații — Societate Civilă de Avocați',
    decisionMakerName: 'Av. Corina Ionescu',
    roleTitle: 'Avocat Coordonator & Partener Fondator',
    cuiOrFiscalId: 'RO18491024',
    city: 'București',
    county: 'București',
    region: 'București-Ilfov',
    industry: 'Servicii Juridice & Avocatură',
    sizeOrStaffRange: '10-25 colaboratori',
    estimatedAnnualOpexRon: 290000,
    estimatedAnnualSavingsMin: 22000,
    estimatedAnnualSavingsMax: 38000,
    saveScore: 45,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Software', 'Telecom', 'Consumabile'],
    criticalCostLeaks: [
      'Baze de date legislative (Indaco/Wolters Kluwer) cu licențe individuale neconsolidate',
      'Facturi telefonie mobilă cu opțiuni internaționale neoptimizate'
    ],
    email: 'corina.ionescu@avocati-ionescupopa.ro',
    phone: '+40 721 884 902',
    websiteOrLinkedIn: 'https://linkedin.com/in/corina-ionescu-avocat',
    status: 'new',
  },
  {
    id: 'ro_pf_03',
    entityType: 'fizica_profesie_liberala',
    entityTypeLabel: 'Birou Individual de Arhitectură (Persoană Fizică / Profesie)',
    name: 'Arhitectura & Design Studio — BIA Vlad Câmpean',
    decisionMakerName: 'Arh. Vlad Câmpean',
    roleTitle: 'Arhitect Șef & Titular Birou',
    cuiOrFiscalId: 'RO32491084',
    city: 'Timișoara',
    county: 'Timiș',
    region: 'Banat',
    industry: 'Arhitectură & Proiectare',
    sizeOrStaffRange: '5-10 colaboratori',
    estimatedAnnualOpexRon: 160000,
    estimatedAnnualSavingsMin: 12500,
    estimatedAnnualSavingsMax: 21000,
    saveScore: 48,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Software', 'Consumabile', 'Telecom'],
    criticalCostLeaks: [
      'Licențe Autodesk / Adobe plătite lunar în loc de acord anual negociat',
      'Servicii de printare & plotare planșe fără contract de abonament'
    ],
    email: 'vlad.campean@arhitectura-studio.ro',
    phone: '+40 733 440 918',
    websiteOrLinkedIn: 'www.arhitectura-studio.ro',
    status: 'new',
  },
  {
    id: 'ro_pf_04',
    entityType: 'fizica_profesie_liberala',
    entityTypeLabel: 'Persoană Fizică Autorizată (PFA / Consultanță B2B)',
    name: 'PFA Mihai Gheorghe — IT Architecture & Cloud Consultant',
    decisionMakerName: 'Mihai Gheorghe',
    roleTitle: 'Consultant IT & Cloud Architect',
    cuiOrFiscalId: 'RO41928401',
    city: 'Iași',
    county: 'Iași',
    region: 'Moldova',
    industry: 'IT & Servicii Profesionale',
    sizeOrStaffRange: '1-4 colaboratori',
    estimatedAnnualOpexRon: 95000,
    estimatedAnnualSavingsMin: 8500,
    estimatedAnnualSavingsMax: 15000,
    saveScore: 49,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Software', 'Telecom', 'Consumabile'],
    criticalCostLeaks: [
      'Unelte cloud testing & servere plătite on-demand fără instanțe rezervate',
      'Abonament date nelimitat la tarif de consumator persoană fizică'
    ],
    email: 'contact@mihaigheorghe-it.ro',
    phone: '+40 751 220 849',
    websiteOrLinkedIn: 'https://linkedin.com/in/mihai-gheorghe-cloud',
    status: 'new',
  },
  {
    id: 'ro_pf_05',
    entityType: 'fizica_profesie_liberala',
    entityTypeLabel: 'Cabinet Medical Individual (Persoană Fizică / Profesie)',
    name: 'Clinica Medicală & Diagnostic Dr. Simona Radu',
    decisionMakerName: 'Dr. Simona Radu',
    roleTitle: 'Medic Primar & Fondator Cabinet',
    cuiOrFiscalId: 'RO26481029',
    city: 'Sibiu',
    county: 'Sibiu',
    region: 'Transilvania',
    industry: 'Sănătate & Diagnostic Medical',
    sizeOrStaffRange: '8-15 angajați',
    estimatedAnnualOpexRon: 210000,
    estimatedAnnualSavingsMin: 16000,
    estimatedAnnualSavingsMax: 28000,
    saveScore: 44,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Consumabile', 'Curierat'],
    criticalCostLeaks: [
      'Energie electrică aparatură imagistică la tarif standard de furnizor',
      'Curierat probe laborator necontractat pe grilă de volum'
    ],
    email: 'dr.simona.radu@clinicamed-sibiu.ro',
    phone: '+40 745 110 882',
    websiteOrLinkedIn: 'www.clinicamed-sibiu.ro',
    status: 'new',
  },
  {
    id: 'ro_pf_06',
    entityType: 'fizica_profesie_liberala',
    entityTypeLabel: 'Birou Notarial (Persoană Fizică / Profesie Liberală)',
    name: 'Biroul Notarial Notar Public Marian Dumitrache',
    decisionMakerName: 'Notar Marian Dumitrache',
    roleTitle: 'Notar Public Coordonator',
    cuiOrFiscalId: 'RO17491024',
    city: 'Craiova',
    county: 'Dolj',
    region: 'Oltenia',
    industry: 'Servicii Notariale & Juridice',
    sizeOrStaffRange: '6-12 angajați',
    estimatedAnnualOpexRon: 175000,
    estimatedAnnualSavingsMin: 13500,
    estimatedAnnualSavingsMax: 23000,
    saveScore: 46,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Consumabile', 'Software', 'Telecom'],
    criticalCostLeaks: [
      'Hârtie securizată, tonere și arhivare fizică fără contract de discount',
      'Centrală telefonică fixă/mobilă cu costuri mari de mentenanță'
    ],
    email: 'notariat.dumitrache@notari-dolj.ro',
    phone: '+40 722 554 901',
    websiteOrLinkedIn: 'www.notariat-craiova.ro',
    status: 'new',
  }
];

/**
 * Searches and filters national leads (Persoane Juridice + Persoane Fizice / Profesii Liberale)
 */
export function scrapeNationalLeads(filters: NationalFilterOptions): NationalLead[] {
  return NATIONAL_LEADS_DATABASE.filter((lead) => {
    // Entity type filter (juridica vs fizica)
    if (filters.entityType && filters.entityType !== 'all' && lead.entityType !== filters.entityType) {
      return false;
    }

    // County filter
    if (filters.county && filters.county !== 'Toate Județele' && filters.county !== 'all' && lead.county.toLowerCase() !== filters.county.toLowerCase()) {
      return false;
    }

    // Region filter
    if (filters.region && filters.region !== 'all' && lead.region !== filters.region) {
      return false;
    }

    // Industry filter
    if (filters.industry && filters.industry !== 'all' && !lead.industry.toLowerCase().includes(filters.industry.toLowerCase())) {
      return false;
    }

    // Score filter
    if (filters.scoreFilter && filters.scoreFilter !== 'all') {
      if (filters.scoreFilter === 'critical' && lead.saveScore >= 50) return false;
      if (filters.scoreFilter === 'poor' && (lead.saveScore < 50 || lead.saveScore >= 65)) return false;
      if (filters.scoreFilter === 'moderate' && (lead.saveScore < 65 || lead.saveScore >= 75)) return false;
      if (filters.scoreFilter === 'good' && lead.saveScore < 75) return false;
    }

    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchDm = lead.decisionMakerName.toLowerCase().includes(q);
      const matchCity = lead.city.toLowerCase().includes(q);
      const matchCounty = lead.county.toLowerCase().includes(q);
      const matchCui = lead.cuiOrFiscalId.toLowerCase().includes(q);
      const matchIndustry = lead.industry.toLowerCase().includes(q);
      if (!matchName && !matchDm && !matchCity && !matchCounty && !matchCui && !matchIndustry) {
        return false;
      }
    }

    return true;
  });
}
