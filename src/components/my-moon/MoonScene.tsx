'use client'

import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  size: number
  speed: number
  glow: number
}

const starCount = 120

export default function MoonScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: 0.5, y: 0.45, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let animationFrame = 0
    let width = 0
    let height = 0
    let pixelRatio = 1
    const stars: Star[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * pixelRatio)
      canvas.height = Math.floor(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      stars.length = 0
      for (let index = 0; index < starCount; index += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.8 + 0.4,
          speed: Math.random() * 0.18 + 0.03,
          glow: Math.random() * 0.7 + 0.25,
        })
      }
    }

    const drawCrater = (x: number, y: number, radius: number, lightX: number, lightY: number) => {
      const gradient = context.createRadialGradient(x - lightX * radius, y - lightY * radius, radius * 0.1, x, y, radius)
      gradient.addColorStop(0, 'rgba(255,255,255,0.24)')
      gradient.addColorStop(0.42, 'rgba(178,157,213,0.18)')
      gradient.addColorStop(1, 'rgba(29,18,57,0.38)')
      context.fillStyle = gradient
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height)

      const pointer = pointerRef.current
      const lightX = (pointer.x - 0.5) * 0.7
      const lightY = (pointer.y - 0.5) * 0.7
      const moonX = width * (0.5 + lightX * 0.08)
      const moonY = height * (0.48 + lightY * 0.08)
      const moonRadius = Math.min(width, height) * 0.28

      const sky = context.createRadialGradient(width * 0.5, height * 0.45, 0, width * 0.5, height * 0.45, width)
      sky.addColorStop(0, '#2a1648')
      sky.addColorStop(0.48, '#0c1022')
      sky.addColorStop(1, '#04050c')
      context.fillStyle = sky
      context.fillRect(0, 0, width, height)

      stars.forEach((star, index) => {
        const drift = Math.sin(time * 0.0004 + index) * 0.5
        star.y += star.speed
        if (star.y > height + 4) star.y = -4
        context.globalAlpha = star.glow + Math.sin(time * 0.002 + index) * 0.22
        context.fillStyle = index % 7 === 0 ? '#fbcfe8' : '#dbeafe'
        context.beginPath()
        context.arc(star.x + drift, star.y, star.size, 0, Math.PI * 2)
        context.fill()
      })
      context.globalAlpha = 1

      const halo = context.createRadialGradient(moonX, moonY, moonRadius * 0.6, moonX, moonY, moonRadius * 2.2)
      halo.addColorStop(0, 'rgba(244,214,255,0.34)')
      halo.addColorStop(0.52, 'rgba(147,197,253,0.12)')
      halo.addColorStop(1, 'rgba(244,214,255,0)')
      context.fillStyle = halo
      context.beginPath()
      context.arc(moonX, moonY, moonRadius * 2.2, 0, Math.PI * 2)
      context.fill()

      const moon = context.createRadialGradient(
        moonX - moonRadius * (0.35 + lightX * 0.4),
        moonY - moonRadius * (0.38 + lightY * 0.4),
        moonRadius * 0.08,
        moonX,
        moonY,
        moonRadius,
      )
      moon.addColorStop(0, '#fff9f0')
      moon.addColorStop(0.28, '#ffe7f5')
      moon.addColorStop(0.64, '#b9a3ff')
      moon.addColorStop(1, '#42206d')
      context.fillStyle = moon
      context.beginPath()
      context.arc(moonX, moonY, moonRadius, 0, Math.PI * 2)
      context.fill()

      drawCrater(moonX - moonRadius * 0.26, moonY - moonRadius * 0.22, moonRadius * 0.13, lightX, lightY)
      drawCrater(moonX + moonRadius * 0.22, moonY - moonRadius * 0.04, moonRadius * 0.09, lightX, lightY)
      drawCrater(moonX + moonRadius * 0.02, moonY + moonRadius * 0.28, moonRadius * 0.16, lightX, lightY)
      drawCrater(moonX - moonRadius * 0.32, moonY + moonRadius * 0.2, moonRadius * 0.07, lightX, lightY)

      context.strokeStyle = 'rgba(255,255,255,0.2)'
      context.lineWidth = 1
      context.beginPath()
      context.ellipse(moonX, moonY, moonRadius * 1.45, moonRadius * 0.28, -0.25, 0, Math.PI * 2)
      context.stroke()

      const satelliteAngle = time * 0.0007
      const satelliteX = moonX + Math.cos(satelliteAngle) * moonRadius * 1.42
      const satelliteY = moonY + Math.sin(satelliteAngle) * moonRadius * 0.28
      context.fillStyle = '#f9a8d4'
      context.beginPath()
      context.arc(satelliteX, satelliteY, 4, 0, Math.PI * 2)
      context.fill()

      animationFrame = window.requestAnimationFrame(draw)
    }

    const setPointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      pointerRef.current = {
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top) / rect.height,
        active: true,
      }
    }

    resize()
    animationFrame = window.requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', (event) => setPointer(event.clientX, event.clientY))
    canvas.addEventListener('pointerdown', (event) => setPointer(event.clientX, event.clientY))

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950 shadow-[0_28px_90px_rgba(12,10,30,0.55)]">
      <canvas ref={canvasRef} className="block aspect-square w-full touch-none" aria-label="Interactive moon scene" />
      <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs leading-5 text-slate-200 backdrop-blur">
        Touch or move over the moon. It reacts, because obviously this needed a physics-adjacent love planet.
      </div>
    </div>
  )
}
