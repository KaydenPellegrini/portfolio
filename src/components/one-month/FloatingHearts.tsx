'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type Piece = {
  id: number
  left: number
  size: number
  delay: number
  duration: number
  drift: number
  glyph: string
  color: string
  opacity: number
}

type Star = {
  id: number
  left: number
  top: number
  size: number
  delay: number
  duration: number
}

const GLYPHS = ['♡', '✦', '❀', '✿', '✧', '❤', '✺']
const COLORS = ['#5eead4', '#f9a8d4', '#fde68a', '#c4b5fd', '#bef264', '#67e8f9']

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function FloatingHearts({
  pieces = 34,
  stars = 60,
}: {
  pieces?: number
  stars?: number
}) {
  // Avoid hydration mismatch: only render on client.
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  const fallingPieces = useMemo<Piece[]>(() => {
    return Array.from({ length: pieces }, (_, id) => ({
      id,
      left: rand(0, 100),
      size: rand(10, 26),
      delay: -rand(0, 22),
      duration: rand(14, 28),
      drift: rand(-90, 90),
      glyph: GLYPHS[Math.floor(rand(0, GLYPHS.length))],
      color: COLORS[Math.floor(rand(0, COLORS.length))],
      opacity: rand(0.45, 0.95),
    }))
  }, [pieces])

  const twinkleStars = useMemo<Star[]>(() => {
    return Array.from({ length: stars }, (_, id) => ({
      id,
      left: rand(0, 100),
      top: rand(0, 100),
      size: rand(1.5, 3.5),
      delay: -rand(0, 4),
      duration: rand(2.4, 5.2),
    }))
  }, [stars])

  if (!mounted) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 one-month-aurora" />

      {twinkleStars.map((star) => (
        <span
          key={`s-${star.id}`}
          className="one-month-twinkle absolute rounded-full bg-white"
          style={
            {
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow: '0 0 6px rgba(255,255,255,0.85)',
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            } as CSSProperties
          }
        />
      ))}

      {fallingPieces.map((piece) => (
        <span
          key={`p-${piece.id}`}
          className="one-month-petal"
          style={
            {
              left: `${piece.left}%`,
              fontSize: `${piece.size}px`,
              color: piece.color,
              opacity: piece.opacity,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              ['--drift' as string]: `${piece.drift}px`,
            } as CSSProperties
          }
        >
          {piece.glyph}
        </span>
      ))}
    </div>
  )
}
