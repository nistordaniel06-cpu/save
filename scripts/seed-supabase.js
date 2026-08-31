const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF || 'gklqipdcvgigpnyieurk';

if (!token) {
  console.error('Error: Please provide SUPABASE_ACCESS_TOKEN environment variable.');
  process.exit(1);
}

async function seed() {
  console.log('Seeding demo data into Supabase (Nova Retail SRL)...');

  const seedSql = `
    -- 1. Create Demo Organization
    INSERT INTO public.organizations (id, name, cui, registration_number, industry, employee_range, monthly_opex_ron, save_score, is_demo, currency)
    VALUES (
      'a0000000-0000-0000-0000-000000000001',
      'Nova Retail SRL',
      'RO 38491024',
      'J40/12930/2018',
      'Retail & Distribuție Bunuri de Consum',
      '25-50 angajați',
      35700.00,
      74,
      true,
      'RON'
    ) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

    -- 2. Suppliers
    INSERT INTO public.suppliers (id, organization_id, name, cui, category, contact_email, rating, is_preferred)
    VALUES
      ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Vodafone România SA', 'RO 8970105', 'Telecom', 'corporate@vodafone.ro', 4.2, false),
      ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Google Ireland Ltd (Workspace & Cloud)', 'IE 6388047V', 'Software', 'billing@google.com', 4.8, true),
      ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'DPD România (Dynamic Parcel Distribution SA)', 'RO 17563040', 'Curierat', 'b2b@dpd.ro', 3.9, false),
      ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Lyreco România SRL', 'RO 18940210', 'Consumabile', 'orders@lyreco.ro', 4.5, true),
      ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'E.ON Energie România SA', 'RO 22043010', 'Energie', 'business@eon.ro', 3.6, false),
      ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'ContAudit & Tax Advisory SRL', 'RO 29401928', 'Servicii', 'office@contaudit.ro', 4.9, true)
    ON CONFLICT (id) DO NOTHING;
  `;

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: seedSql }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Seed error:', errText);
    process.exit(1);
  }

  console.log('✓ Demo data seeded successfully into Supabase!');
}

seed().catch(console.error);
