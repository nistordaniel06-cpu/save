const { scrapeNationalLeads } = require('../src/lib/prospects/national-scraper');
const { generateNationalPitch } = require('../src/lib/prospects/national-pitch-engine');

const args = process.argv.slice(2);
let entityType = 'all';
let county = 'all';
let region = 'all';
let industry = 'all';
let onlyCritical = false;

args.forEach(arg => {
  if (arg.startsWith('--type=')) entityType = arg.split('=')[1];
  if (arg.startsWith('--county=')) county = arg.split('=')[1];
  if (arg.startsWith('--region=')) region = arg.split('=')[1];
  if (arg.startsWith('--industry=')) industry = arg.split('=')[1];
  if (arg === '--critical') onlyCritical = true;
});

console.log('================================================================================');
console.log('🇷🇴  SAVE MASTER LEAD SCRAPER — TOATĂ ROMÂNIA (PJ + PF)');
console.log('================================================================================');
console.log(`Filtre -> Tip: ${entityType} | Județ: ${county} | Regiune: ${region} | Scor Critic: ${onlyCritical}\n`);

const leads = scrapeNationalLeads({
  entityType: entityType === 'all' ? undefined : entityType,
  county: county === 'all' ? undefined : county,
  region: region === 'all' ? undefined : region,
  industry: industry === 'all' ? undefined : industry,
  scoreFilter: onlyCritical ? 'critical' : undefined,
});

console.log(`✓ S-au identificat ${leads.length} entități calificate în România:\n`);

leads.forEach((l, idx) => {
  console.log(`[${idx + 1}] ${l.name}`);
  console.log(`    🏷️  Tip: ${l.entityTypeLabel} (CUI/CIF: ${l.cuiOrFiscalId})`);
  console.log(`    👤 Factor Decizie: ${l.decisionMakerName} (${l.roleTitle})`);
  console.log(`    📍 Locație: ${l.city}, Jud. ${l.county} (${l.region})`);
  console.log(`    🔴 Scor SAVE: ${l.saveScore}/100 (${l.saveScore < 50 ? 'Critic' : 'Moderat'})`);
  console.log(`    💰 Economii Anuale: ${l.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – ${l.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei`);
  console.log(`    🎯 Vulnerabilitate: ${l.criticalCostLeaks[0] || 'Costuri neoptimizate'}`);
  console.log(`    📧 Email: ${l.email} | 📞 Tel: ${l.phone}`);
  console.log(`    🌐 Web/LinkedIn: ${l.websiteOrLinkedIn}`);
  console.log('--------------------------------------------------------------------------------');
});

console.log('\n💡 Pentru panoul de control complet cu pitch-uri de vânzare și export CSV:');
console.log('👉 Deschide: http://localhost:3000/admin/scraper');
console.log('================================================================================');
