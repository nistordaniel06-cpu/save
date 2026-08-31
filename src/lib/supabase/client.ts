import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gklqipdcvgigpnyieurk.supabase.co';
  const supabaseKey = 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    'sb_publishable_LcYvXgFPn_soICsP61nYTA_I-X_Ngd3';

  return createBrowserClient(supabaseUrl, supabaseKey);
}

export const supabase = createClient();
