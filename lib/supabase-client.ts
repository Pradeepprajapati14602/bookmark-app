import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export const createClientComponentClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Only create the client if we're in a browser environment
  if (typeof window === 'undefined') {
    // Return a mock object for SSR that won't fail during build
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithOAuth: () => Promise.resolve({ data: null, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({
          order: () => ({
            then: (cb: any) => cb({ data: [], error: null }),
          }),
        }),
        insert: () => ({
          then: (cb: any) => cb({ error: null }),
        }),
        delete: () => ({
          eq: () => ({
            then: (cb: any) => cb({ error: null }),
          }),
        }),
      }),
      removeChannel: () => {},
      channel: () => ({
        on: () => ({ subscribe: () => {} }),
      }),
    } as any
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: window.localStorage,
    },
  })
}
