import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const getSupabaseUrl = () => {
  // Jika berjalan di browser, arahkan ke proxy /api/supabase
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/supabase`;
  }
  // Jika berjalan di server (SSR), gunakan URL asli Supabase
  return supabaseUrl;
};

export const supabase = createClient(getSupabaseUrl(), supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});