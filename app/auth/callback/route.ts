// import { createRouteSupabaseClient } from '@/lib/supabase-route'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)

  try {

    return NextResponse.redirect(new URL('/', requestUrl.origin))

  } catch (err) {
    console.error('[Auth Callback] Error:', err)
    return NextResponse.redirect(new URL('/login?error=server_error', requestUrl.origin))
  }
}
