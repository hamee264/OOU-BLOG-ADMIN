import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create a Supabase client. Keep a single instance across the app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // store the session in memory to avoid SSR/localStorage issues in some setups
    persistSession: true
  }
})

export default supabase