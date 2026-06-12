import Reveal from './Reveal'
import TulipArt from './TulipArt'
import { biancaContent } from '@/data/bianca/letter'

/**
 * The tulips Mammie gave Bianca — the gift she loved — rendered as hand-drawn
 * art inside a glowing glass frame, so the warm yellow blooms sit like a candle
 * against the page's cool midnight palette.
 */
export default function Tulips() {
  const t = biancaContent.tulips

  return (
    <section className="relative mx-auto w-full max-w-5xl px-5 py-16 sm:py-24">
      <Reveal className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a5b4fc]">{t.eyebrow}</p>
        <h2 className="bianca-serif mt-3 text-4xl font-semibold text-[#f8fafc] sm:text-5xl">{t.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-[#cbd5e1]">{t.line}</p>
      </Reveal>

      <Reveal className="mx-auto mt-10 w-full max-w-sm">
        <div className="bianca-glow relative overflow-hidden rounded-[2rem] border border-[#d6d9ff]/20 bg-[#0b1026]/50 p-4 backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(124,58,237,0.18),transparent_62%)]" />
          <TulipArt />
        </div>
      </Reveal>
    </section>
  )
}
