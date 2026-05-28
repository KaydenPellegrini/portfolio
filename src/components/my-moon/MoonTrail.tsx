'use client'

import { useEffect, useState } from 'react'

type TrailMoon = {
  id: number
  x: number
  y: number
  size: number
}

export default function MoonTrail() {
  const [moons, setMoons] = useState<TrailMoon[]>([])

  useEffect(() => {
    let id = 0

    const addMoon = (clientX: number, clientY: number) => {
      id += 1
      const nextMoon = {
        id,
        x: clientX,
        y: clientY,
        size: Math.random() * 10 + 10,
      }

      setMoons((current) => [...current.slice(-16), nextMoon])
      window.setTimeout(() => {
        setMoons((current) => current.filter((moon) => moon.id !== nextMoon.id))
      }, 900)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        addMoon(event.clientX, event.clientY)
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (touch) addMoon(touch.clientX, touch.clientY)
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
      {moons.map((moon) => (
        <span
          key={moon.id}
          className="my-moon-trail absolute rounded-full bg-[radial-gradient(circle_at_32%_28%,#fff7ed_0%,#fde7f3_36%,#a78bfa_72%,#4c1d95_100%)] opacity-80 shadow-[0_0_18px_rgba(244,114,182,0.55)]"
          style={{
            left: moon.x,
            top: moon.y,
            width: moon.size,
            height: moon.size,
          }}
        />
      ))}
    </div>
  )
}
