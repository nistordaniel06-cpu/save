import { NationalLead } from './national-scraper';

export interface NationalPitchTemplates {
  emailSubject: string;
  emailBody: string;
  whatsAppMessage: string;
  linkedInMessage: string;
  keyTalkingPoints: string[];
}

/**
 * Generates tailored pitches for Persoane Juridice (Corporate) and Persoane Fizice (Profesii Liberale / PFA)
 */
export function generateNationalPitch(lead: NationalLead): NationalPitchTemplates {
  const savingsStr = `${lead.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – ${lead.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei/an`;
  const primaryCategory = lead.topSpendCategories[0] || 'Curierat & Telecom';
  const secondaryCategory = lead.topSpendCategories[1] || 'Software & Utilități';
  const mainLeak = lead.criticalCostLeaks[0] || 'Tarife peste mediana pieței din România';
  const isPf = lead.entityType === 'fizica_profesie_liberala';

  let emailSubject = '';
  let emailBody = '';
  let whatsAppMessage = '';
  let linkedInMessage = '';
  let keyTalkingPoints: string[] = [];

  if (isPf) {
    // Pitch for Persoană Fizică / Profesie Liberală (Cabinet / Birou / PFA)
    emailSubject = `Optimizare cheltuieli operaționale pentru ${lead.name} (${savingsStr})`;

    emailBody = `Bună ziua, domnule/doamnă ${lead.decisionMakerName},

Vă contactez în calitate de titular / coordonator la ${lead.name} (${lead.city}, Jud. ${lead.county}).

În cadrul analizei noastre de eficiență a costurilor pentru ${lead.industry}, am evaluat structura tipică de cheltuieli pentru o activitate profesională cu ${lead.sizeOrStaffRange}. 

Conform benchmark-urilor SAVE, scorul de eficiență a cheltuielilor este de ${lead.saveScore}/100, existând un potențial direct de economisire între ${savingsStr}:
• ${mainLeak}

Prin platforma SAVE, ajutăm cabinetele și profesioniștii independenți să-și reducă facturile de ${primaryCategory} și ${secondaryCategory} fără efort administrativ:
1. Trimiteți ultimele 2-3 facturi sau fișierele din e-Factura.
2. În 60 de secunde primiți raportul comparativ cu mediana națională a pieței.
3. Lucrăm exclusiv pe comision de succes („No Saving, No Fee”) — nu există cost dacă nu obțineți o reducere efectivă.

Ați fi deschis(ă) la o scurtă discuție de 5-10 minute săptămâna aceasta?

Cu stimă,

Echipa SAVE — Platforma Națională de Eficiență în Achiziții
Email: contact@save.ro | Web: https://save.ro`;

    whatsAppMessage = `Bună ziua, ${lead.decisionMakerName}! Vă contactez din partea SAVE. Am analizat costurile pentru ${lead.name} (${lead.city}) și am estimat un potențial de economisire de ${savingsStr} pe ${primaryCategory} și utilități (Scor Eficiență: ${lead.saveScore}/100). Modelul este fără risc (comision doar pe economii reale). Când ați avea 5 minute pentru o scurtă discuție?`;

    linkedInMessage = `Bună ziua, ${lead.decisionMakerName}! Am remarcat activitatea ${lead.name} în ${lead.city}. Ajutăm profesioniștii din ${lead.industry} să economisească între ${savingsStr} pe costurile de ${primaryCategory} prin date comparative de piață. V-ar fi util un audit comparativ gratuit?`;

    keyTalkingPoints = [
      `Economii directe în bugetul cabinetului / PFA: ${savingsStr}.`,
      `Scor SAVE: ${lead.saveScore}/100 (potențial de reducere ~${Math.round((lead.estimatedAnnualSavingsMin / Math.max(1, lead.estimatedAnnualOpexRon)) * 100)}% din OPEX).`,
      `Fără bătaie de cap administrativă: Ne ocupăm noi de renegociere și optimizare.`,
    ];

  } else {
    // Pitch for Persoană Juridică (SRL / SA)
    emailSubject = `Audit eficiență achiziții pentru ${lead.name} — Scor SAVE: ${lead.saveScore}/100 (${savingsStr})`;

    emailBody = `Bună ziua, domnule/doamnă ${lead.decisionMakerName},

Vă contactez în calitate de ${lead.roleTitle} la ${lead.name} (${lead.city}, Jud. ${lead.county}).

În cadrul analizelor noastre pe companiile din sectorul ${lead.industry} din regiunea ${lead.region}, am evaluat structura estimativă a cheltuielilor operaționale pentru ${lead.name}.

Pe baza volumelor unei companii cu ${lead.sizeOrStaffRange}, scorul de eficiență este de doar ${lead.saveScore}/100, indicând un diferențial favorabil de renegociere și creștere EBITDA de ${savingsStr}:
• ${mainLeak}

Prin platforma SAVE (Procurement Intelligence), sprijinim companiile din România să-și recupereze aceste marje fără a schimba partenerii actuali:
1. Încărcați 2-3 facturi recente sau fișierele e-Factura XML.
2. SAVE generează în 60 de secunde analiza detaliată de prețuri față de mediana pieței B2B (P25 / P50).
3. Risc zero: Model 100% Success-Fee („No Saving, No Fee”).

Ați fi deschis(ă) la o scurtă discuție de 10 minute pentru a vă prezenta oportunitățile concrete de optimizare?

Cu stimă,

Echipa SAVE — Platforma B2B de Achiziții Inteligente
Email: contact@save.ro | Web: https://save.ro`;

    whatsAppMessage = `Bună ziua, ${lead.decisionMakerName}! Vă scriu din partea SAVE (Procurement Intelligence). Am estimat o oportunitate de optimizare OPEX pentru ${lead.name} de aproximativ ${savingsStr} pe ${primaryCategory} (Scor SAVE: ${lead.saveScore}/100). Lucrăm exclusiv pe comision de succes. Când ați avea câteva minute pentru o scurtă discuție?`;

    linkedInMessage = `Bună ziua, ${lead.decisionMakerName}! Urmăresc evoluția ${lead.name} în ${lead.county}. Conform analizei noastre pe ${lead.industry}, companiile similare au un potențial de reducere a costurilor de ${primaryCategory} de ${savingsStr}. V-ar ajuta un raport comparativ gratuit?`;

    keyTalkingPoints = [
      `Creștere marjă EBITDA: ${savingsStr} din OPEX estimat de ~${lead.estimatedAnnualOpexRon.toLocaleString('ro-RO')} lei.`,
      `Scor SAVE: ${lead.saveScore}/100 (vulnerabilitate: ${mainLeak}).`,
      `Zero costuri fixe: Comision aplicat exclusiv din economiile confirmate pe factură.`,
    ];
  }

  return {
    emailSubject,
    emailBody,
    whatsAppMessage,
    linkedInMessage,
    keyTalkingPoints,
  };
}
