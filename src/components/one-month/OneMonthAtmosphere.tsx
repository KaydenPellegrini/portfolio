'use client'

import { useEffect, useState } from 'react'

type Spark = {
  id: number
  x: number
  y: number
  size: number
}

export default function OneMonthAtmosphere() {
  const [sparks, setSparks] = useState<Spark[]>([])

  useEffect(() => {
    let id = 0

    const addSpark = (clientX: number, clientY: number) => {
      id += 1
      const spark = {
        id,
        x: clientX,
        y: clientY,
        size: Math.random() * 14 + 10,
      }

      setSparks((current) => [...current.slice(-20), spark])
      window.setTimeout(() => {
        setSparks((current) => current.filter((item) => item.id !== spark.id))
      }, 1200)
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

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('touchstart', onTouchStart, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchstart', onTouchStart)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {sparks.map((spark) => (
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
      ))}
    </div>
  )
}
