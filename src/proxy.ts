import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development'
  const requestHeaders = new Headers(request.headers)

  // Nonce-based strict-dynamic script-src on every page. Next renders its
  // bootstrap and RSC payload as inline <script> tags and picks the nonce up
  // from the Content-Security-Policy request header set below, so without a
  // nonce those scripts are blocked and the page never hydrates. This does opt
  // the public pages into dynamic rendering, which is the price of not falling
  // back to 'unsafe-inline'.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  requestHeaders.set('x-nonce', nonce)
  const scriptSrc = `'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`

  // style-src stays 'unsafe-inline' everywhere: the app renders React inline
  // `style={{...}}` attributes (chart bars, animation timings), and CSP has no
  // per-attribute nonce for the style="" attribute.
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
    'geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
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
