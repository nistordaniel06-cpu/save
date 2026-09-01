import { CompanyLead } from './company-scraper';

export interface ColdPitchTemplates {
  emailSubject: string;
  emailBody: string;
  whatsAppMessage: string;
  linkedInMessage: string;
  keyTalkingPoints: string[];
}

/**
 * Generates highly converting, tailored Romanian B2B outreach pitches based on low SAVE scores
 */
export function generateProspectPitch(lead: CompanyLead): ColdPitchTemplates {
  const savingsRangeStr = `${lead.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – ${lead.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei/an`;
  const primaryCategory = lead.topSpendCategories[0] || 'Curierat & Telecom';
  const secondaryCategory = lead.topSpendCategories[1] || 'Software & Utilități';
  const leaksFormatted = lead.criticalCostLeaks.map((l) => `  • ${l}`).join('\n');

  const emailSubject = `Audit de eficiență achiziții pentru ${lead.name} — Scor SAVE: ${lead.saveScore}/100 (${savingsRangeStr})`;

  const emailBody = `Bună ziua,

Vă contactez din partea platformei SAVE (Procurement Intelligence România). Analizăm companiile din sectorul ${lead.industry} din județul ${lead.county} și am evaluat structura estimativă de costuri pentru ${lead.name}.

Pe baza volumelor prognozate pentru o companie cu ${lead.employeeRange}, scorul estimat de eficiență a achizițiilor este de doar ${lead.saveScore}/100 (nivel ce indică pierderi operaționale semnificative).

Principalele vulnerabilități identificate în sectorul dumneavoastră:
${leaksFormatted}

Prin corelarea tarifelor cu benchmark-urile reale B2B din România, estimăm că ${lead.name} poate reduce cheltuielile anuale cu ${savingsRangeStr}, fără a schimba furnizorii actuali de ${primaryCategory} și ${secondaryCategory}, ci doar prin renegocierea condițiilor comerciale.

Modelul nostru este 100% orientat pe succes („No Saving, No Fee”):
1. Încărcați 2-3 facturi recente sau fișierele XML din e-Factura.
2. SAVE generează în 60 de secunde raportul detaliat de prețuri față de mediana pieței din România.
3. Dacă doriți, noi preluăm negocierea directă și vă livrăm contractul optimizat. Comisionul nostru se aplică doar ca procent din economiile efectiv confirmate pe factură.

Ați fi deschis la o scurtă discuție de 10 minute săptămâna aceasta pentru a vă prezenta cifrele comparative?

Cu stimă,

Echipa SAVE — Platforma de Achiziții & Inteligență Comercială
Website: https://save.ro | Email: contact@save.ro`;

  const whatsAppMessage = `Bună ziua! Vă contactez din partea SAVE (Procurement Intelligence). Am analizat eficiența costurilor pentru ${lead.name} și am estimat un Scor SAVE de ${lead.saveScore}/100, cu un potențial de economisire de ${savingsRangeStr} pe contractele de ${primaryCategory}. Putem genera un audit comparativ gratuit în 60 de secunde pe baza e-Factura. Când ați avea 5 minute pentru o scurtă discuție?`;

  const linkedInMessage = `Bună ziua! Am remarcat activitatea ${lead.name} în ${lead.county}. Conform analizei noastre de piață pe ${lead.industry}, companiile cu un profil similar au un potențial de optimizare de ${savingsRangeStr} pe ${primaryCategory} și utilități. Lucrăm exclusiv pe model Success-Fee („No Saving, No Fee”). V-ar fi util un raport comparativ gratuit?`;

  const keyTalkingPoints = [
    `Scor SAVE estimat: ${lead.saveScore}/100 (${lead.saveScore < 50 ? 'Nivel Critic — Pierderi Mari' : 'Ineficiență Moderată'}).`,
    `Economii anuale identificate: ${savingsRangeStr} din OPEX ~${lead.estimatedAnnualOpexRon.toLocaleString('ro-RO')} lei.`,
    `Vulnerabilități majore: ${lead.criticalCostLeaks[0] || 'Tarife peste mediana pieței'}.`,
    `Garanție client: Risc zero, comision doar din economiile obținute efectiv.`,
  ];

  return {
    emailSubject,
    emailBody,
    whatsAppMessage,
    linkedInMessage,
    keyTalkingPoints,
  };
}
