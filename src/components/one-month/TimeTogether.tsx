'use client'

import { useEffect, useMemo, useState } from 'react'

type TimeParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getElapsedParts(startDate: string): TimeParts {
  const distance = Math.max(0, Date.now() - new Date(startDate).getTime())

  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  }
}

function FlipDigit({ value, label, accent }: { value: number; label: string; accent: string }) {
  const display = String(value).padStart(2, '0')

  return (
    <div className="one-month-flip group relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] p-3 text-center backdrop-blur transition hover:-translate-y-0.5">
      <div className={`pointer-events-none absolute -inset-px rounded-2xl opacity-50 blur-2xl ${accent}`} />
      <div className="relative">
        <p
          key={display}
          className="one-month-flip-inner text-3xl font-bold tracking-tight text-white tabular-nums md:text-4xl"
        >
          {display}
        </p>
        <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-cyan-100/75">{label}</p>
      </div>
      <span className="pointer-events-none absolute inset-x-3 -bottom-px h-px one-month-ribbon" />
    </div>
  )
}

export default function TimeTogether({ startDate }: { startDate: string }) {
  const [timeParts, setTimeParts] = useState(() => getElapsedParts(startDate))
  const units = useMemo(
    () =>
      [
        ['Days', timeParts.days, 'bg-cyan-400/30'],
        ['Hours', timeParts.hours, 'bg-pink-400/25'],
        ['Minutes', timeParts.minutes, 'bg-yellow-300/25'],
        ['Seconds', timeParts.seconds, 'bg-violet-400/25'],
      ] as const,
    [timeParts],
  )

  useEffect(() => {
    const timer = window.setInterval(() => setTimeParts(getElapsedParts(startDate)), 1_000)
    return () => window.clearInterval(timer)
  }, [startDate])

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {units.map(([label, value, accent]) => (
        <FlipDigit key={label} value={value as number} label={label as string} accent={accent as string} />
      ))}
    </div>
  )
}
