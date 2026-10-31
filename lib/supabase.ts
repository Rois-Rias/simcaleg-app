import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tkgbahpoqakspsddbelep.supabase.co'
// MENGGUNAKAN KUNCI BARU DARI SUPABASE
const supabaseAnonKey = 'sb_publishable_k968KS7dnXQ8XwW0o_Reiw_TG8hrUGy'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)