'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase-client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClientComponentClient()

    // supabase-js v2 automatically detects the ?code= param (PKCE) or
    // #access_token hash (implicit) and exchanges it when the client
    // initialises with detectSessionInUrl: true (the default).
    // We just need to wait for the SIGNED_IN event.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        router.replace('/')
      }
    })

    // Fallback: if no event fires within 5 s, redirect anyway
    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      router.replace('/')
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-10 w-10 text-blue-500"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
