import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ogciwrvnyrbokcrxdwid.supabase.co'
// Remplacez par votre vraie clé Anon (celle qui commence par eyJ...)
const supabaseKey = 'sb_publishable_i-v1p4JtJAAmHSxuPG4G6g_jTzFN4gJ' 

export const supabase = createClient(supabaseUrl, supabaseKey)