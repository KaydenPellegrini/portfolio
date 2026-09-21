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
}

export default nextConfig
