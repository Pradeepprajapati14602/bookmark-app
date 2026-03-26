'use client'

import { createClientComponentClient } from '@/lib/supabase-client'
import { Bookmark } from '@/types/database'
import { useEffect, useState, useRef } from 'react'
import BookmarkForm from '@/components/BookmarkForm'
import BookmarkList from '@/components/BookmarkList'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const pathname = usePathname()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [checkedSession, setCheckedSession] = useState(false)
  const supabaseRef = useRef<ReturnType<typeof createClientComponentClient> | null>(null)

  if (!supabaseRef.current) {
    supabaseRef.current = createClientComponentClient()
  }

  const supabase = supabaseRef.current

  useEffect(() => {
    console.log('[Page] Checking session...')

    // Use getSession instead of getUser - more reliable for initial load
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      console.log('[Page] getSession result:', { hasSession: !!session, email: session?.user?.email })

      setCheckedSession(true)

      if (session?.user) {
        setUser({ email: session.user.email || '' })
        fetchBookmarks()
        setIsAuthenticating(false)
      } else {
        // No session - redirect to login
        console.log('[Page] No session, redirecting to login')
        router.replace('/login')
        setIsAuthenticating(false)
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      console.log('[Page] Auth state changed:', { event, hasSession: !!session, email: session?.user?.email })

      if (session?.user) {
        setUser({ email: session.user.email || '' })
        fetchBookmarks()
        // If we're on login page and got session, redirect to home
        if (pathname === '/login') {
          console.log('[Page] Got session on login page, redirecting to home')
          router.replace('/')
        }
      } else {
        setUser(null)
        setBookmarks([])
        // Redirect to login if we're on a protected page
        if (pathname !== '/login') {
          console.log('[Page] Lost session, redirecting to login')
          router.replace('/login')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  // Add a retry mechanism for initial session check
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 3

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[Page] Retry check:', { attempt: retryCount + 1, hasSession: !!session })

      if (session?.user) {
        setUser({ email: session.user.email || '' })
        fetchBookmarks()
        setIsAuthenticating(false)
        return true
      }
      return false
    }

    const attemptCheck = async () => {
      if (retryCount < maxRetries) {
        retryCount++
        const hasSession = await checkSession()
        if (hasSession) {
          return // Success!
        }
        // Wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      setIsAuthenticating(false)
    }

    if (!user && !checkedSession) {
      attemptCheck()
    }
  }, [user, checkedSession, supabase])

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookmarks(data || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Set up real-time subscription (only if we have a user)
    if (!user) return

    const channel: RealtimeChannel = supabase
      .channel('bookmarks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
        },
        (payload: any) => {
          console.log('[Page] Realtime event:', payload.eventType, payload)
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setBookmarks((prev) =>
              prev.map((b) => (b.id === payload.new.id ? (payload.new as Bookmark) : b))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user])

  const handleLogout = async () => {
    console.log('[Page] Logging out...')
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-blue-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Smart Bookmarks
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            My Bookmarks
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Save and organize your favorite links with real-time sync
          </p>
        </div>

        <div className="mb-8">
          <BookmarkForm onBookmarkAdded={fetchBookmarks} />
        </div>

        <BookmarkList bookmarks={bookmarks} loading={loading} />
      </main>
    </div>
  )
}
