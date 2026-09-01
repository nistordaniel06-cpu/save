import { CompanyLead } from './company-scraper';

export interface ColdPitchTemplates {
  emailSubject: string;
  emailBody: string;
  whatsAppMessage: string;
  linkedInMessage: string;
  keyTalkingPoints: string[];
}

/**
 * Generates highly converting, tailored Romanian B2B outreach pitches
 */
export function generateProspectPitch(lead: CompanyLead): ColdPitchTemplates {
  const savingsRangeStr = `${lead.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – ${lead.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei/an`;
  const primaryCategory = lead.topSpendCategories[0] || 'Curierat & Telecom';
  const secondaryCategory = lead.topSpendCategories[1] || 'Software & Utilități';

  const emailSubject = `Optimizare costuri ${primaryCategory} pentru ${lead.name} (${savingsRangeStr})`;

  const emailBody = `Bună ziua,

Vă scriu pe scurt deoarece analizăm companiile de top din sectorul ${lead.industry} din județul ${lead.county} și am observat activitatea ${lead.name}.

Pe baza volumului de activitate estimat pentru o companie de dimensiunea dumneavoastră (${lead.employeeRange}), IMM-urile din România plătesc în medie cu 18–28% peste nivelul optim al pieței la contractele de ${primaryCategory} și ${secondaryCategory}.

Prin platforma SAVE (Procurement Intelligence), putem identifica economii directe între ${savingsRangeStr} pe an, fără a schimba neapărat furnizorii actuali, ci doar prin alinierea tarifelor la benchmark-urile reale B2B.

Modelul nostru este 100% orientat pe rezultate („No Saving, No Fee”):
1. Încărcați ultimele 2-3 facturi sau fișierele XML din e-Factura.
2. SAVE generează în 60 de secunde raportul exact de diferențial față de mediana pieței.
3. Dacă doriți, noi preluăm negocierea și vă livrăm contractul optimizat. Nu există costuri dacă nu economisiți efectiv.

Ați fi deschis la o scurtă discuție de 10 minute săptămâna aceasta sau să vă trimitem un raport estimativ gratuit?

Cu stimă,

Echipa SAVE — Platforma de Achiziții & Inteligență Comercială
Website: https://save.ro | Email: contact@save.ro`;

  const whatsAppMessage = `Bună ziua! Vă contactez din partea platformei SAVE (Procurement Intelligence). Am calculat o estimare de reducere a cheltuielilor operaționale (${primaryCategory}) pentru ${lead.name} de aproximativ ${savingsRangeStr}. Putem face un audit gratuit de 60 de secunde pe baza a 2 facturi recente sau e-Factura XML. Când ați avea 5 minute pentru o scurtă discuție?`;

  const linkedInMessage = `Bună ziua! Am remarcat dezvoltarea ${lead.name} în zona de ${lead.industry}. Lucrăm cu companii similare din ${lead.county} și le ajutăm să reducă costurile de ${primaryCategory} cu ${savingsRangeStr} prin date comparative din piață (fără comision dacă nu obținem reduceri reale). V-ar ajuta să aruncați o privire peste un audit comparativ gratuit?`;

  const keyTalkingPoints = [
    `Economii estimate: ${savingsRangeStr} la un OPEX de ~${lead.estimatedAnnualOpexRon.toLocaleString('ro-RO')} lei.`,
    `Focus prioritar: Contracte de ${primaryCategory} și ${secondaryCategory}.`,
    `Risc zero pentru client: Model Success-Fee („No Saving, No Fee”).`,
    `Ușurință în testare: Acceptă direct fișiere XML e-Factura ANAF cu precizie 100%.`,
  ];

  return {
    emailSubject,
    emailBody,
    whatsAppMessage,
    linkedInMessage,
    keyTalkingPoints,
  };
}
