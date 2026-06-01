'use client'

import { useEffect, useRef } from 'react'
import { Flower2, Sparkles } from 'lucide-react'

type Seed = {
  x: number
  y: number
  size: number
  speed: number
  hue: number
  drift: number
}

type Bloom = {
  x: number
  y: number
  born: number
  hue: number
}

const seedCount = 42

export default function OneMonthHeroStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bloomsRef = useRef<Bloom[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let frame = 0
    let width = 0
    let height = 0
    let pixelRatio = 1
    const seeds: Seed[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * pixelRatio)
      canvas.height = Math.floor(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      seeds.length = 0
      for (let index = 0; index < seedCount; index += 1) {
        seeds.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 12 + 4,
          speed: Math.random() * 0.18 + 0.04,
          hue: Math.random() > 0.72 ? 330 : 176,
          drift: Math.random() * Math.PI * 2,
        })
      }
    }

    const drawFlower = (x: number, y: number, radius: number, hue: number, alpha: number) => {
      context.save()
      context.globalAlpha = alpha
      for (let petal = 0; petal < 8; petal += 1) {
        const angle = (Math.PI * 2 * petal) / 8
        const petalX = x + Math.cos(angle) * radius * 0.8
        const petalY = y + Math.sin(angle) * radius * 0.8
        const gradient = context.createRadialGradient(petalX, petalY, 0, petalX, petalY, radius)
        gradient.addColorStop(0, `hsla(${hue}, 95%, 78%, 0.95)`)
        gradient.addColorStop(1, `hsla(${hue}, 85%, 55%, 0)`)
        context.fillStyle = gradient
        context.beginPath()
        context.ellipse(petalX, petalY, radius * 0.65, radius * 0.35, angle, 0, Math.PI * 2)
        context.fill()
      }
      context.fillStyle = 'rgba(255,255,255,0.9)'
      context.beginPath()
      context.arc(x, y, radius * 0.25, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height)

      const sky = context.createLinearGradient(0, 0, width, height)
      sky.addColorStop(0, '#03201f')
      sky.addColorStop(0.5, '#063134')
      sky.addColorStop(1, '#170f25')
      context.fillStyle = sky
      context.fillRect(0, 0, width, height)

      context.strokeStyle = 'rgba(204,251,241,0.16)'
      context.lineWidth = 1
      for (let ring = 0; ring < 5; ring += 1) {
        context.beginPath()
        context.arc(width * 0.86, height * 0.18, 34 + ring * 34, 0.15, Math.PI * 1.3)
        context.stroke()
      }
      for (let line = 0; line < 7; line += 1) {
        const angle = -0.4 + line * 0.28
        context.beginPath()
        context.moveTo(width * 0.86, height * 0.18)
        context.lineTo(width * 0.86 + Math.cos(angle) * width * 0.42, height * 0.18 + Math.sin(angle) * width * 0.42)
        context.stroke()
      }

      context.strokeStyle = 'rgba(167,243,208,0.28)'
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(width * 0.2, height)
      for (let step = 0; step < 8; step += 1) {
        const y = height - step * (height / 7)
        const x = width * (0.22 + Math.sin(time * 0.0007 + step) * 0.08)
        context.lineTo(x, y)
      }
      context.stroke()

      seeds.forEach((seed, index) => {
        seed.y -= seed.speed
        if (seed.y < -20) {
          seed.y = height + 20
          seed.x = Math.random() * width
        }

        const x = seed.x + Math.sin(time * 0.001 + seed.drift) * 16
        const y = seed.y
        const pulse = 0.72 + Math.sin(time * 0.003 + index) * 0.24

        if (index % 5 === 0) {
          context.fillStyle = `hsla(${seed.hue}, 85%, 70%, ${0.18 * pulse})`
          context.fillRect(x, y, seed.size, seed.size)
        } else {
          drawFlower(x, y, seed.size, seed.hue, 0.32 * pulse)
        }
      })

      bloomsRef.current = bloomsRef.current.filter((bloom) => time - bloom.born < 1800)
      bloomsRef.current.forEach((bloom) => {
        const age = (time - bloom.born) / 1800
        drawFlower(bloom.x, bloom.y, 18 + age * 52, bloom.hue, 1 - age)
      })

      frame = window.requestAnimationFrame(draw)
    }

    const bloomAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      bloomsRef.current.push({
        x: clientX - rect.left,
        y: clientY - rect.top,
        born: performance.now(),
        hue: Math.random() > 0.5 ? 176 : 330,
      })
    }

    resize()
    frame = window.requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointerdown', (event) => bloomAt(event.clientX, event.clientY))
    canvas.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' && event.pressure > 0) bloomAt(event.clientX, event.clientY)
    })

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="relative min-h-[24rem] overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-950/50 shadow-[0_28px_90px_rgba(8,47,73,0.35)]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" aria-label="Touch-reactive turquoise garden" />
      <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-cyan-100/15 text-cyan-100">
            <Flower2 size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">Tap anywhere</p>
            <p className="mt-1 text-sm leading-6 text-slate-100">
              Make the garden bloom around her little universe.
            </p>
          </div>
          <Sparkles className="ml-auto mt-1 text-pink-100" size={18} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
