'use client'

import { useEffect, useState } from 'react'

export default function OpeningCurtain() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1700)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="one-month-curtain" aria-hidden="true">
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-14 w-14 one-month-heartbeat">
            <svg viewBox="0 0 32 32" className="h-full w-full" fill="none" stroke="#5eead4" strokeWidth="2.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 27s-9.5-5.5-12-12C2.5 11 5 5 10 5c3 0 5 2 6 4 1-2 3-4 6-4 5 0 7.5 6 6 10-2.5 6.5-12 12-12 12Z"
              />
            </svg>
          </div>
          <p
            className="text-sm font-semibold uppercase tracking-[0.45em] text-cyan-100/80"
            style={{ animation: 'one-month-letter 800ms ease-out forwards' }}
          >
            One Month
          </p>
        </div>
      </div>
    </div>
  )
}
