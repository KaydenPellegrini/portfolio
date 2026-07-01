import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // private-media/ sits outside public/ on purpose (see the private-media
  // route handler) so Next's build tracing needs telling explicitly to bundle
  // it for deployment, or the gated photos/audio 404 in production.
  outputFileTracingIncludes: {
    '/api/private-media/**': ['./private-media/**/*'],
  },
}

export default nextConfig
