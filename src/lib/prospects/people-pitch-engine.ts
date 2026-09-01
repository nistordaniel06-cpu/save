import { BucharestDecisionMaker } from './bucharest-people-scraper';

export interface DecisionMakerPitch {
  emailSubject: string;
  emailBody: string;
  whatsAppMessage: string;
  linkedInConnectionNote: string;
  linkedInInMail: string;
  executiveTalkingPoints: string[];
}

/**
 * Generates highly converting, role-customized outreach templates for Bucharest business leaders
 */
export function generatePersonPitch(person: BucharestDecisionMaker): DecisionMakerPitch {
  const firstName = person.fullName.split(' ')[0];
  const savingsStr = `${person.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – ${person.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei/an`;
  const primaryCategory = person.topSpendCategories[0] || 'Curierat & Telecom';
  const secondaryCategory = person.topSpendCategories[1] || 'Software & Utilități';
  const mainLeak = person.keyPainPoints[0] || 'Tarife nealiniate la mediana pieței B2B din București';

  let emailSubject = '';
  let emailBody = '';
  let whatsAppMessage = '';
  let linkedInConnectionNote = '';
  let linkedInInMail = '';
  let executiveTalkingPoints: string[] = [];

  if (person.roleCategory === 'cfo' || person.roleCategory === 'finance_manager') {
    // Pitch focused on EBITDA, OPEX reduction & zero risk
    emailSubject = `Optimizare OPEX ${primaryCategory} pentru ${person.companyName} (${savingsStr})`;
    
    emailBody = `Bună ziua, domnule/doamnă ${person.fullName},

Vă contactez în calitate de ${person.roleTitle} la ${person.companyName}. În cadrul analizelor noastre de piață pe companiile din ${person.districtArea} (${person.industry}), am efectuat un audit estimativ al eficienței achizițiilor operaționale.

Pe baza volumului de activitate estimat pentru o structură cu ${person.employeeRange}, scorul SAVE de eficiență este de doar ${person.saveScore}/100, indicând un potențial direct de reducere a OPEX și îmbunătățire a marjei EBITDA de ${savingsStr}.

Principalul diferențial identificat față de mediana pieței din București:
• ${mainLeak}

Prin platforma SAVE (Procurement Intelligence), ajutăm directorii financiari să obțină aceste economii fără a schimba furnizorii actuali și fără costuri fixe:
1. Încărcați 2-3 facturi recente sau fișierele e-Factura XML.
2. Platforma generează instant raportul de benchmark (P25 / P50 mediana pieței din România).
3. Lucrăm exclusiv pe model Success-Fee („No Saving, No Fee”) — comisionul nostru se percepe doar dacă obțineți o reducere efectivă confirmată pe factură.

Ați fi deschis(ă) la o scurtă discuție introductivă de 10 minute joi sau vineri pentru a vă prezenta cifrele comparative?

Cu stimă,

Echipa SAVE — Platforma de Inteligență în Achiziții B2B
Email: contact@save.ro | Web: https://save.ro`;

    whatsAppMessage = `Bună ziua, ${firstName}! Vă contactez din partea SAVE (Procurement Intelligence). Am calculat o estimare de reducere a costurilor operaționale pe ${primaryCategory} pentru ${person.companyName} de aproximativ ${savingsStr} (Scor Eficiență: ${person.saveScore}/100). Modelul este 100% fără risc (comision doar pe economii realizate). Când ați avea 5 minute pentru o scurtă discuție telefonică?`;

    linkedInConnectionNote = `Bună ziua, ${firstName}! Urmăresc activitatea ${person.companyName} din ${person.districtArea}. Am dezvoltat un model de audit OPEX pe ${primaryCategory} prin care ajutăm CFO-urile din București să optimizeze bugetele cu ${savingsStr}. Mi-ar face plăcere să ne conectăm!`;

    linkedInInMail = `Bună ziua, ${firstName}! În rolul dvs. de ${person.roleTitle} la ${person.companyName}, cred că vă poate interesa o comparație rapidă: conform benchmark-urilor noastre din ${person.sector}, companiile similare au un potențial de reducere a costurilor de ${primaryCategory} de ${savingsStr}. Lucrăm pe model „No Saving, No Fee”. V-ar fi util un raport comparativ gratuit pe e-Factura?`;

    executiveTalkingPoints = [
      `Impact direct în EBITDA: ${savingsStr} adăugate la profitabilitatea netă.`,
      `Scor SAVE estimat: ${person.saveScore}/100 (sub mediana de 65/100 a sectorului ${person.industry}).`,
      `Vulnerabilitate specifică: ${mainLeak}.`,
      `Condiții contractuale: Solicitare de eliminare a prelungirii tacite pe 24 luni.`,
    ];

  } else if (person.roleCategory === 'ceo') {
    // Pitch focused on Bottom-line Profitability, Growth & Competitive Edge
    emailSubject = `Creștere profitabilitate operațională pentru ${person.companyName}`;

    emailBody = `Bună ziua, ${firstName},

Vă scriu pe scurt deoarece urmărim dezvoltarea ${person.companyName} în zona de ${person.industry} (${person.districtArea}).

Lucrăm cu fondatori și directori generali din București pentru a transforma cheltuielile pasive cu furnizorii de ${primaryCategory}, ${secondaryCategory} și utilități în profit direct.

Pentru o companie de dimensiunea ${person.companyName}, estimăm o marjă de optimizare anuală de ${savingsStr}, fără efort din partea echipei dumneavoastră și fără a perturba relația comercială cu partenerii existenți.

De ce apreciază antreprenorii modelul SAVE:
• Risc zero: Nu există abonamente costisitoare sau comisioane avansate (Success-Fee doar din economii reale).
• Rapiditate: Audit în 60 de secunde folosind datele din e-Factura XML.
• Negociere asistată: Ne ocupăm noi de obținerea acordurilor comerciale optime.

Putem programa o scurtă discuție de 10 minute săptămâna aceasta?

Cu stimă,

Echipa SAVE — Platforma B2B de Optimizare Achiziții
Email: contact@save.ro | Web: https://save.ro`;

    whatsAppMessage = `Bună ziua, ${firstName}! Vă scriu privind ${person.companyName}. Am identificat o oportunitate de a crește marja de profit cu ${savingsStr} prin optimizarea contractelor de ${primaryCategory}, lucrând 100% pe comision de succes („No Saving, No Fee”). Când ați avea câteva minute pentru o discuție?`;

    linkedInConnectionNote = `Bună ziua, ${firstName}! Admir creșterea ${person.companyName} în ${person.industry}. Ajutăm companiile din București să economisească între ${savingsStr} pe achiziții operaționale. Mi-ar face plăcere să facem schimb de idei!`;

    linkedInInMail = `Bună ziua, ${firstName}! În calitate de CEO la ${person.companyName}, știu că fiecare procentaj salvat din OPEX merge direct în linia de profit. Am estimat un potențial de ${savingsStr} pe contractele de ${primaryCategory}. V-ar plăcea să vedeți o scurtă simulare gratuită?`;

    executiveTalkingPoints = [
      `Bottom-line impact: ${savingsStr} economisite = echivalentul unei creșteri de vânzări de ~400.000 lei.`,
      `Audit automatizat: Gata în 60 de secunde pe e-Factura ANAF.`,
      `Comparație cu competitorii din ${person.districtArea}: Plătesc cu ~20% mai puțin pe aceleași servicii.`,
    ];

  } else {
    // Procurement / COO / Operations pitch
    emailSubject = `Date benchmark piață B2B pentru achizițiile ${person.companyName}`;

    emailBody = `Bună ziua, ${firstName},

Vă contactez în rolul dvs. de ${person.roleTitle} la ${person.companyName}.

Punem la dispoziția echipelor de achiziții și operațiuni din București baza de date SAVE cu benchmark-uri reale de preț (P25 / P50 mediana pieței) pentru categoriile ${primaryCategory} și ${secondaryCategory}.

Conform analizei pe volumele estimate ale ${person.companyName}, există un diferențial favorabil de negociere de ${savingsStr} pe an:
• ${mainLeak}

Vă putem pune la dispoziție gratuit:
1. Raportul comparativ de piață pentru furnizorii dvs. actuali.
2. Ghidurile noastre de contra-ofertă și eliminare a clauzelor de prelungire tacită.
3. Suport direct în negociere dacă doriți să delegați acest proces.

Când ați avea timp pentru o scurtă discuție tehnică de 10 minute?

Cu respect,

Echipa SAVE — Platforma de Achiziții Inteligente`;

    whatsAppMessage = `Bună ziua, ${firstName}! Vă contactez din partea SAVE privind achizițiile ${person.companyName}. Avem date comparative actualizate pe piața din București pentru ${primaryCategory} care arată un potențial de negociere de ${savingsStr}. Vă putem trimite un raport comparativ gratuit?`;

    linkedInConnectionNote = `Bună ziua, ${firstName}! Conectez profesioniști de achiziții și operațiuni din București. Avem date de benchmark pe ${primaryCategory} (${person.industry}) care vă pot fi utile în renegocierile din ${person.sector}.`;

    linkedInInMail = `Bună ziua, ${firstName}! Ca responsabil de ${person.roleTitle} la ${person.companyName}, datele noastre de piață vă pot oferi o pârghie excelentă de negociere: mediana din București pe ${primaryCategory} este cu ~25% sub tarifele standard din contractele vechi. V-ar fi util un raport de benchmark?`;

    executiveTalkingPoints = [
      `Date de negociere: Benchmark-uri obiective P25-P50 din București.`,
      `SLA & Siguranță: Păstrarea calității serviciilor cu reducerea costului unitar.`,
      `Radar Reînnoiri: Notificări automate înainte de fereastra de preaviz.`,
    ];
  }

  return {
    emailSubject,
    emailBody,
    whatsAppMessage,
    linkedInConnectionNote,
    linkedInInMail,
    executiveTalkingPoints,
  };
}
