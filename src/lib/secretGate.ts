import { timingSafeEqual } from 'node:crypto'

/**
 * Constant-time equality check for gating hidden pages/media on a secret
 * token. A plain `===` leaks how many leading characters matched through
 * response timing, which turns a long-enough guessing session into a
 * character-by-character attack. Both inputs must exist and match length
 * for `timingSafeEqual` to run; a mismatch takes the same-cost path either
 * way so length differences don't leak either.
 */
export function matchesSecret(candidate: string | undefined | null, expected: string | undefined | null): boolean {
  if (!expected || !candidate) return false

  const candidateBuf = Buffer.from(candidate)
  const expectedBuf = Buffer.from(expected)

  if (candidateBuf.length !== expectedBuf.length) {
    timingSafeEqual(candidateBuf, candidateBuf)
    return false
  }

  return timingSafeEqual(candidateBuf, expectedBuf)
}
