import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const HIDDEN_PAGE_PREFIXES = ['/bianca/', '/my-moon/', '/one-month/']
const RATE_LIMITED_PREFIXES = [...HIDDEN_PAGE_PREFIXES, '/api/private-media/']

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix))
}

// Best-effort, per-instance limiter. Vercel runs many isolated instances with
// no shared memory, so this does not enforce one true global limit — it just
// raises the bar above a naive single-process brute-force script against the
// secret-token routes. A durable store (e.g. Upstash) is needed for a real
// distributed limit.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_HITS = 30
const recentHits = new Map<string, number[]>()

function isRateLimited(key: string) {
  const now = Date.now()
  const recent = (recentHits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  recentHits.set(key, recent)
  return recent.length > RATE_LIMIT_MAX_HITS
}

function clientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (matchesPrefix(pathname, RATE_LIMITED_PREFIXES) && isRateLimited(clientIp(request))) {
    return new NextResponse('Too many attempts. Try again later.', { status: 429 })
  }

  const isDev = process.env.NODE_ENV === 'development'
  const requestHeaders = new Headers(request.headers)

  // Nonce-based strict-dynamic script-src only for the hidden pages, which are
  // already dynamically rendered (they gate on process.env/params per request).
  // Applying it site-wide would force the static public pages into dynamic
  // rendering too — not worth the trade-off for a portfolio with no user input.
  let scriptSrc = `'self'${isDev ? " 'unsafe-eval'" : ''}`
  if (matchesPrefix(pathname, HIDDEN_PAGE_PREFIXES)) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    requestHeaders.set('x-nonce', nonce)
    scriptSrc = `'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`
  }

  // style-src stays 'unsafe-inline' everywhere: the app renders plenty of
  // React inline `style={{...}}` attributes (skill bars, animation timings),
  // and CSP has no per-attribute nonce for the style="" attribute.
  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self' data:`,
    `connect-src 'self'`,
    `media-src 'self'`,
    `worker-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ')

  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(self), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  )
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
