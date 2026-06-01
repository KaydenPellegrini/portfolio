'use client'

import { useEffect, useState } from 'react'

type Spark = {
  id: number
  x: number
  y: number
  size: number
  kind: 'spark' | 'heart' | 'star'
  hue: number
}

const KINDS: Spark['kind'][] = ['spark', 'heart', 'spark', 'star', 'spark']

export default function OneMonthAtmosphere() {
  const [sparks, setSparks] = useState<Spark[]>([])

  useEffect(() => {
    let id = 0
    let lastMove = 0

    const addSpark = (clientX: number, clientY: number) => {
      const now = performance.now()
      if (now - lastMove < 22) return
      lastMove = now

      id += 1
      const kind = KINDS[Math.floor(Math.random() * KINDS.length)]
      const spark: Spark = {
        id,
        x: clientX,
        y: clientY,
        size: Math.random() * 14 + (kind === 'heart' ? 14 : 10),
        kind,
        hue: Math.random() < 0.5 ? 176 : 330,
      }

      setSparks((current) => [...current.slice(-26), spark])
      window.setTimeout(() => {
        setSparks((current) => current.filter((item) => item.id !== spark.id))
      }, 1400)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        addSpark(event.clientX, event.clientY)
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (touch) addSpark(touch.clientX, touch.clientY)
    }

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (touch) addSpark(touch.clientX, touch.clientY)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {sparks.map((spark) => {
        if (spark.kind === 'heart') {
          return (
            <span
              key={spark.id}
              className="one-month-heart-trail absolute"
              style={{
                left: spark.x,
                top: spark.y,
                width: spark.size,
                height: spark.size,
                color: `hsl(${spark.hue}, 90%, 75%)`,
                filter: `drop-shadow(0 0 10px hsla(${spark.hue}, 90%, 70%, 0.8))`,
              }}
            >
              <svg viewBox="0 0 32 32" className="h-full w-full" fill="currentColor">
                <path d="M16 27s-9.5-5.5-12-12C2.5 11 5 5 10 5c3 0 5 2 6 4 1-2 3-4 6-4 5 0 7.5 6 6 10-2.5 6.5-12 12-12 12Z" />
              </svg>
            </span>
          )
        }

        if (spark.kind === 'star') {
          return (
            <span
              key={spark.id}
              className="one-month-heart-trail absolute"
              style={{
                left: spark.x,
                top: spark.y,
                width: spark.size,
                height: spark.size,
                color: `hsl(${spark.hue}, 90%, 80%)`,
                filter: `drop-shadow(0 0 10px hsla(${spark.hue}, 90%, 70%, 0.8))`,
              }}
            >
              <svg viewBox="0 0 32 32" className="h-full w-full" fill="currentColor">
                <path d="M16 2l3.5 9.5L29 12l-7.5 6 2.5 10L16 22l-8 6 2.5-10L3 12l9.5-.5L16 2z" />
              </svg>
            </span>
          )
        }

        return (
          <span
            key={spark.id}
            className="one-month-spark absolute rounded-full border border-cyan-100/50 bg-cyan-200/25 shadow-[0_0_22px_rgba(45,212,191,0.55)]"
            style={{
              left: spark.x,
              top: spark.y,
              width: spark.size,
              height: spark.size,
            }}
          />
        )
      })}
    </div>
  )
}
