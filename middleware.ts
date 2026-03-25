import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = process.env.FINANCE_TOKEN
  if (!token) return NextResponse.next() // dev fallback

  const { pathname } = request.nextUrl

  // API routes have their own auth check — skip here
  if (pathname.startsWith('/api/')) return NextResponse.next()

  // Root path — 404
  if (pathname === '/') {
    return NextResponse.rewrite(new URL('/not-found', request.url))
  }

  // Extract the first path segment
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  // If the first segment doesn't match the token → generic 404
  if (firstSegment !== token) {
    return NextResponse.rewrite(new URL('/not-found', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
