'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Flower2, Heart, Palette, Sparkles } from 'lucide-react'
import type { OneMonthMemory } from '@/data/oneMonth/story'

function GardenImage({ memory, isBloomed }: { memory: OneMonthMemory; isBloomed: boolean }) {
  const [src, setSrc] = useState(memory.src)

  return (
    // A plain img keeps the user-managed 1.jpg, 2.jpg flow flexible and fallbacks simple.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={memory.alt}
      onError={() => setSrc('/one-month/placeholder.svg')}
      className={`h-full w-full select-none object-cover transition-all duration-[1100ms] ease-out ${
        isBloomed ? 'scale-100 saturate-150 contrast-110' : 'scale-110 grayscale contrast-90'
      }`}
      draggable={false}
    />
  )
}

type Burst = { id: number; x: number; y: number; hue: number }

export default function GardenReveal({ memories }: { memories: OneMonthMemory[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [bloomed, setBloomed] = useState<number[]>([])
  const [bursts, setBursts] = useState<Burst[]>([])
  const stageRef = useRef<HTMLDivElement>(null)
  const burstSeed = useRef(0)

  const activeMemory = memories[activeIndex] ?? memories[0]
  const activeBloomed = activeMemory ? bloomed.includes(activeMemory.id) : false
  const bloomCount = bloomed.length
  const petals = useMemo(() => memories, [memories])

  const addBurst = useCallback((x: number, y: number) => {
    const id = ++burstSeed.current
    setBursts((current) => [...current, { id, x, y, hue: Math.random() < 0.55 ? 176 : 330 }])
    window.setTimeout(() => {
      setBursts((current) => current.filter((b) => b.id !== id))
    }, 1100)
  }, [])

  const selectMemory = (index: number, target?: { x: number; y: number }) => {
    const memory = memories[index]
    if (!memory) return

    setActiveIndex(index)
    setBloomed((current) => (current.includes(memory.id) ? current : [...current, memory.id]))

    const node = stageRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const x = target ? target.x - rect.left : rect.width / 2
    const y = target ? target.y - rect.top : rect.height / 2
    addBurst(x, y)
    addBurst(x + (Math.random() - 0.5) * 80, y + (Math.random() - 0.5) * 60)
  }

  useEffect(() => {
    if (!activeMemory) return
    if (!bloomed.includes(activeMemory.id)) {
      // Auto-bloom the first memory on mount so the page opens with colour.
      setBloomed([activeMemory.id])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!activeMemory) return null

  return (
    <section className="relative grid overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#061c1b]/85 shadow-[0_28px_90px_rgba(8,47,73,0.35)] backdrop-blur lg:grid-cols-[0.92fr_1.08fr]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(45,212,191,0.22),transparent_30%),radial-gradient(circle_at_74%_72%,rgba(244,114,182,0.18),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px one-month-ribbon" />

      <div ref={stageRef} className="relative min-h-[25rem] overflow-hidden sm:min-h-[31rem]">
        <GardenImage key={activeMemory.id} memory={activeMemory} isBloomed={activeBloomed} />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-[#031312] via-transparent to-transparent transition-opacity duration-700 ${
            activeBloomed ? 'opacity-70' : 'opacity-95'
          }`}
        />
        <div
          className={`one-month-bloom-ring absolute left-1/2 top-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/20 transition duration-700 ${
            activeBloomed ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {bursts.map((burst) => (
          <span
            key={burst.id}
            className="one-month-burst"
            style={
              {
                left: burst.x,
                top: burst.y,
                width: 36,
                height: 36,
                borderColor: `hsla(${burst.hue}, 95%, 75%, 0.85)`,
                boxShadow: `0 0 36px hsla(${burst.hue}, 90%, 65%, 0.55)`,
              } as CSSProperties
            }
          />
        ))}

        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 backdrop-blur">
          Memory {String(activeMemory.id).padStart(2, '0')}
        </div>
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
          <p className="text-sm leading-6 text-slate-100">
            {activeBloomed
              ? 'Bloomed. The colour is back in this memory.'
              : 'Pick a flower to colour this memory in.'}
          </p>
        </div>
      </div>

      <div className="relative flex flex-col justify-between gap-5 p-5 md:p-7">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
            <Flower2 size={16} className="one-month-float" aria-hidden="true" />
            Click to bloom
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">
            <span className="one-month-title">A little garden of her moments</span>
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Each flower opens one photo and brings its colour back. It keeps the page about her: bright, creative,
            nature-loving, and full of small joys.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2" aria-label="Memory garden">
          {petals.map((memory, index) => {
            const isActive = memory.id === activeMemory.id
            const isBloomed = bloomed.includes(memory.id)

            return (
              <button
                key={memory.id}
                type="button"
                onClick={(event) => selectMemory(index, { x: event.clientX, y: event.clientY })}
                className={`group relative grid aspect-square place-items-center overflow-hidden rounded-2xl border text-sm font-bold transition duration-300 hover:-translate-y-1 ${
                  isActive
                    ? 'border-cyan-100 bg-cyan-200/25 text-white shadow-[0_0_28px_rgba(45,212,191,0.35)]'
                    : 'border-white/10 bg-white/[0.06] text-cyan-100 hover:border-cyan-100/50 hover:bg-cyan-200/10'
                }`}
                aria-label={`Open memory ${memory.id}`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <span
                  className={`relative grid size-9 place-items-center rounded-full transition ${
                    isBloomed ? 'bg-pink-200 text-slate-950 shadow-[0_0_18px_rgba(249,168,212,0.7)]' : 'bg-cyan-100/10'
                  }`}
                >
                  <span
                    className={`absolute inset-[-0.35rem] rounded-full border border-cyan-100/25 ${
                      isActive ? 'one-month-pulse' : ''
                    }`}
                  />
                  {isBloomed ? (
                    <Heart size={14} className="one-month-heartbeat" fill="currentColor" aria-hidden="true" />
                  ) : (
                    memory.id
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-slate-200">
          <span>
            <strong className="text-white tabular-nums">{bloomCount}</strong> of {memories.length} memories coloured in
          </span>
          <div className="flex items-center gap-2 text-cyan-100">
            <Palette size={18} className="one-month-float" aria-hidden="true" />
            <Sparkles size={16} className="one-month-twinkle" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
