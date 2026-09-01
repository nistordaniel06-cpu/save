const { scrapeBucharestDecisionMakers } = require('../src/lib/prospects/bucharest-people-scraper');
const { generatePersonPitch } = require('../src/lib/prospects/people-pitch-engine');

const args = process.argv.slice(2);
let role = 'all';
let sector = 'all';
let industry = 'all';
let onlyCritical = false;

args.forEach(arg => {
  if (arg.startsWith('--role=')) role = arg.split('=')[1];
  if (arg.startsWith('--sector=')) sector = `Sector ${arg.split('=')[1]}`;
  if (arg.startsWith('--industry=')) industry = arg.split('=')[1];
  if (arg === '--critical') onlyCritical = true;
});

console.log('================================================================================');
console.log('🏙️  SAVE B2B DECISION-MAKER PROSPECTOR — BUCUREȘTI & ILFOV');
console.log('================================================================================');
console.log(`Filtre -> Rol: ${role} | Sector: ${sector} | Industrie: ${industry} | Doar Scor Critic: ${onlyCritical}\n`);

const people = scrapeBucharestDecisionMakers({
  role: role === 'all' ? undefined : role,
  sector: sector === 'all' ? undefined : sector,
  industry: industry === 'all' ? undefined : industry,
  maxSaveScore: onlyCritical ? 49 : undefined,
});

console.log(`✓ S-au identificat ${people.length} factori de decizie în București:\n`);

people.forEach((p, idx) => {
  console.log(`[${idx + 1}] ${p.fullName} — ${p.roleTitle}`);
  console.log(`    🏢 Companie: ${p.companyName} (CUI: ${p.cui})`);
  console.log(`    📍 Locație: ${p.districtArea} (${p.sector})`);
  console.log(`    💼 Industrie & Echipă: ${p.industry} (${p.employeeRange})`);
  console.log(`    🔴 Scor SAVE: ${p.saveScore}/100 (${p.saveScore < 50 ? 'Critic' : 'Moderat'})`);
  console.log(`    💰 Economii Anuale Estimate: ${p.estimatedAnnualSavingsMin.toLocaleString('ro-RO')} – ${p.estimatedAnnualSavingsMax.toLocaleString('ro-RO')} lei`);
  console.log(`    🎯 Vulnerabilitate: ${p.keyPainPoints[0] || 'Tarife nealiniate'}`);
  console.log(`    📧 Email: ${p.email} | 📞 Tel: ${p.phone}`);
  console.log(`    🔗 LinkedIn: ${p.linkedinUrl}`);
  console.log('--------------------------------------------------------------------------------');
});

console.log('\n💡 Pentru interfața completă cu pitch-uri de vânzare personalizate și export CSV:');
console.log('👉 Deschide: http://localhost:3000/admin/bucharest-prospects');
console.log('================================================================================');
