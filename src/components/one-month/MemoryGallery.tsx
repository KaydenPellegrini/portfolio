'use client'

import { useState } from 'react'
import type { OneMonthMemory } from '@/data/oneMonth/story'

function MemoryImage({ memory }: { memory: OneMonthMemory }) {
  const [src, setSrc] = useState(memory.src)

  return (
    // A plain img lets missing user-supplied photos fall back without breaking the card.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={memory.alt}
      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      onError={() => setSrc('/one-month/placeholder.svg')}
    />
  )
}

export default function MemoryGallery({ memories }: { memories: OneMonthMemory[] }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/50 p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur md:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(45,212,191,0.08),transparent)]" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/80">The story so far</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Thirteen little pieces of month one</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Not every day needs a photo, and some days deserve more than one. These stay in the order the memories feel
          right.
        </p>
      </div>

      <div className="relative mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {memories.map((memory, index) => (
          <article
            key={memory.id}
            className="one-month-memory group relative min-h-[22rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-xl shadow-black/25"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <MemoryImage memory={memory} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute left-4 top-4 grid size-11 place-items-center rounded-full border border-white/20 bg-black/35 text-sm font-bold text-cyan-100 backdrop-blur">
              {String(memory.id).padStart(2, '0')}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              {memory.date ? (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80">{memory.date}</p>
              ) : null}
              {memory.caption ? <h3 className="text-lg font-semibold text-white">{memory.caption}</h3> : null}
              {memory.note ? <p className="mt-2 text-sm leading-6 text-slate-200">{memory.note}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
