import { createClient } from '@supabase/supabase-js'

// Trik: Gunakan URL Vercel sebagai basis, lalu arahkan ke proxy /api/supabase
const getSupabaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Jika berjalan di browser (Vercel), gunakan URL asli + proxy
    return `${window.location.origin}/api/supabase`
  }
  // Fallback untuk server-side rendering
  return 'https://tkgbahpoqakspsddbelep.supabase.co'
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = 'sb_publishable_k968KS7dnXQ8XwW0o_Reiw_TG8hrU6y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)