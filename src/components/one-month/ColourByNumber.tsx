'use client'

import { useMemo, useState } from 'react'
import { Check, Droplets, RotateCcw, Sparkles } from 'lucide-react'

type Cell = {
  id: number
  number: number
  shape: string
  label: string
}

const palette = [
  { number: 1, name: 'Turquoise', color: '#2dd4bf' },
  { number: 2, name: 'Petal pink', color: '#f9a8d4' },
  { number: 3, name: 'Leaf', color: '#86efac' },
  { number: 4, name: 'Sun', color: '#fde68a' },
]

const cells: Cell[] = [
  { id: 1, number: 3, label: 'leaf', shape: 'M142 94C94 88 62 116 54 160c43 0 78-18 101-54 3-5-4-11-13-12Z' },
  { id: 2, number: 1, label: 'turquoise petal', shape: 'M208 62c-37 23-49 60-30 96 39-11 61-43 52-85-2-9-12-16-22-11Z' },
  { id: 3, number: 2, label: 'pink petal', shape: 'M270 95c-45-7-78 14-92 54 38 22 78 13 103-23 6-9 0-28-11-31Z' },
  { id: 4, number: 4, label: 'flower heart', shape: 'M196 154c-26 0-47 20-47 45s21 45 47 45 47-20 47-45-21-45-47-45Z' },
  { id: 5, number: 1, label: 'dress sketch', shape: 'M178 242h39l42 120H136l42-120Z' },
  { id: 6, number: 2, label: 'heart', shape: 'M297 247c-18-25-58-15-58 20 0 34 48 61 58 74 10-13 58-40 58-74 0-35-40-45-58-20Z' },
  { id: 7, number: 3, label: 'plant stem', shape: 'M88 244c56 42 79 84 80 149h-28c2-54-19-93-69-132l17-17Z' },
  { id: 8, number: 4, label: 'lego glow', shape: 'M267 374h80v62h-80v-62Zm18-18h17v18h-17v-18Zm31 0h17v18h-17v-18Z' },
  { id: 9, number: 1, label: 'web sparkle', shape: 'M55 355c67-45 133-53 198-25-62 4-122 24-182 58l-16-33Z' },
  { id: 10, number: 2, label: 'small bloom', shape: 'M96 86c26 16 34 39 24 70-28-8-43-29-40-59 1-9 8-15 16-11Z' },
]

export default function ColourByNumber() {
  const [selectedNumber, setSelectedNumber] = useState(1)
  const [coloured, setColoured] = useState<Record<number, number>>({})
  const completed = useMemo(() => cells.every((cell) => coloured[cell.id] === cell.number), [coloured])

  const colourCell = (cell: Cell) => {
    setColoured((current) => ({
      ...current,
      [cell.id]: selectedNumber,
    }))
  }

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#f8fafc] text-slate-950 shadow-2xl shadow-cyan-950/25">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-cyan-300 via-pink-300 to-yellow-200" />
      <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="p-5 md:p-7">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.26em] text-teal-700">
            <Droplets size={16} aria-hidden="true" />
            Colour by number
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-950">A tiny page Kelly can finish herself</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Pick a colour, tap the matching numbered shapes, and turn the black-and-white sketch into a little Kelly
            garden.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {palette.map((swatch) => (
              <button
                key={swatch.number}
                type="button"
                onClick={() => setSelectedNumber(swatch.number)}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  selectedNumber === swatch.number ? 'border-slate-950 bg-white shadow-lg' : 'border-slate-200 bg-white/70'
                }`}
              >
                <span className="grid size-9 place-items-center rounded-full text-sm font-black text-slate-950" style={{ backgroundColor: swatch.color }}>
                  {swatch.number}
                </span>
                <span className="text-sm font-bold">{swatch.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/75 p-3 text-sm">
            <span className="font-semibold">{Object.keys(coloured).length} / {cells.length} filled</span>
            <button
              type="button"
              onClick={() => setColoured({})}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 font-bold text-slate-700"
            >
              <RotateCcw size={15} aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="relative min-h-[31rem] bg-white p-3">
          <svg viewBox="0 0 410 500" className="h-full min-h-[31rem] w-full rounded-[1.35rem] border border-slate-200 bg-[radial-gradient(circle_at_50%_20%,#ffffff,#eefdfa)]">
            <path d="M24 464C84 409 117 406 171 444c54 38 112 28 214-52" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" opacity="0.22" />
            {cells.map((cell) => {
              const filledNumber = coloured[cell.id]
              const swatch = palette.find((item) => item.number === filledNumber)

              return (
                <g
                  key={cell.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => colourCell(cell)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') colourCell(cell)
                  }}
                  aria-label={`Colour ${cell.label} number ${cell.number}`}
                  className="cursor-pointer"
                >
                  <path
                    d={cell.shape}
                    fill={swatch?.color ?? '#ffffff'}
                    stroke="#0f172a"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    className="transition duration-300 hover:opacity-80"
                  />
                  {!swatch ? (
                    <text x={cell.id % 2 ? 145 : 260} y={cell.id < 5 ? 150 + cell.id * 10 : 310 + (cell.id % 3) * 24} textAnchor="middle" fontSize="24" fontWeight="800" fill="#0f172a">
                      {cell.number}
                    </text>
                  ) : null}
                </g>
              )
            })}
          </svg>

          {completed ? (
            <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-teal-200 bg-white/90 p-4 text-sm font-bold text-teal-800 shadow-xl backdrop-blur">
              <span className="inline-flex items-center gap-2">
                <Check size={17} aria-hidden="true" />
                Finished. Kelly brought the colour back.
                <Sparkles size={16} aria-hidden="true" />
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
