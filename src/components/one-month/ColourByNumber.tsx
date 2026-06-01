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

const regions: Region[] = [
  {
    id: 'dress-bodice',
    number: 1,
    label: 'turquoise dress bodice',
    d: 'M210 160c25-18 58-18 84 0l-18 75h-48l-18-75Z',
    textX: 252,
    textY: 201,
  },
  {
    id: 'dress-skirt-left',
    number: 1,
    label: 'left dress panel',
    d: 'M228 232h48l58 139H174l54-139Z',
    textX: 223,
    textY: 305,
  },
  {
    id: 'dress-skirt-right',
    number: 5,
    label: 'right dress panel',
    d: 'M276 232h50l76 139h-76l-50-139Z',
    textX: 331,
    textY: 313,
  },
  {
    id: 'hair',
    number: 4,
    label: 'golden hair',
    d: 'M205 105c18-58 101-57 121-1 15 43-7 86-28 112-32-14-72-13-103 0-23-31-28-73 10-111Z',
    textX: 256,
    textY: 127,
  },
  {
    id: 'flower-one',
    number: 2,
    label: 'large flower',
    d: 'M95 123c22-30 56-18 54 13 34-9 55 26 28 49 28 21 9 58-25 49-3 35-44 42-58 12-27 21-60-7-43-38-36-5-40-48-5-58 0-33 35-49 49-27Z',
    textX: 109,
    textY: 191,
  },
  {
    id: 'flower-two',
    number: 1,
    label: 'turquoise flower',
    d: 'M398 118c19-25 49-13 46 16 29-8 47 21 24 40 25 20 4 48-24 39-7 30-42 34-51 5-25 16-51-13-33-37-28-7-27-42 3-47 0-26 27-38 35-16Z',
    textX: 411,
    textY: 181,
  },
  {
    id: 'left-leaf',
    number: 3,
    label: 'left leaf',
    d: 'M63 342c54-50 108-58 155-29-50 50-103 62-162 47-9-2-1-12 7-18Z',
    textX: 123,
    textY: 342,
  },
  {
    id: 'right-leaf',
    number: 3,
    label: 'right leaf',
    d: 'M371 335c46-40 96-40 139-7-41 42-92 51-143 25-9-4-5-12 4-18Z',
    textX: 429,
    textY: 346,
  },
  {
    id: 'plant-pot',
    number: 4,
    label: 'plant pot',
    d: 'M48 416h105l-15 91H64l-16-91Z',
    textX: 101,
    textY: 465,
  },
  {
    id: 'sushi',
    number: 2,
    label: 'sushi plate',
    d: 'M386 424c54-25 120-12 139 29-35 37-120 43-157 9-11-11 2-31 18-38Z',
    textX: 446,
    textY: 456,
  },
  {
    id: 'can',
    number: 1,
    label: 'Red Bull can',
    d: 'M428 235h54c10 0 18 9 17 20l-12 118c-1 10-9 17-19 17h-43c-10 0-18-7-19-17l-12-118c-1-11 7-20 17-20Z',
    textX: 447,
    textY: 316,
  },
  {
    id: 'chocolate',
    number: 5,
    label: 'Lunch Bar chocolate',
    d: 'M57 250h105c12 0 21 9 21 21v56H57v-77Z',
    textX: 119,
    textY: 296,
  },
  {
    id: 'lego-one',
    number: 4,
    label: 'Lego block',
    d: 'M181 438h70v47h-70v-47Zm14-17h14v17h-14v-17Zm28 0h14v17h-14v-17Z',
    textX: 216,
    textY: 470,
  },
  {
    id: 'lego-two',
    number: 2,
    label: 'pink Lego block',
    d: 'M259 450h72v45h-72v-45Zm15-17h14v17h-14v-17Zm30 0h14v17h-14v-17Z',
    textX: 295,
    textY: 481,
  },
  {
    id: 'heart',
    number: 2,
    label: 'heart',
    d: 'M292 58c-15-25-54-17-54 16 0 32 45 56 54 69 10-13 55-37 55-69 0-33-40-41-55-16Z',
    textX: 292,
    textY: 96,
  },
]

const lineArt = [
  'M252 161v-29',
  'M219 236c15 14 51 14 66 0',
  'M245 371v65',
  'M113 237c-6-41-2-77 12-110',
  'M411 236c10-45 11-83 3-117',
  'M68 416c9-48 27-85 54-113',
  'M507 424c-25-39-55-69-89-89',
  'M84 327h99',
  'M406 389h84',
]

function getSwatch(number: number) {
  return palette.find((item) => item.number === number) ?? palette[0]
}

type Splash = { id: number; x: number; y: number; color: string }
type Confetti = { id: number; x: number; y: number; r: number; color: string; size: number; delay: number }

export default function ColourByNumber() {
  const [selectedNumber, setSelectedNumber] = useState(1)
  const [coloured, setColoured] = useState<Record<string, number>>({})
  const [message, setMessage] = useState('Pick 1 and start with the turquoise pieces.')
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
            A black-and-white little world waiting for her touch
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Pick the numbered colour, then tap the matching pieces. The sketch fills in with turquoise, flowers,
            fashion, snacks, plants, Lego, and tiny story details.
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
                  setMessage('Clean page. Start with turquoise again.')
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

            <path d="M23 520C95 463 139 455 203 493c58 34 112 31 171-8 49-32 95-54 159-33" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" opacity="0.22" />
            <path d="M430 58c47 15 74 43 83 84M428 58c20 38 50 64 90 80M426 58c39-1 73 13 102 43" fill="none" stroke="#0f172a" strokeWidth="2" opacity="0.22" />
            {lineArt.map((line) => (
              <path key={line} d={line} fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" opacity="0.24" />
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

            <path d="M234 132c16 13 38 13 55 0M229 146c21 16 48 16 68 0" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
            <circle cx="238" cy="116" r="4" fill="#0f172a" opacity="0.55" />
            <circle cx="278" cy="116" r="4" fill="#0f172a" opacity="0.55" />
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
