import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Unrelated lockfiles sit in parent folders on this machine, and without this
  // Turbopack infers one of those as the workspace root and then resolves
  // dependencies against a node_modules that does not have them.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  // /fire-control is a standalone static page in public/fire-control. Its plain
  // <script src> tags carry no nonce, so it is kept out of src/proxy.ts and gets
  // a static policy here instead.
  async rewrites() {
    return [{ source: '/fire-control', destination: '/fire-control/index.html' }]
  },
  async headers() {
    const csp = [
      `default-src 'self'`,
      `script-src 'self'`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `img-src 'self' data:`,
      `font-src 'self' https://fonts.gstatic.com`,
      `connect-src 'self'`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'self'`,
    ].join('; ')
    const securityHeaders = [
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ]
    return [
      { source: '/fire-control', headers: securityHeaders },
      { source: '/fire-control/:path*', headers: securityHeaders },
    ]
  },
}

export default nextConfig
