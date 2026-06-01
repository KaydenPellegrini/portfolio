'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import type { OneMonthMemory } from '@/data/oneMonth/story'

function MemoryImage({
  memory,
  onLoad,
}: {
  memory: OneMonthMemory
  onLoad?: () => void
}) {
  const [src, setSrc] = useState(memory.src)

  return (
    // A plain img lets missing user-supplied photos fall back without breaking the card.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={memory.alt}
      className="h-full w-full select-none object-cover transition-transform duration-700 group-hover:scale-105"
      onError={() => setSrc('/one-month/placeholder.svg')}
      onLoad={onLoad}
      draggable={false}
    />
  )
}

function TiltCard({
  memory,
  index,
  onOpen,
}: {
  memory: OneMonthMemory
  index: number
  onOpen: (index: number) => void
}) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const [active, setActive] = useState(false)

  const handleMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const node = cardRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const px = x / rect.width
    const py = y / rect.height
    const ry = (px - 0.5) * 14
    const rx = (0.5 - py) * 14
    node.style.setProperty('--rx', `${rx}deg`)
    node.style.setProperty('--ry', `${ry}deg`)
    node.style.setProperty('--mx', `${px * 100}%`)
    node.style.setProperty('--my', `${py * 100}%`)
  }, [])

  const handleEnter = useCallback(() => setActive(true), [])
  const handleLeave = useCallback(() => {
    const node = cardRef.current
    if (!node) return
    node.style.setProperty('--rx', '0deg')
    node.style.setProperty('--ry', '0deg')
    setActive(false)
  }, [])

  return (
    <button
      ref={cardRef}
      type="button"
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onClick={() => onOpen(index)}
      className={`one-month-memory one-month-card-3d group relative min-h-[24rem] min-w-[82%] snap-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/70 text-left shadow-xl shadow-black/25 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-300 sm:min-w-0 ${
        active ? 'is-active' : ''
      }`}
      style={{ animationDelay: `${index * 90}ms` } as CSSProperties}
      aria-label={`Open memory ${memory.id}`}
    >
      <MemoryImage memory={memory} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

      <div className="absolute left-4 top-4 grid size-11 place-items-center rounded-full border border-white/20 bg-black/35 text-sm font-bold text-cyan-100 backdrop-blur transition group-hover:bg-cyan-300/30 group-hover:text-white">
        {String(memory.id).padStart(2, '0')}
      </div>

      <div className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-white/15 bg-black/35 text-pink-200 opacity-0 backdrop-blur transition group-hover:opacity-100">
        <Heart size={15} className="one-month-heartbeat" aria-hidden="true" fill="currentColor" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 transition-transform duration-500 group-hover:-translate-y-1">
        {memory.date ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80">{memory.date}</p>
        ) : null}
        {memory.caption ? <h3 className="text-lg font-semibold text-white">{memory.caption}</h3> : null}
        {memory.note ? <p className="mt-2 text-sm leading-6 text-slate-200">{memory.note}</p> : null}
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-cyan-200/0 transition group-hover:ring-cyan-200/30" />
    </button>
  )
}

function Lightbox({
  memory,
  total,
  onClose,
  onNext,
  onPrev,
}: {
  memory: OneMonthMemory
  total: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onNext()
      if (event.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, onNext, onPrev])

  const handleBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div
      className="one-month-lightbox-back fixed inset-0 z-[80] grid place-items-center bg-slate-950/85 p-4 backdrop-blur"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Memory ${memory.id} of ${total}`}
    >
      <div className="one-month-lightbox-card relative w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-900/90 shadow-[0_40px_120px_rgba(8,47,73,0.6)]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
          <MemoryImage memory={memory} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(45,212,191,0.18),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(244,114,182,0.15),transparent_50%)]" />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-slate-950/80 p-4 text-slate-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
              Memory {String(memory.id).padStart(2, '0')} / {total}
            </p>
            {memory.caption ? <h3 className="mt-1 text-lg font-semibold text-white">{memory.caption}</h3> : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-cyan-100 transition hover:-translate-x-0.5 hover:bg-cyan-200/15"
              aria-label="Previous memory"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-cyan-100 transition hover:translate-x-0.5 hover:bg-cyan-200/15"
              aria-label="Next memory"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-pink-100 transition hover:bg-pink-200/20"
              aria-label="Close memory"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <p className="pointer-events-none mt-4 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/60">
        Esc to close · ← → to drift through them
      </p>

      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-200/30">
        <Heart size={420} className="one-month-heartbeat" aria-hidden="true" />
      </span>
    </div>
  )
}

export default function MemoryGallery({ memories }: { memories: OneMonthMemory[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const memoryLabel = memories.length === 1 ? 'one little piece' : `${memories.length} little pieces`

  const close = useCallback(() => setOpenIndex(null), [])
  const next = useCallback(
    () => setOpenIndex((current) => (current === null ? null : (current + 1) % memories.length)),
    [memories.length],
  )
  const prev = useCallback(
    () =>
      setOpenIndex((current) =>
        current === null ? null : (current - 1 + memories.length) % memories.length,
      ),
    [memories.length],
  )

  const activeMemory = openIndex !== null ? memories[openIndex] : null

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/50 p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur md:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(45,212,191,0.08),transparent)]" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px one-month-ribbon" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/80">The story so far</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">
          <span className="one-month-title">{memoryLabel} of month one</span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Not every day needs a photo, and some days deserve more than one. These stay in the order the memories feel
          right. Tap one to open it bigger.
        </p>
      </div>

      <div className="relative mt-7 flex snap-x gap-4 overflow-x-auto pb-3 sm:grid sm:overflow-visible sm:pb-0 md:grid-cols-2 lg:grid-cols-3">
        {memories.map((memory, index) => (
          <TiltCard key={memory.id} memory={memory} index={index} onOpen={setOpenIndex} />
        ))}
      </div>

      {activeMemory && openIndex !== null ? (
        <Lightbox
          memory={activeMemory}
          total={memories.length}
          onClose={close}
          onNext={next}
          onPrev={prev}
        />
      ) : null}
    </section>
  )
}
