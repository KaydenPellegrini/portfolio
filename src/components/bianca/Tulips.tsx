import Reveal from './Reveal'
import PhotoFrame from './PhotoFrame'
import TulipArt from './TulipArt'
import { biancaContent, biancaTulips } from '@/data/bianca/letter'

/**
 * The tulips Mammie gave Bianca — the gift she loved. The real photos carry the
 * section (the wrapped bouquet as the feature, the blooms in a small grid), with
 * the hand-drawn art kept as a delicate glowing crown above the title.
 */
export default function Tulips({ secret }: { secret: string }) {
  const t = biancaContent.tulips
  const [bouquet, ...closeups] = biancaTulips

  return (
    <section className="relative mx-auto w-full max-w-5xl px-5 py-16 sm:py-24">
      <Reveal className="text-center">
        <div className="bianca-float mx-auto mb-1 w-full max-w-[132px]">
          <TulipArt decorative />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a5b4fc]">{t.eyebrow}</p>
        <h2 className="bianca-serif mt-3 text-4xl font-semibold text-[#f8fafc] sm:text-5xl">{t.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-[#cbd5e1]">{t.line}</p>
      </Reveal>

      <Reveal className="mx-auto mt-10 w-full max-w-[15rem] sm:max-w-[17rem]">
        <PhotoFrame photo={bouquet} secret={secret} sizes="(min-width: 640px) 17rem, 60vw" />
      </Reveal>

      <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-4 sm:gap-5">
        {closeups.map((p, i) => (
          <Reveal key={p.src} delay={i * 110}>
            <PhotoFrame
              photo={p}
              secret={secret}
              glow={false}
              rounded="1.2rem"
              aspect="3 / 4"
              sizes="(min-width: 640px) 22vw, 44vw"
            />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
