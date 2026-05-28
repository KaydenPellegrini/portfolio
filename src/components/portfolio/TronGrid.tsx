'use client'

import { useEffect, useRef } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right'

type GridPoint = {
  x: number
  y: number
}

type Rider = {
  x: number
  y: number
  targetX: number
  targetY: number
  direction: Direction
  hue: number
  speed: number
  progress: number
  life: number
  maxLife: number
  trail: GridPoint[]
}

const gridSize = 30
const riderCount = 26
const maxTrail = 20

function nextCell(x: number, y: number, direction: Direction): GridPoint {
  if (direction === 'up') return { x, y: y - 1 }
  if (direction === 'down') return { x, y: y + 1 }
  if (direction === 'left') return { x: x - 1, y }
  return { x: x + 1, y }
}

function turnOptions(direction: Direction): Direction[] {
  if (direction === 'up' || direction === 'down') return ['left', 'right']
  return ['up', 'down']
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function makeRider(columns: number, rows: number): Rider {
  const directions: Direction[] = ['up', 'down', 'left', 'right']
  const direction = directions[Math.floor(Math.random() * directions.length)]
  const x = Math.floor(Math.random() * columns)
  const y = Math.floor(Math.random() * rows)
  const target = nextCell(x, y, direction)

  return {
    x,
    y,
    targetX: clamp(target.x, 0, columns - 1),
    targetY: clamp(target.y, 0, rows - 1),
    direction,
    hue: Math.random() > 0.22 ? 144 : 278,
    speed: Math.random() * 0.42 + 0.55,
    progress: Math.random(),
    life: 0,
    maxLife: Math.random() * 7 + 7,
    trail: [{ x, y }],
  }
}

export default function TronGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let width = 0
    let height = 0
    let columns = 0
    let rows = 0
    let animationFrame = 0
    let lastFrame = performance.now()
    let riders: Rider[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      columns = Math.ceil(width / gridSize)
      rows = Math.ceil(height / gridSize)
      canvas.width = Math.floor(width * pixelRatio)
      canvas.height = Math.floor(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      riders = Array.from({ length: riderCount }, () => makeRider(columns, rows))
    }

    const drawGrid = () => {
      context.strokeStyle = 'rgba(0,255,136,0.072)'
      context.lineWidth = 1

      for (let x = 0; x <= width; x += gridSize) {
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, height)
        context.stroke()
      }

      for (let y = 0; y <= height; y += gridSize) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(width, y)
        context.stroke()
      }
    }

    const chooseTarget = (rider: Rider, occupied: Set<string>) => {
      const choices = Math.random() > 0.7 ? [...turnOptions(rider.direction), rider.direction] : [rider.direction]

      for (const direction of choices) {
        const candidate = nextCell(rider.x, rider.y, direction)
        const key = `${candidate.x}:${candidate.y}`
        const isInside = candidate.x >= 0 && candidate.y >= 0 && candidate.x < columns && candidate.y < rows

        if (isInside && !occupied.has(key)) {
          rider.direction = direction
          rider.targetX = candidate.x
          rider.targetY = candidate.y
          return
        }
      }

      Object.assign(rider, makeRider(columns, rows))
    }

    const moveRider = (rider: Rider, occupied: Set<string>, deltaSeconds: number) => {
      rider.life += deltaSeconds
      if (rider.life > rider.maxLife) {
        rider.trail = rider.trail.slice(1)
        if (rider.trail.length <= 1) {
          Object.assign(rider, makeRider(columns, rows))
        }
      }

      rider.progress += rider.speed * deltaSeconds
      if (rider.progress < 1) return

      rider.progress = 0
      rider.x = rider.targetX
      rider.y = rider.targetY
      rider.trail = [...rider.trail, { x: rider.x, y: rider.y }].slice(-maxTrail)
      chooseTarget(rider, occupied)
    }

    const getHead = (rider: Rider): GridPoint => ({
      x: rider.x + (rider.targetX - rider.x) * rider.progress,
      y: rider.y + (rider.targetY - rider.y) * rider.progress,
    })

    const drawPath = (points: GridPoint[]) => {
      points.forEach((point, index) => {
        const x = point.x * gridSize
        const y = point.y * gridSize
        if (index === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      })
    }

    const drawRider = (rider: Rider) => {
      const color = rider.hue === 144 ? '0,255,136' : '170,80,255'
      const points = [...rider.trail, getHead(rider)]
      if (points.length < 2) return
      const fade = clamp(1 - Math.max(0, rider.life - rider.maxLife + 2.6) / 2.6, 0, 1)

      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.shadowColor = `rgba(${color},${0.82 * fade})`

      points.slice(1).forEach((point, index) => {
        const previous = points[index]
        const age = index / Math.max(points.length - 1, 1)
        const segmentAlpha = fade * (0.12 + age * 0.78)

        context.shadowBlur = 18 * segmentAlpha
        context.lineWidth = 1.4 + age * 1.1
        context.strokeStyle = `rgba(${color},${segmentAlpha})`
        context.beginPath()
        drawPath([previous, point])
        context.stroke()
      })

      const head = getHead(rider)
      context.fillStyle = `rgba(${color},${0.98 * fade})`
      context.shadowBlur = 30 * fade
      context.beginPath()
      context.arc(head.x * gridSize, head.y * gridSize, 3.6, 0, Math.PI * 2)
      context.fill()
      context.shadowBlur = 0
    }

    const draw = (time = performance.now()) => {
      const deltaSeconds = Math.min((time - lastFrame) / 1000, 0.05)
      lastFrame = time

      const pointer = pointerRef.current
      context.clearRect(0, 0, width, height)

      const background = context.createRadialGradient(
        width * pointer.x,
        height * pointer.y,
        0,
        width * pointer.x,
        height * pointer.y,
        Math.max(width, height) * 0.75,
      )
      background.addColorStop(0, 'rgba(106,13,173,0.42)')
      background.addColorStop(0.45, 'rgba(13,0,26,0.9)')
      background.addColorStop(1, 'rgba(0,0,0,1)')
      context.fillStyle = background
      context.fillRect(0, 0, width, height)

      drawGrid()

      const occupied = new Set<string>()
      riders.forEach((rider) => {
        rider.trail.forEach((point) => occupied.add(`${point.x}:${point.y}`))
        occupied.add(`${rider.targetX}:${rider.targetY}`)
      })
      riders.forEach((rider) => moveRider(rider, occupied, deltaSeconds))
      riders.forEach(drawRider)

      animationFrame = window.requestAnimationFrame(draw)
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      }
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', onPointerMove)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
