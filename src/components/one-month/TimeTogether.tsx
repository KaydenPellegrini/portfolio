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

export default function TimeTogether({ startDate }: { startDate: string }) {
  const [timeParts, setTimeParts] = useState(() => getElapsedParts(startDate))
  const units = useMemo(
    () => [
      ['Days', timeParts.days],
      ['Hours', timeParts.hours],
      ['Minutes', timeParts.minutes],
      ['Seconds', timeParts.seconds],
    ],
    [timeParts],
  )

  useEffect(() => {
    const timer = window.setInterval(() => setTimeParts(getElapsedParts(startDate)), 1_000)
    return () => window.clearInterval(timer)
  }, [startDate])

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {units.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-white/15 bg-white/[0.08] p-3 text-center backdrop-blur">
          <p className="text-3xl font-bold text-white md:text-4xl">{String(value).padStart(2, '0')}</p>
          <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-cyan-100/75">{label}</p>
        </div>
      ))}
    </div>
  )
}
