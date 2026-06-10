'use client'

import { useEffect, useRef, type CSSProperties } from 'react'

// Integer-only PRNG (mulberry32). Bitwise math is identical on the Node server
// and the browser, and every emitted value is quantised with toFixed — so the
// starfield is byte-for-byte identical on both sides (no hydration mismatch).
// A Math.sin-based generator looks deterministic but its ULP differences across
// engines surface once amplified, which is exactly what we avoid here.
const mulberry32 = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const q = (n: number, p = 3) => Number(n.toFixed(p))

const STAR_HUES = ['#d6d9ff', '#a5b4fc', '#93b4ff']
const rng = mulberry32(0x9e3779b9)
const STARS = Array.from({ length: 72 }, () => ({
  left: q(rng() * 100),
  top: q(rng() * 100),
  size: q(1 + rng() * 2.3),
  delay: q(rng() * 7),
  dur: q(3 + rng() * 5),
  min: q(0.06 + rng() * 0.22),
  hue: STAR_HUES[Math.floor(rng() * 3)],
}))

/**
 * Fixed celestial backdrop: a midnight-navy gradient, slow royal-purple and
 * royal-blue auroras, a fine silver starfield, and a cursor-following glow
 * (desktop + motion-allowed only). Sits behind all page content.
 */
export default function Atmosphere() {
  const glowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = glowRef.current
    if (!el) return

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduce.matches) return

    let raf = 0
    let tx = window.innerWidth / 2
    let ty = window.innerHeight * 0.3
    let cx = tx
    let cy = ty

    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
    }

    const tick = () => {
      cx += (tx - cx) * 0.08
      cy += (ty - cy) * 0.08
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }

    el.style.opacity = '1'
    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,#141a44_0%,#0b1026_45%,#070a1f_100%)]" />

      <div
        className="bianca-aurora absolute -left-[15%] top-[6%] h-[55vh] w-[55vh] rounded-full bg-[#7c3aed]/25 blur-[90px]"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="bianca-aurora absolute -right-[12%] top-[26%] h-[50vh] w-[50vh] rounded-full bg-[#2563eb]/22 blur-[90px]"
        style={{ animationDelay: '-9s' }}
      />
      <div
        className="bianca-aurora absolute bottom-[-12%] left-1/2 h-[60vh] w-[70vh] -translate-x-1/2 rounded-full bg-[#a5b4fc]/12 blur-[100px]"
        style={{ animationDelay: '-16s' }}
      />

      {STARS.map((s, i) => (
        <span
          key={i}
          className="bianca-twinkle absolute rounded-full"
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              backgroundColor: s.hue,
              boxShadow: `0 0 ${(s.size * 3).toFixed(2)}px ${s.hue}`,
              '--bx-delay': `${s.delay}s`,
              '--bx-dur': `${s.dur}s`,
              '--bx-min': `${s.min}`,
              '--bx-max': '0.95',
            } as CSSProperties
          }
        />
      ))}

      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[34vh] w-[34vh] rounded-full bg-[#7c3aed]/12 opacity-0 blur-[80px] transition-opacity duration-700"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,transparent_55%,rgba(7,10,31,0.6)_100%)]" />
    </div>
  )
}
