'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Check, Droplets, Heart, RotateCcw, Sparkles } from 'lucide-react'

type Region = {
  id: string
  number: number
  label: string
  d: string
  textX: number
  textY: number
}

const palette = [
  { number: 1, name: 'Turquoise', color: '#2dd4bf', text: '#062826' },
  { number: 2, name: 'Rose', color: '#f9a8d4', text: '#3b1025' },
  { number: 3, name: 'Leaf', color: '#86efac', text: '#06351d' },
  { number: 4, name: 'Sun', color: '#fde68a', text: '#3f2d08' },
  { number: 5, name: 'Berry', color: '#c4b5fd', text: '#211047' },
]

/**
 * Scene: a single bouquet for Kelly.
 *
 * Three flowers rise from a turquoise vase, framed by two long leaves and a
 * tiny floating heart. Every region is part of one drawing — no orphans, no
 * scattered icons. The flowers share a six-petal silhouette so the picture
 * reads as one composition.
 */
const regions: Region[] = [
  {
    id: 'vase',
    number: 1,
    label: 'turquoise vase',
    d: 'M255 345 Q245 365 222 380 Q200 410 215 450 Q230 488 280 490 Q330 488 345 450 Q360 410 338 380 Q315 365 305 345 Z',
    textX: 280,
    textY: 432,
  },
  {
    id: 'leaf-left',
    number: 3,
    label: 'left leaf',
    d: 'M260 345 Q195 285 120 240 Q180 305 260 345 Z',
    textX: 195,
    textY: 308,
  },
  {
    id: 'leaf-right',
    number: 3,
    label: 'right leaf',
    d: 'M300 345 Q365 285 440 240 Q380 305 300 345 Z',
    textX: 365,
    textY: 308,
  },
  {
    id: 'flower-left-petals',
    number: 2,
    label: 'pink bloom',
    d: 'M220 180 Q196 189 200 215 Q180 198 160 215 Q164 189 140 180 Q164 171 160 145 Q180 162 200 145 Q196 171 220 180 Z',
    textX: 180,
    textY: 150,
  },
  {
    id: 'flower-left-center',
    number: 4,
    label: 'centre of the pink bloom',
    d: 'M194 180 A14 14 0 1 1 166 180 A14 14 0 1 1 194 180 Z',
    textX: 180,
    textY: 184,
  },
  {
    id: 'flower-top-petals',
    number: 5,
    label: 'berry bloom on top',
    d: 'M332 135 Q299 146 306 180 Q280 157 254 180 Q261 146 228 135 Q261 124 254 90 Q280 113 306 90 Q299 124 332 135 Z',
    textX: 280,
    textY: 100,
  },
  {
    id: 'flower-top-center',
    number: 2,
    label: 'centre of the berry bloom',
    d: 'M298 135 A18 18 0 1 1 262 135 A18 18 0 1 1 298 135 Z',
    textX: 280,
    textY: 139,
  },
  {
    id: 'flower-right-petals',
    number: 4,
    label: 'yellow daisy',
    d: 'M420 180 Q396 189 400 215 Q380 198 360 215 Q364 189 340 180 Q364 171 360 145 Q380 162 400 145 Q396 171 420 180 Z',
    textX: 380,
    textY: 150,
  },
  {
    id: 'flower-right-center',
    number: 3,
    label: 'centre of the daisy',
    d: 'M394 180 A14 14 0 1 1 366 180 A14 14 0 1 1 394 180 Z',
    textX: 380,
    textY: 184,
  },
  {
    id: 'heart',
    number: 2,
    label: 'little heart',
    d: 'M482 116 C454 88 454 70 468 64 C475 62 480 66 482 74 C484 66 489 62 496 64 C510 70 510 88 482 116 Z',
    textX: 482,
    textY: 90,
  },
]

const lineArt = [
  // Three stems from the vase neck to each flower.
  'M268 345 Q240 285 185 218',
  'M280 345 L280 187',
  'M292 345 Q320 285 375 218',
  // Rim of the vase opening (suggests a 3D ellipse).
  'M252 350 Q280 362 308 350',
  // Soft highlight on the vase body.
  'M236 395 Q244 440 240 472',
  // Ground baseline with a couple of tiny grass tufts.
  'M60 515 Q280 545 500 515',
  'M120 522 L125 510 L130 522',
  'M420 522 L425 510 L430 522',
  // Sparkles tucked around the bouquet.
  'M82 110 L102 110 M92 100 L92 120',
  'M512 230 L526 230 M519 223 L519 237',
  'M60 400 L76 400 M68 392 L68 408',
  'M500 430 L514 430 M507 423 L507 437',
  // Two small falling petals.
  'M110 280 Q102 292 100 285 Q98 278 108 270 Q116 274 110 280 Z',
  'M482 320 Q490 332 492 325 Q494 318 484 310 Q476 314 482 320 Z',
]

function getSwatch(number: number) {
  return palette.find((item) => item.number === number) ?? palette[0]
}

type Splash = { id: number; x: number; y: number; color: string }
type Confetti = { id: number; x: number; y: number; r: number; color: string; size: number; delay: number }

export default function ColourByNumber() {
  const [selectedNumber, setSelectedNumber] = useState(1)
  const [coloured, setColoured] = useState<Record<string, number>>({})
  const [message, setMessage] = useState('Pick 1 and start with the turquoise vase.')
  const [splashes, setSplashes] = useState<Splash[]>([])
  const [confetti, setConfetti] = useState<Confetti[]>([])
  const splashSeed = useRef(0)
  const celebratedRef = useRef(false)
  const completedCount = Object.keys(coloured).length
  const completed = useMemo(() => regions.every((region) => coloured[region.id] === region.number), [coloured])

  const colourRegion = (region: Region) => {
    if (selectedNumber !== region.number) {
      setMessage(`${region.label} needs colour ${region.number}.`)
      return
    }

    const swatch = getSwatch(selectedNumber)
    const id = ++splashSeed.current
    setSplashes((current) => [...current, { id, x: region.textX, y: region.textY, color: swatch.color }])
    window.setTimeout(() => {
      setSplashes((current) => current.filter((s) => s.id !== id))
    }, 800)

    setColoured((current) => ({
      ...current,
      [region.id]: selectedNumber,
    }))
    setMessage(`${region.label} coloured in.`)
  }

  useEffect(() => {
    if (completed && !celebratedRef.current) {
      celebratedRef.current = true
      const palettePool = ['#2dd4bf', '#f9a8d4', '#86efac', '#fde68a', '#c4b5fd', '#67e8f9']
      const pieces: Confetti[] = Array.from({ length: 48 }, (_, i) => {
        const angle = (i / 48) * Math.PI * 2 + Math.random() * 0.6
        const distance = 180 + Math.random() * 320
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          r: Math.random() * 1440 - 720,
          color: palettePool[Math.floor(Math.random() * palettePool.length)],
          size: 7 + Math.random() * 10,
          delay: Math.random() * 280,
        }
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfetti(pieces)
      window.setTimeout(() => setConfetti([]), 3500)
    }
    if (!completed) celebratedRef.current = false
  }, [completed])

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#f8fafc] text-slate-950 shadow-2xl shadow-cyan-950/25">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-cyan-300 via-pink-300 via-purple-300 to-yellow-200 one-month-ribbon" />

      {confetti.length > 0 ? (
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {confetti.map((p) => (
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
      ) : null}

      <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="p-5 md:p-7">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.26em] text-teal-700">
            <Droplets size={16} aria-hidden="true" />
            Kelly colours it in
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950">
            A bouquet for Kelly, sketched and waiting for her colour
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Pick the numbered colour, then tap the matching piece of the sketch. A turquoise vase, three blooms, two
            long leaves, and a little floating heart — fill them in, in any order.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {palette.map((swatch) => (
              <button
                key={swatch.number}
                type="button"
                onClick={() => {
                  setSelectedNumber(swatch.number)
                  setMessage(`Colour ${swatch.number}: ${swatch.name}`)
                }}
                className={`flex min-h-16 items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.98] ${
                  selectedNumber === swatch.number
                    ? 'border-slate-950 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.16)]'
                    : 'border-slate-200 bg-white/70'
                }`}
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-black shadow-inner"
                  style={{ backgroundColor: swatch.color, color: swatch.text }}
                >
                  {swatch.number}
                </span>
                <span className="text-sm font-black">{swatch.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-black">{completedCount} / {regions.length} coloured</span>
              <button
                type="button"
                onClick={() => {
                  setColoured({})
                  setMessage('Fresh page. Start with the turquoise vase again.')
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 font-black text-slate-700 active:scale-95"
              >
                <RotateCcw size={15} aria-hidden="true" />
                Reset
              </button>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-pink-300 to-yellow-200 transition-all"
                style={{ width: `${(completedCount / regions.length) * 100}%` }}
              />
            </div>
            <p className="mt-3 min-h-5 text-sm font-bold text-teal-800">{message}</p>
          </div>
        </div>

        <div className="relative bg-white p-3">
          <svg
            viewBox="0 0 560 560"
            className="h-[34rem] max-h-[72svh] min-h-[31rem] w-full rounded-[1.35rem] border border-slate-200 bg-[radial-gradient(circle_at_50%_12%,#ffffff_0%,#f3fffd_46%,#f8fafc_100%)]"
            role="img"
            aria-label="Interactive colour by number drawing for Kelly"
          >
            <defs>
              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.12" />
              </filter>
            </defs>

            {lineArt.map((line) => (
              <path
                key={line}
                d={line}
                fill="none"
                stroke="#0f172a"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.55"
              />
            ))}

            {regions.map((region) => {
              const filledNumber = coloured[region.id]
              const swatch = filledNumber ? getSwatch(filledNumber) : null

              return (
                <g
                  key={region.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => colourRegion(region)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') colourRegion(region)
                  }}
                  aria-label={`Colour ${region.label} number ${region.number}`}
                  className="cursor-pointer outline-none"
                  filter={swatch ? 'url(#softShadow)' : undefined}
                >
                  <path
                    d={region.d}
                    fill={swatch?.color ?? '#ffffff'}
                    stroke="#0f172a"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="transition-all duration-500 hover:opacity-85"
                    style={
                      swatch
                        ? ({
                            transformBox: 'fill-box',
                            transformOrigin: 'center',
                            animation: 'one-month-pop 520ms cubic-bezier(0.2,1.4,0.4,1) both',
                          } as CSSProperties)
                        : undefined
                    }
                  />
                  {!swatch ? (
                    <text
                      x={region.textX}
                      y={region.textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="24"
                      fontWeight="900"
                      fill="#0f172a"
                    >
                      {region.number}
                    </text>
                  ) : null}
                </g>
              )
            })}

            {splashes.map((splash) => (
              <circle
                key={splash.id}
                cx={splash.x}
                cy={splash.y}
                r={8}
                fill={splash.color}
                opacity="0.55"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animation: 'one-month-svg-splash 760ms ease-out forwards',
                }}
              />
            ))}
          </svg>

          <div className="pointer-events-none absolute left-6 top-6 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-lg backdrop-blur">
            Tap the sketch
          </div>

          {completed ? (
            <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-teal-200 bg-white/95 p-4 text-sm font-black text-teal-800 shadow-xl backdrop-blur">
              <span className="inline-flex items-center gap-2">
                <Check size={17} aria-hidden="true" />
                Finished. Kelly brought the colour back.
                <Heart size={16} aria-hidden="true" />
                <Sparkles size={16} aria-hidden="true" />
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
