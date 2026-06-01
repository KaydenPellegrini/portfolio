'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

type Particle = {
  id: number
  x: number
  y: number
  r: number
  color: string
  size: number
  delay: number
}

const PALETTE = ['#5eead4', '#f9a8d4', '#fde68a', '#c4b5fd', '#67e8f9', '#fda4af']

function buildBurst(count: number, seedOffset: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i + seedOffset) / count) * Math.PI * 2 + Math.random() * 0.4
    const distance = 140 + Math.random() * 260
    return {
      id: seedOffset * 1000 + i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      r: Math.random() * 1440 - 720,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      size: 6 + Math.random() * 10,
      delay: Math.random() * 180,
    }
  })
}

export default function ClosingFireworks({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [bursts, setBursts] = useState<Particle[][]>([])
  const triggeredRef = useRef(false)

  const fire = useCallback(() => {
    setBursts((current) => {
      const next = [...current, buildBurst(28, current.length)]
      return next.slice(-3)
    })
  }, [])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggeredRef.current) {
          triggeredRef.current = true
          fire()
          window.setTimeout(fire, 600)
          window.setTimeout(fire, 1200)
        }
      },
      { threshold: 0.4 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [fire])

  const flat = useMemo(() => bursts.flat(), [bursts])

  return (
    <div ref={sectionRef} className="relative" onClick={fire} role="presentation">
      {children}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {flat.map((p) => (
          <span
            key={p.id}
            className="one-month-confetti rounded-full"
            style={
              {
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                boxShadow: `0 0 14px ${p.color}`,
                animationDelay: `${p.delay}ms`,
                ['--x' as string]: `${p.x}px`,
                ['--y' as string]: `${p.y}px`,
                ['--r' as string]: `${p.r}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}
