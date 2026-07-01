import Reveal from './Reveal'
import PhotoFrame from './PhotoFrame'
import { biancaContent, biancaPhotos } from '@/data/bianca/letter'

/**
 * Looking forward: the cap-adjustment photographs, family settling her into the
 * road ahead.
 */
export default function Future({ secret }: { secret: string }) {
  const f = biancaContent.future

  return (
    <section className="relative mx-auto w-full max-w-5xl px-5 py-16 sm:py-24">
      <Reveal className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a5b4fc]">{f.eyebrow}</p>
        <h2 className="bianca-serif mt-3 text-balance text-3xl font-semibold text-[#f8fafc] sm:text-5xl">{f.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-[#cbd5e1]">{f.line}</p>
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Reveal>
          <PhotoFrame photo={biancaPhotos.capWide} secret={secret} sizes="(min-width: 640px) 46vw, 92vw" rounded="1.6rem" />
        </Reveal>
        <Reveal delay={130}>
          <PhotoFrame photo={biancaPhotos.cap} secret={secret} sizes="(min-width: 640px) 46vw, 92vw" rounded="1.6rem" />
        </Reveal>
      </div>
    </section>
  )
}
