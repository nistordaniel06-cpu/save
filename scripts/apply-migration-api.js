const fs = require('fs');
const path = require('path');

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF || 'gklqipdcvgigpnyieurk';

if (!token) {
  console.error('Error: Please provide SUPABASE_ACCESS_TOKEN environment variable.');
  process.exit(1);
}

async function executeSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`Executing ${path.basename(filePath)} on Supabase project ${projectRef}...`);

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const responseText = await response.text();
  console.log(`Status for ${path.basename(filePath)}: ${response.status}`);

  if (!response.ok) {
    console.error('API Error Response:', responseText);
    throw new Error(`Failed to execute ${filePath}`);
  }

  console.log(`✓ ${path.basename(filePath)} executed successfully!`);
}

async function runAll() {
  const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    await executeSqlFile(path.join(migrationsDir, file));
  }
  console.log('\n✓ All migrations executed successfully!');
}

runAll().catch(err => {
  console.error(err);
  process.exit(1);
});
