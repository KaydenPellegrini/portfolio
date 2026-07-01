import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { matchesSecret } from '@/lib/secretGate'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ secret: string }>
}

// The meaningful-place coordinate stays server-only and is only ever handed
// out as a redirect target, so it never appears in the page's HTML/JS.
export async function GET(_request: NextRequest, { params }: Params) {
  const { secret } = await params

  if (!matchesSecret(secret, process.env.MY_MOON_TOKEN)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const lat = Number(process.env.MY_MOON_PLACE_LAT)
  const lng = Number(process.env.MY_MOON_PLACE_LNG)
  const name = process.env.MY_MOON_PLACE_NAME || 'Our little beginning'

  const query = Number.isFinite(lat) && Number.isFinite(lng) ? `${lat},${lng}` : name

  return NextResponse.redirect(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`)
}
