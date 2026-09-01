const { scrapeRomanianLeads } = require('../src/lib/prospects/company-scraper');
const { generateProspectPitch } = require('../src/lib/prospects/lead-scoring');

const args = process.argv.slice(2);
let city = 'all';
let industry = 'all';

args.forEach(arg => {
  if (arg.startsWith('--city=')) city = arg.split('=')[1];
  if (arg.startsWith('--industry=')) industry = arg.split('=')[1];
});

console.log('================================================================================');
console.log('🎯 SAVE B2B PROSPECTOR & ROMANIAN LEAD ENGINE');
console.log('================================================================================');
console.log(`Filtre aplicate -> Oraș: ${city} | Industrie: ${industry}\n`);

const leads = scrapeRomanianLeads({ city, industry });

console.log(`✓ S-au identificat ${leads.length} companii calificate pentru optimizare SAVE:\n`);

leads.forEach((l, idx) => {
  console.log(`[${idx + 1}] ${l.name} (CUI: ${l.cui})`);
  console.log(`    📍 Locație: ${l.city}, Jud. ${l.county}`);
  console.log(`    💼 Domeniu: ${l.industry} (${l.employeeRange})`);
  console.log(`    💰 OPEX Anual Estimat: ${l.estimatedAnnualOpexRon.toLocaleString('ro-RO')} lei`);
  console.log(`    🎯 Economii Anuale Posibile: ${l.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – ${l.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei`);
  console.log(`    ⭐ Scor Oportunitate SAVE: ${l.opportunityScore}%`);
  console.log(`    🏷️  Categorii Atacabile: ${l.topSpendCategories.join(', ')}`);
  console.log(`    📧 Contact: ${l.email || 'N/A'} | Tel: ${l.phone || 'N/A'}`);
  console.log('--------------------------------------------------------------------------------');
});

console.log('\n💡 Pentru a genera pitch-ul de vânzare personalizat:');
console.log('Deschide panoul din platformă: http://localhost:3000/dashboard/prospects');
console.log('================================================================================');
