'use client'

import { useMemo, useState } from 'react'
import { Flower2, Palette, Sparkles } from 'lucide-react'
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
      className={`h-full w-full object-cover transition duration-700 ${
        isBloomed ? 'scale-100 saturate-150 contrast-110' : 'scale-105 grayscale contrast-90'
      }`}
    />
  )
}

export default function GardenReveal({ memories }: { memories: OneMonthMemory[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [bloomed, setBloomed] = useState<number[]>([])
  const activeMemory = memories[activeIndex] ?? memories[0]
  const activeBloomed = activeMemory ? bloomed.includes(activeMemory.id) : false
  const bloomCount = bloomed.length
  const petals = useMemo(() => memories, [memories])

  const selectMemory = (index: number) => {
    const memory = memories[index]
    if (!memory) return

    setActiveIndex(index)
    setBloomed((current) => (current.includes(memory.id) ? current : [...current, memory.id]))
  }

  if (!activeMemory) return null

  return (
    <section className="relative grid overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#061c1b]/85 shadow-[0_28px_90px_rgba(8,47,73,0.35)] backdrop-blur lg:grid-cols-[0.92fr_1.08fr]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_74%_72%,rgba(244,114,182,0.14),transparent_30%)]" />
      <div className="relative min-h-[25rem] overflow-hidden sm:min-h-[31rem]">
        <GardenImage key={activeMemory.id} memory={activeMemory} isBloomed={activeBloomed} />
        <div className={`absolute inset-0 bg-gradient-to-t from-[#031312] via-transparent to-transparent transition duration-700 ${activeBloomed ? 'opacity-70' : 'opacity-95'}`} />
        <div className={`one-month-bloom-ring absolute left-1/2 top-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/20 transition duration-700 ${activeBloomed ? 'opacity-100' : 'opacity-0'}`} />
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
            <Flower2 size={16} aria-hidden="true" />
            Click to bloom
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">A little garden of her moments</h2>
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
                onClick={() => selectMemory(index)}
                className={`group grid aspect-square place-items-center rounded-2xl border text-sm font-bold transition ${
                  isActive
                    ? 'border-cyan-100 bg-cyan-200/25 text-white shadow-[0_0_28px_rgba(45,212,191,0.28)]'
                    : 'border-white/10 bg-white/[0.06] text-cyan-100 hover:-translate-y-1 hover:border-cyan-100/40'
                }`}
                aria-label={`Open memory ${memory.id}`}
              >
                <span
                  className={`relative grid size-9 place-items-center rounded-full transition ${
                    isBloomed ? 'bg-pink-200 text-slate-950' : 'bg-cyan-100/10'
                  }`}
                >
                  <span className={`absolute inset-[-0.35rem] rounded-full border border-cyan-100/20 ${isActive ? 'one-month-pulse' : ''}`} />
                  {memory.id}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-slate-200">
          <span>{bloomCount} of {memories.length} memories coloured in</span>
          <div className="flex items-center gap-2 text-cyan-100">
            <Palette size={18} aria-hidden="true" />
            <Sparkles size={16} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
