import { createClient } from '@supabase/supabase-js'

// KITA GUNAKAN PROXY VERCEL AGAR TIDAK DIBLOKIR JARINGAN
const supabaseUrl = '/api/supabase'
const supabaseAnonKey = 'sb_publishable_k968KS7dnXQ8XwW0o_Reiw_TG8hrU6y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)