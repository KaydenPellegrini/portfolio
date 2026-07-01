import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { matchesSecret } from '@/lib/secretGate'

export const dynamic = 'force-dynamic'

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function getDistanceKm(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const earthRadiusKm = 6371
  const latDelta = toRadians(toLat - fromLat)
  const lngDelta = toRadians(toLng - fromLng)
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(lngDelta / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Kayden's base coordinate stays a server-only env var so it never ships in
// client JS. The visitor's coordinate comes from the request body (their own
// browser geolocation) and is used once to compute a distance, not stored.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const secret = typeof body?.secret === 'string' ? body.secret : undefined
  const lat = body?.lat
  const lng = body?.lng

  if (!matchesSecret(secret, process.env.MY_MOON_TOKEN)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const kaydenLat = Number(process.env.KAYDEN_LAT)
  const kaydenLng = Number(process.env.KAYDEN_LNG)

  if (!Number.isFinite(kaydenLat) || !Number.isFinite(kaydenLng)) {
    return NextResponse.json({ error: 'Not configured' }, { status: 404 })
  }

  if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'Invalid location' }, { status: 400 })
  }

  const distanceKm = getDistanceKm(lat, lng, kaydenLat, kaydenLng)

  return NextResponse.json({ distanceKm })
}
