const fs = require('fs');
const path = require('path');

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF || 'gklqipdcvgigpnyieurk';

if (!token) {
  console.error('Error: Please provide SUPABASE_ACCESS_TOKEN environment variable.');
  process.exit(1);
}

async function executeSql() {
  const sqlPath = path.resolve(__dirname, '../supabase/migrations/20260831000000_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log(`Executing SQL migration on Supabase project ${projectRef}...`);

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const responseText = await response.text();
  console.log(`Response status: ${response.status}`);

  if (!response.ok) {
    console.error('API Error Response:', responseText);
    process.exit(1);
  }

  console.log('✓ SQL Migration executed successfully via Supabase Management API!');
}

executeSql().catch((err) => {
  console.error('Failed to execute migration:', err);
  process.exit(1);
});
