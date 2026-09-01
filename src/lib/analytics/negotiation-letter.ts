import { SpendCategory } from '../types';

export interface NegotiationLetterParams {
  companyName: string;
  companyCui?: string;
  supplierName: string;
  category: SpendCategory;
  currentOrProposedCostAnnual: number;
  targetCostAnnual: number;
  expectedSavingsAnnual: number;
  keyArguments?: string[];
  clausesToExclude?: string[];
  contactPersonName?: string;
  contactPersonRole?: string;
  dateStr?: string;
}

/**
 * Generates a formal, professional Romanian B2B Counter-Offer / Negotiation Letter
 */
export function generateNegotiationLetter(params: NegotiationLetterParams): string {
  const date = params.dateStr || new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });
  const company = params.companyName || 'Compania Noastră SRL';
  const cuiText = params.companyCui ? ` (CUI: ${params.companyCui})` : '';
  const supplier = params.supplierName || 'Furnizor';
  const category = params.category || 'Servicii';
  const contactName = params.contactPersonName || 'Director General / Director Financiar';
  const contactRole = params.contactPersonRole || 'Departamentul Financiar & Achiziții';

  const defaultArgs = [
    `Volumul de activitate și istoricul de plăți ireproșabil al companiei noastre justifică încadrarea în cea mai avantajoasă grilă comercială.`,
    `Datele de piață actualizate pentru categoria ${category} indică o mediană tarifară inferioară ofertei curente.`,
    `Dorim un parteneriat stabil pe termen lung, condiționat de optimizarea structurii de cost.`,
  ];

  const args = params.keyArguments && params.keyArguments.length > 0 ? params.keyArguments : defaultArgs;

  const defaultClauses = [
    `Eliminarea clauzei de reînnoire tacită automată a contractului fără confirmarea prealabilă scrisă a beneficiarului.`,
    `Stabilirea unui termen de preaviz reciproc de minim 30–60 de zile calendaristice.`,
    `Plafonarea oricărei eventuale indexări anuale de preț la o marjă rezonabilă agreată bilateral.`,
  ];

  const clauses = params.clausesToExclude && params.clausesToExclude.length > 0 ? params.clausesToExclude : defaultClauses;

  return `================================================================================
SCRISOARE OFICIALĂ DE NEGOCIERE ȘI CONTRA-OFERTĂ COMERCIALĂ
================================================================================

Data: ${date}
De la: ${company}${cuiText}
Către: Departamentul Comercial / Management Vânzări — ${supplier}
Referință: Negociere termeni comerciali și optimizare contract / ofertă — Categoria ${category}

Stimați parteneri,

Vă mulțumim pentru colaborarea de până în prezent și pentru propunerea comercială înaintată.

În cadrul procesului nostru periodic de audit intern al cheltuielilor operaționale și optimizare a portofoliului de furnizori, am analizat structura de costuri aferentă serviciilor / produselor furnizate de compania dumneavoastră.

1. ANALIZA COMERCIALĂ & PROPUNEREA DE PREȚ:
--------------------------------------------------------------------------------
În urma evaluării volumelor rulate și a benchmark-urilor actuale din piața de profil, vă transmitem următoarea contra-ofertă fermă:

• Buget anual propus de dumneavoastră: ${params.currentOrProposedCostAnnual.toLocaleString('ro-RO')} RON / an
• Buget țintă agreat de conducerea noastră: ${params.targetCostAnnual.toLocaleString('ro-RO')} RON / an
• Ajustare solicitată: ${params.expectedSavingsAnnual.toLocaleString('ro-RO')} RON / an (aprox. ${Math.round((params.expectedSavingsAnnual / Math.max(1, params.currentOrProposedCostAnnual)) * 100)}% discount)

2. ARGUMENTE COMMERCIALE:
--------------------------------------------------------------------------------
${args.map((a, idx) => `${idx + 1}. ${a}`).join('\n')}

3. CLAUZE CONTRACTUALE SPECIFICE SOLICITATE:
--------------------------------------------------------------------------------
Pentru finalizarea și semnarea actului adițional / noului contract, solicităm includerea următoarelor condiții:
${clauses.map((c, idx) => `• ${c}`).join('\n')}

Vă rugăm să ne transmiteți confirmarea dumneavoastră sau o ofertă revizuită aliniată parametrilor de mai sus până în termen de 5 zile lucrătoare de la data prezentei.

Suntem deschiși unei scurte întâlniri online sau telefonice pentru a definitiva detaliile colaborării.

Cu stimă și considerație,

________________________________________
${contactName}
${contactRole}
${company}
Email: financiar@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.ro
================================================================================`;
}
