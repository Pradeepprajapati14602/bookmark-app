import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export const createRouteSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
