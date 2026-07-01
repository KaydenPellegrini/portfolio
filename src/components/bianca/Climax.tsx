import Reveal from './Reveal'
import PhotoFrame from './PhotoFrame'
import { biancaContent, biancaPhotos } from '@/data/bianca/letter'

/**
 * Emotional high point: the family kissing Bianca's cheeks, with a quiet row
 * of supporting family photographs beneath it.
 */
export default function Climax({ secret }: { secret: string }) {
  const c = biancaContent.climax

  return (
    <section className="relative mx-auto w-full max-w-5xl px-5 py-16 sm:py-24">
      <Reveal className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a5b4fc]">{c.eyebrow}</p>
        <h2 className="bianca-serif mt-3 text-4xl font-semibold text-[#f8fafc] sm:text-5xl">{c.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-[#cbd5e1]">{c.line}</p>
      </Reveal>

      <Reveal className="mx-auto mt-10 max-w-3xl">
        <PhotoFrame photo={biancaPhotos.familyKiss} secret={secret} sizes="(min-width: 768px) 70vw, 92vw" rounded="2rem" />
      </Reveal>

      <div className="mt-5 grid grid-cols-3 gap-3 sm:mt-6 sm:gap-5">
        {[biancaPhotos.family1, biancaPhotos.familyThree, biancaPhotos.family2].map((p, i) => (
          <Reveal key={p.src} delay={i * 120}>
            <PhotoFrame photo={p} secret={secret} glow={false} rounded="1.2rem" sizes="(min-width: 768px) 30vw, 31vw" />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
