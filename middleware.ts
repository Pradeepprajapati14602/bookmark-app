import { NextResponse } from 'next/server'

export async function middleware() {
  // Pass all requests through - auth is handled in page components
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login'],
}
