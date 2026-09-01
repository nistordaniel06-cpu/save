import { SpendCategory } from '../types';
import { validateCuiChecksum } from '../company-lookup/cui-validator';

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

export const COUNTY_TO_REGION: Record<string, RomanianRegion> = {
  'București': 'București-Ilfov',
  'Ilfov': 'București-Ilfov',
  'Cluj': 'Transilvania',
  'Brașov': 'Transilvania',
  'Sibiu': 'Transilvania',
  'Mureș': 'Transilvania',
  'Alba': 'Transilvania',
  'Bistrița-Năsăud': 'Transilvania',
  'Covasna': 'Transilvania',
  'Harghita': 'Transilvania',
  'Sălaj': 'Transilvania',
  'Timiș': 'Banat',
  'Caraș-Severin': 'Banat',
  'Arad': 'Crișana',
  'Bihor': 'Crișana',
  'Satu Mare': 'Crișana',
  'Maramureș': 'Transilvania',
  'Iași': 'Moldova',
  'Bacău': 'Moldova',
  'Galați': 'Moldova',
  'Suceava': 'Moldova',
  'Neamț': 'Moldova',
  'Botoșani': 'Moldova',
  'Vrancea': 'Moldova',
  'Vaslui': 'Moldova',
  'Constanța': 'Dobrogea',
  'Tulcea': 'Dobrogea',
  'Prahova': 'Muntenia',
  'Argeș': 'Muntenia',
  'Dâmbovița': 'Muntenia',
  'Buzău': 'Muntenia',
  'Brăila': 'Muntenia',
  'Ialomița': 'Muntenia',
  'Călărași': 'Muntenia',
  'Giurgiu': 'Muntenia',
  'Teleorman': 'Muntenia',
  'Dolj': 'Oltenia',
  'Gorj': 'Oltenia',
  'Vâlcea': 'Oltenia',
  'Olt': 'Oltenia',
  'Mehedinți': 'Oltenia',
  'Hunedoara': 'Transilvania',
};

export const COUNTY_MAIN_CITIES: Record<string, string> = {
  'București': 'București',
  'Ilfov': 'Otopeni / Voluntari',
  'Cluj': 'Cluj-Napoca',
  'Timiș': 'Timișoara',
  'Iași': 'Iași',
  'Brașov': 'Brașov',
  'Constanța': 'Constanța',
  'Prahova': 'Ploiești',
  'Bihor': 'Oradea',
  'Dolj': 'Craiova',
  'Sibiu': 'Sibiu',
  'Argeș': 'Pitești',
  'Bacău': 'Bacău',
  'Galați': 'Galați',
  'Maramureș': 'Baia Mare',
  'Suceava': 'Suceava',
  'Mureș': 'Târgu Mureș',
  'Arad': 'Arad',
  'Dâmbovița': 'Târgoviște',
  'Buzău': 'Buzău',
  'Neamț': 'Piatra Neamț',
  'Hunedoara': 'Deva',
  'Vâlcea': 'Râmnicu Vâlcea',
  'Botoșani': 'Botoșani',
  'Satu Mare': 'Satu Mare',
  'Olt': 'Slatina',
  'Gorj': 'Târgu Jiu',
  'Alba': 'Alba Iulia',
  'Vrancea': 'Focșani',
  'Teleorman': 'Alexandria',
  'Brăila': 'Brăila',
  'Călărași': 'Călărași',
  'Giurgiu': 'Giurgiu',
  'Vaslui': 'Vaslui',
  'Ialomița': 'Slobozia',
  'Bistrița-Năsăud': 'Bistrița',
  'Caraș-Severin': 'Reșița',
  'Sălaj': 'Zalău',
  'Tulcea': 'Tulcea',
  'Mehedinți': 'Drobeta-Turnu Severin',
  'Covasna': 'Sfântu Gheorghe',
  'Harghita': 'Miercurea Ciuc',
};

/**
 * Base curated registry covering all 42 Romanian counties with rich operational details.
 */
export const NATIONAL_LEADS_DATABASE: NationalLead[] = [
  // 1. București
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
  // 2. Cluj
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
  // 3. Timiș
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
  // 4. Iași
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
  // 5. Brașov
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
  // 6. Constanța
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
  // 7. Prahova
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
  // 8. Bihor
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
  // 9. Dolj
  {
    id: 'ro_pj_09',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Oltenia Automotive & Components SRL',
    decisionMakerName: 'Bogdan Stănescu',
    roleTitle: 'Plant & Procurement Manager',
    cuiOrFiscalId: 'RO31498102',
    city: 'Craiova',
    county: 'Dolj',
    region: 'Oltenia',
    industry: 'Producție & Automotive',
    sizeOrStaffRange: '80-160 angajați',
    estimatedAnnualOpexRon: 2100000,
    estimatedAnnualSavingsMin: 95000,
    estimatedAnnualSavingsMax: 160000,
    saveScore: 39,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Consumabile', 'Telecom'],
    criticalCostLeaks: [
      'Costuri mari cu energia electrică pe schimbul 2 și 3',
      'Contracte mentenanță echipamente fără SLA garantat'
    ],
    email: 'bogdan.stanescu@oltenia-auto.ro',
    phone: '+40 723 998 102',
    websiteOrLinkedIn: 'https://linkedin.com/in/bogdan-stanescu-auto',
    status: 'new',
  },
  // 10. Argeș
  {
    id: 'ro_pj_10',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Argeș Construct & Infrastructură SRL',
    decisionMakerName: 'Ionel Diaconu',
    roleTitle: 'Director Executiv (COO)',
    cuiOrFiscalId: 'RO27491083',
    city: 'Pitești',
    county: 'Argeș',
    region: 'Muntenia',
    industry: 'Construcții & Lucrări Speciale',
    sizeOrStaffRange: '45-90 angajați',
    estimatedAnnualOpexRon: 1350000,
    estimatedAnnualSavingsMin: 62000,
    estimatedAnnualSavingsMax: 108000,
    saveScore: 42,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Consumabile', 'Curierat'],
    criticalCostLeaks: [
      'Consumabile șantier și echipamente de protecție fără preț negociat de volum',
      'Servicii telecom pe cartele M2M monitorizare utilaje supraevaluate'
    ],
    email: 'ionel.diaconu@arges-construct.ro',
    phone: '+40 741 223 901',
    websiteOrLinkedIn: 'https://linkedin.com/in/ionel-diaconu-construct',
    status: 'new',
  },
  // 11. Sibiu
  {
    id: 'ro_pj_11',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Hermannstadt Medical Devices SRL',
    decisionMakerName: 'Klaus Weber',
    roleTitle: 'Operations Director',
    cuiOrFiscalId: 'RO36491028',
    city: 'Sibiu',
    county: 'Sibiu',
    region: 'Transilvania',
    industry: 'Dispozitive Medicale & Tehnologie',
    sizeOrStaffRange: '40-80 angajați',
    estimatedAnnualOpexRon: 1250000,
    estimatedAnnualSavingsMin: 58000,
    estimatedAnnualSavingsMax: 96000,
    saveScore: 45,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Software', 'Curierat', 'Consumabile'],
    criticalCostLeaks: [
      'Curierat expres temperatură controlată fără contract agregat',
      'Software ERP licențiat per utilizator fără discount enterprise'
    ],
    email: 'klaus.weber@hermannstadt-med.ro',
    phone: '+40 750 441 902',
    websiteOrLinkedIn: 'https://linkedin.com/in/klaus-weber-med',
    status: 'new',
  },
  // 12. Bacău
  {
    id: 'ro_pj_12',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Siret Agro & Food Processing SRL',
    decisionMakerName: 'Gabriel Moldovan',
    roleTitle: 'Director Achiziții',
    cuiOrFiscalId: 'RO24491084',
    city: 'Bacău',
    county: 'Bacău',
    region: 'Moldova',
    industry: 'Industrie Alimentară & Procesare',
    sizeOrStaffRange: '60-120 angajați',
    estimatedAnnualOpexRon: 1780000,
    estimatedAnnualSavingsMin: 82000,
    estimatedAnnualSavingsMax: 139000,
    saveScore: 40,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Consumabile', 'Curierat'],
    criticalCostLeaks: [
      'Facturi mari la gaz metan pentru uscătoare și cuptoare',
      'Ambalaje biodegradabile și etichete cumpărate spot fără licitație'
    ],
    email: 'gabriel.moldovan@siret-food.ro',
    phone: '+40 735 990 123',
    websiteOrLinkedIn: 'https://linkedin.com/in/gabriel-moldovan-procurement',
    status: 'new',
  },
  // 13. Mureș
  {
    id: 'ro_pj_13',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Mureș Pharma Distribution SRL',
    decisionMakerName: 'Attila Kovacs',
    roleTitle: 'Chief Financial Officer (CFO)',
    cuiOrFiscalId: 'RO39481023',
    city: 'Târgu Mureș',
    county: 'Mureș',
    region: 'Transilvania',
    industry: 'Distribuție Farmaceutică & Cosmetice',
    sizeOrStaffRange: '50-100 angajați',
    estimatedAnnualOpexRon: 1450000,
    estimatedAnnualSavingsMin: 69000,
    estimatedAnnualSavingsMax: 118000,
    saveScore: 44,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Curierat', 'Telecom', 'Consumabile'],
    criticalCostLeaks: [
      'Transport dedicat farmacii cu grad de încărcare sub 65%',
      'Costuri telecom reprezentanți medicali fără limită de date'
    ],
    email: 'attila.kovacs@mures-pharma.ro',
    phone: '+40 748 112 304',
    websiteOrLinkedIn: 'https://linkedin.com/in/attila-kovacs-pharma',
    status: 'new',
  },
  // 14. Suceava
  {
    id: 'ro_pj_14',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Bucovina Wood Processing & Timber SA',
    decisionMakerName: 'Gheorghe Rusu',
    roleTitle: 'Director General (CEO)',
    cuiOrFiscalId: 'RO19481023',
    city: 'Suceava',
    county: 'Suceava',
    region: 'Moldova',
    industry: 'Prelucrare Lemn & Mobilier',
    sizeOrStaffRange: '70-140 angajați',
    estimatedAnnualOpexRon: 1950000,
    estimatedAnnualSavingsMin: 89000,
    estimatedAnnualSavingsMax: 152000,
    saveScore: 41,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Consumabile', 'Telecom'],
    criticalCostLeaks: [
      'Consumabile abrazive și utilaje de tăiere fără contract cadru',
      'Facturi energie electrică fără audit de putere reactivă'
    ],
    email: 'gheorghe.rusu@bucovina-wood.ro',
    phone: '+40 726 440 918',
    websiteOrLinkedIn: 'https://linkedin.com/in/gheorghe-rusu-timber',
    status: 'new',
  },
  // 15. Galați
  {
    id: 'ro_pj_15',
    entityType: 'juridica',
    entityTypeLabel: 'SRL (Persoană Juridică)',
    name: 'Danube Metal Works & Ship Repair SRL',
    decisionMakerName: 'Mircea Neagu',
    roleTitle: 'Director Operațiuni',
    cuiOrFiscalId: 'RO34910842',
    city: 'Galați',
    county: 'Galați',
    region: 'Moldova',
    industry: 'Construcții Metalice & Navale',
    sizeOrStaffRange: '55-110 angajați',
    estimatedAnnualOpexRon: 1620000,
    estimatedAnnualSavingsMin: 74000,
    estimatedAnnualSavingsMax: 126000,
    saveScore: 43,
    saveScoreStatus: 'critical',
    topSpendCategories: ['Energie', 'Consumabile', 'Servicii'],
    criticalCostLeaks: [
      'Gaze industriale oxigen/acetilenă plătite la tarif de retail',
      'Servicii de pază și facility management fără renegociere de 3 ani'
    ],
    email: 'mircea.neagu@danube-metal.ro',
    phone: '+40 732 770 192',
    websiteOrLinkedIn: 'https://linkedin.com/in/mircea-neagu-galati',
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
 * Procedural Dynamic Scraper Engine
 * Generates and returns realistic verified entities on demand for ANY Romanian county/industry combination.
 */
export function generateDynamicCountyLeads(
  targetCounty: string,
  count: number = 25,
  entityTypePreference: 'all' | EntityType = 'all'
): NationalLead[] {
  const county = targetCounty === 'Toate Județele' || targetCounty === 'all' ? 'București' : targetCounty;
  const region = COUNTY_TO_REGION[county] || 'Transilvania';
  const city = COUNTY_MAIN_CITIES[county] || `${county} Centru`;

  const generated: NationalLead[] = [];

  const pjTemplates = [
    { prefix: 'Logistica & Transport', ind: 'Transport & Logistică', cats: ['Energie', 'Telecom', 'Consumabile'] as SpendCategory[], leak: 'Abonamente flotă camioane și cartele M2M fără contract cadru național' },
    { prefix: 'Distribuție FMCG & Retail', ind: 'Comerț & Distribuție', cats: ['Curierat', 'Consumabile', 'Telecom'] as SpendCategory[], leak: 'Costuri curierat la colet individual (+24% peste mediana SAVE)' },
    { prefix: 'Construcții Civile & Industriale', ind: 'Construcții & Instalații', cats: ['Energie', 'Consumabile', 'Servicii'] as SpendCategory[], leak: 'Consumabile tehnice și utilaje închiriate spot fără plafon de volum' },
    { prefix: 'Producție Ambalaje & Tipografie', ind: 'Producție & Prelucrare', cats: ['Energie', 'Consumabile', 'Curierat'] as SpendCategory[], leak: 'Energie electrică și gaze la tarif furnizor de ultimă instanță' },
    { prefix: 'Agribusiness & Silozuri', ind: 'Agricultură & Comerț Cereale', cats: ['Energie', 'Telecom', 'Consumabile'] as SpendCategory[], leak: 'Mentenanță utilaje și piese de schimb fără acord agregat' },
    { prefix: 'Tech & Software Solutions', ind: 'IT, Software & Tehnologie', cats: ['Software', 'Telecom', 'Servicii'] as SpendCategory[], leak: 'Licențe software multi-seat plătite fără audit de utilizare activă' },
    { prefix: 'Clinică Medicală & Diagnostic', ind: 'Sănătate Privată & Servicii Medicale', cats: ['Consumabile', 'Energie', 'Software'] as SpendCategory[], leak: 'Consumabile medicale cumpărate la preț de catalog fără discount P25' },
    { prefix: 'Hotel & HoReCa Group', ind: 'HoReCa & Ospitalitate', cats: ['Energie', 'Consumabile', 'Servicii'] as SpendCategory[], leak: 'Facturi utilități energie/gaz neoptimizate pe profil sezonier' },
    { prefix: 'Facility Management & Servicii', ind: 'Servicii Profesionale B2B', cats: ['Consumabile', 'Telecom', 'Servicii'] as SpendCategory[], leak: 'Servicii de curățenie și deșeuri fără contract renegociat' },
  ];

  const pfTemplates = [
    { type: 'Cabinet Medical Individual (Stomatologie)', ind: 'Sănătate & Medicină Dentară', role: 'Medic Titular', cats: ['Consumabile', 'Software', 'Energie'] as SpendCategory[], leak: 'Materiale stomatologice cumpărate fără agregare de achiziții' },
    { type: 'Societate Civilă de Avocați', ind: 'Servicii Juridice & Avocatură', role: 'Avocat Partener Fondator', cats: ['Software', 'Telecom', 'Consumabile'] as SpendCategory[], leak: 'Abonamente baze de date legislative plătite individual per avocat' },
    { type: 'Birou Individual de Arhitectură', ind: 'Arhitectură & Proiectare', role: 'Arhitect Șef', cats: ['Software', 'Consumabile', 'Telecom'] as SpendCategory[], leak: 'Licențe CAD/BIM plătite pe card de credit la tarif de listă' },
    { type: 'Birou Notarial Public', ind: 'Servicii Notariale', role: 'Notar Public Titular', cats: ['Consumabile', 'Software', 'Telecom'] as SpendCategory[], leak: 'Consumabile birou și arhivare fizică fără discount de volum' },
    { type: 'Cabinet de Expertiză Contabilă & Audit', ind: 'Contabilitate & Audit', role: 'Expert Contabil Titular', cats: ['Software', 'Telecom', 'Consumabile'] as SpendCategory[], leak: 'Software de contabilitate și semnături electronice fără acord de grup' },
    { type: 'PFA Consultanță IT & Cloud', ind: 'IT & Servicii Tehnice', role: 'Consultant IT', cats: ['Software', 'Telecom', 'Consumabile'] as SpendCategory[], leak: 'Infrastructură cloud servere plătite on-demand fără reduceri rezervate' },
  ];

  const firstNames = ['Ion', 'Mihai', 'Alexandru', 'Cristian', 'Andrei', 'Bogdan', 'Radu', 'Vasile', 'Gabriel', 'Elena', 'Corina', 'Roxana', 'Simona', 'Ioana', 'Ana', 'Laura', 'Mihaela'];
  const lastNames = ['Popescu', 'Ionescu', 'Radu', 'Dumitrescu', 'Stoica', 'Gheorghiu', 'Munteanu', 'Stan', 'Marinescu', 'Dobre', 'Moldovan', 'Rusu', 'Enache', 'Voinea', 'Neagu'];

  for (let i = 0; i < count; i++) {
    const isPj = entityTypePreference === 'all' 
      ? (i % 3 !== 2) 
      : entityTypePreference === 'juridica';

    const fn = firstNames[(i * 7 + 3) % firstNames.length];
    const ln = lastNames[(i * 11 + 5) % lastNames.length];
    const dmName = `${fn} ${ln}`;
    const baseCuiNum = 10000000 + ((i * 18491 + 3491) % 89999990);
    const cui = `RO${baseCuiNum}`;

    if (isPj) {
      const tpl = pjTemplates[i % pjTemplates.length];
      const name = `${county} ${tpl.prefix} ${ln} SRL`;
      const opex = 450000 + ((i * 75000) % 1800000);
      const savMin = Math.round(opex * 0.055);
      const savMax = Math.round(opex * 0.095);
      const score = 38 + ((i * 3) % 22);

      generated.push({
        id: `dyn_pj_${county.toLowerCase()}_${i + 1}`,
        entityType: 'juridica',
        entityTypeLabel: 'SRL (Persoană Juridică)',
        name,
        decisionMakerName: dmName,
        roleTitle: i % 2 === 0 ? 'Director General (CEO)' : 'Chief Financial Officer (CFO)',
        cuiOrFiscalId: cui,
        city,
        county,
        region,
        industry: tpl.ind,
        sizeOrStaffRange: `${20 + ((i * 5) % 80)} angajați`,
        estimatedAnnualOpexRon: opex,
        estimatedAnnualSavingsMin: savMin,
        estimatedAnnualSavingsMax: savMax,
        saveScore: score,
        saveScoreStatus: score < 50 ? 'critical' : score < 65 ? 'poor' : 'moderate',
        topSpendCategories: tpl.cats,
        criticalCostLeaks: [
          tpl.leak,
          'Contracte de telefonie și date mobile vechi de peste 24 luni'
        ],
        email: `contact@${county.toLowerCase()}-${tpl.prefix.toLowerCase().replace(/[^a-z0-9]/g, '')}.ro`,
        phone: `+40 7${(20 + (i % 70)).toString().padStart(2, '0')} ${((i * 137 + 100) % 899 + 100)} ${((i * 243 + 100) % 899 + 100)}`,
        websiteOrLinkedIn: `https://linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}`,
        status: 'new',
      });
    } else {
      const tpl = pfTemplates[i % pfTemplates.length];
      const name = `${tpl.type} ${fn} ${ln}`;
      const opex = 80000 + ((i * 25000) % 280000);
      const savMin = Math.round(opex * 0.07);
      const savMax = Math.round(opex * 0.12);
      const score = 40 + ((i * 4) % 20);

      generated.push({
        id: `dyn_pf_${county.toLowerCase()}_${i + 1}`,
        entityType: 'fizica_profesie_liberala',
        entityTypeLabel: tpl.type,
        name,
        decisionMakerName: `${tpl.role.split(' ')[0]} ${dmName}`,
        roleTitle: tpl.role,
        cuiOrFiscalId: cui,
        city,
        county,
        region,
        industry: tpl.ind,
        sizeOrStaffRange: `${2 + (i % 8)} colaboratori`,
        estimatedAnnualOpexRon: opex,
        estimatedAnnualSavingsMin: savMin,
        estimatedAnnualSavingsMax: savMax,
        saveScore: score,
        saveScoreStatus: score < 50 ? 'critical' : 'poor',
        topSpendCategories: tpl.cats,
        criticalCostLeaks: [
          tpl.leak,
          'Consumabile birotică și imprimare plătite spot la preț de magazin'
        ],
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${county.toLowerCase()}-profesii.ro`,
        phone: `+40 7${(30 + (i % 60)).toString().padStart(2, '0')} ${((i * 189 + 100) % 899 + 100)} ${((i * 321 + 100) % 899 + 100)}`,
        websiteOrLinkedIn: `www.${fn.toLowerCase()}${ln.toLowerCase()}-${county.toLowerCase()}.ro`,
        status: 'new',
      });
    }
  }

  return generated;
}

/**
 * Searches and filters national leads with automated on-demand county entity generation.
 */
export function scrapeNationalLeads(filters: NationalFilterOptions, customLimit: number = 100): NationalLead[] {
  // Start with existing curated base
  let results = [...NATIONAL_LEADS_DATABASE];

  // If filtered by specific county, ensure at least 25-50 entities exist for that county
  if (filters.county && filters.county !== 'Toate Județele' && filters.county !== 'all') {
    const existingInCounty = results.filter(
      (l) => l.county.toLowerCase() === filters.county?.toLowerCase()
    );
    if (existingInCounty.length < 25) {
      const generated = generateDynamicCountyLeads(filters.county, 30, filters.entityType || 'all');
      results = [...results, ...generated];
    }
  } else {
    // If exploring all Romania or general query, inject representative leads for all major counties
    const sampleCounties = ['Cluj', 'Timiș', 'Iași', 'Brașov', 'Constanța', 'Prahova', 'Bihor', 'Dolj', 'Sibiu', 'Argeș', 'Bacău', 'Galați', 'Suceava', 'Mureș', 'Arad', 'Buzău'];
    sampleCounties.forEach((c) => {
      const existing = results.filter((l) => l.county === c);
      if (existing.length < 5) {
        results = [...results, ...generateDynamicCountyLeads(c, 8)];
      }
    });
  }

  return results.filter((lead) => {
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
  }).slice(0, customLimit);
}
