'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'

function parseCoordinate(value: string | undefined) {
  return value ? Number(value) : Number.NaN
}

const kaydenLat = parseCoordinate(process.env.NEXT_PUBLIC_KAYDEN_LAT)
const kaydenLng = parseCoordinate(process.env.NEXT_PUBLIC_KAYDEN_LNG)

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

export default function DistanceFromKayden() {
  const [distance, setDistance] = useState<number | null>(null)
  const [status, setStatus] = useState('No location is stored. Your browser only uses it for this little calculation.')

  const hasBaseLocation = Number.isFinite(kaydenLat) && Number.isFinite(kaydenLng)

  const calculateDistance = () => {
    if (!hasBaseLocation) {
      setStatus('Kayden still needs to set his base location for this to work.')
      return
    }

    if (!navigator.geolocation) {
      setStatus('Your browser does not support location sharing here.')
      return
    }

    setStatus('Asking your browser where you are, just for this moment.')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextDistance = getDistanceKm(
          position.coords.latitude,
          position.coords.longitude,
          kaydenLat,
          kaydenLng,
        )

        setDistance(nextDistance)
        setStatus('Calculated in your browser. Not saved anywhere.')
      },
      () => {
        setStatus('Location was not shared, and that is completely okay.')
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
    )
  }

  return (
    <section className="rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 shadow-2xl shadow-sky-950/20 backdrop-blur md:p-7">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-full border border-sky-200/20 bg-sky-200/10 text-sky-100">
          <MapPin size={18} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/80">Distance</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">A tiny bridge across the map</h2>
        </div>
      </div>

      {distance === null ? (
        <p className="mt-5 text-sm leading-6 text-slate-300">{status}</p>
      ) : (
        <p className="mt-5 text-3xl font-bold text-white">
          About {Math.round(distance).toLocaleString()} km
          <span className="mt-2 block text-sm font-normal leading-6 text-slate-300">between you and pickeltjie.</span>
        </p>
      )}

      <button
        type="button"
        onClick={calculateDistance}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-sky-200/30 bg-sky-200/10 px-4 py-2 text-sm font-semibold text-sky-50 transition hover:bg-sky-200/20 focus:outline-none focus:ring-2 focus:ring-sky-200/60"
      >
        <MapPin size={16} aria-hidden="true" />
        See how far you are from pickeltjie
      </button>
    </section>
  )
}
