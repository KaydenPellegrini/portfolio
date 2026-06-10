import type { CSSProperties } from 'react'
import Reveal from './Reveal'
import { biancaContent } from '@/data/bianca/letter'

const ACCENTS = [
  'border-[#7c3aed]/45 text-[#d6d9ff] hover:shadow-[0_0_42px_-6px_rgba(124,58,237,0.65)]',
  'border-[#2563eb]/45 text-[#bfdbfe] hover:shadow-[0_0_42px_-6px_rgba(37,99,235,0.6)]',
  'border-[#a5b4fc]/50 text-[#e0e7ff] hover:shadow-[0_0_42px_-6px_rgba(165,180,252,0.6)]',
]

/**
 * The six words that describe her, drifting like a small constellation.
 * Glass chips, gentle float, glow that intensifies on hover/focus.
 */
export default function FloatingWords() {
  const { eyebrow, intro, items } = biancaContent.words

  return (
    <section className="relative mx-auto w-full max-w-5xl px-5 py-20 sm:py-28">
      <Reveal className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a5b4fc]">{eyebrow}</p>
        <p className="bianca-serif mx-auto mt-4 max-w-xl text-balance text-2xl font-light leading-relaxed text-[#f8fafc] sm:text-3xl">
          {intro}
        </p>
      </Reveal>

      <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-5 sm:mt-14 sm:gap-x-6 sm:gap-y-7">
        {items.map((word, i) => {
          const long = word.length > 14
          return (
            <Reveal as="li" key={word} delay={i * 90}>
              <span
                className={`bianca-float group inline-flex items-center rounded-full border bg-white/[0.045] px-5 py-2.5 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.08] focus-within:-translate-y-1 sm:px-7 sm:py-3 ${ACCENTS[i % 3]} ${long ? 'text-base sm:text-xl' : 'text-lg sm:text-2xl'}`}
                style={
                  {
                    '--bx-delay': `${(i % 4) * 0.55}s`,
                    '--bx-dur': `${6 + (i % 3) * 0.9}s`,
                    '--bx-rise': `${-8 - (i % 3) * 3}px`,
                    textShadow: '0 0 22px rgba(165,180,252,0.35)',
                  } as CSSProperties
                }
              >
                <span className="bianca-serif font-medium">{word}</span>
              </span>
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}
