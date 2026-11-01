// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tkgbahpoqakpsddbelep.supabase.co'
// Gunakan kunci Legacy 'anon' yang panjang (dimulai dengan eyJ...)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrZ2JhaHBvcWFrcHNkZGJlbGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NDExOTEsImV4cCI6MjEwOTAxNzE5MX0.cEVUshwEc3Xlfvj-mu0o9LhR_lGXcwQAgVsXE_A9AyU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)