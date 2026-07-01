export type PrivateMediaFeature = 'bianca' | 'one-month'

const FEATURE_PREFIXES: Record<PrivateMediaFeature, string> = {
  bianca: '/bianca/',
  'one-month': '/one-month/',
}

/**
 * Rewrites a logical `/feature/name.jpg` path (as authored in the data files)
 * into the token-gated media route. The secret is only ever known once the
 * page has already validated it, so this always points at content the caller
 * is already allowed to see.
 */
export function privateMediaUrl(feature: PrivateMediaFeature, secret: string, logicalSrc: string) {
  const prefix = FEATURE_PREFIXES[feature]
  const relative = logicalSrc.startsWith(prefix) ? logicalSrc.slice(prefix.length) : logicalSrc.replace(/^\//, '')
  const encodedPath = relative
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/')

  return `/api/private-media/${feature}/${encodeURIComponent(secret)}/${encodedPath}`
}
