'use client'

import { createClientComponentClient } from '@/lib/supabase-client'
import { useState, useRef } from 'react'
// import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabaseRef = useRef<ReturnType<typeof createClientComponentClient> | null>(null)
  // const router = useRouter()

  if (!supabaseRef.current) {
    supabaseRef.current = createClientComponentClient()
  }

  const supabase = supabaseRef.current

  const handleGoogleLogin = async () => {
    console.log('[Login] Initiating Google OAuth with implicit grant...')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // Use implicit grant flow to avoid PKCE issues
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('[Login] Error logging in:', error)
      alert('Failed to log in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Smart Bookmarks
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Save, organize, and manage your bookmarks
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21v2.77h3.57c2.08-1.04 2.23-2.21V5a2 2 0 012-2v16l-7-3.5L5 21V5z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 5.29-1.93 0 5.373 0 5.46C3 3 19 0 5.373 5.46 8.55 13 12 12V0c0 5.373 0 5.46 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="font-medium">
                  {loading ? 'Signing in...' : 'Sign in with Google'}
                </span>
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Your bookmarks are private and secure
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Protected by Supabase Row Level Security
        </p>
      </div>
    </div>
  )
}
