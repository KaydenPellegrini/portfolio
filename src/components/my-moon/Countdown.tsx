'use client'

import { useEffect, useMemo, useState } from 'react'

const arrivalDate = new Date('2026-06-11T17:05:00+02:00')

function getTimeParts() {
  const distance = Math.max(0, arrivalDate.getTime() - Date.now())

  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  }
}

export default function Countdown() {
  const [timeParts, setTimeParts] = useState(() => getTimeParts())
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
    const timer = window.setInterval(() => setTimeParts(getTimeParts()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="rounded-[2rem] border border-white/15 bg-slate-950/45 p-5 shadow-2xl shadow-indigo-950/20 backdrop-blur md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/80">Countdown</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Until My Moon is here</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
        You are landing here on Thursday, 11 June at 17:05. I am very calm and normal about this. That is a lie.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {units.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-center">
            <p className="text-3xl font-bold text-white md:text-4xl">{String(value).padStart(2, '0')}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
