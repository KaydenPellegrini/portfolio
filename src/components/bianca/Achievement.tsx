import Reveal from './Reveal'
import PhotoFrame from './PhotoFrame'
import { biancaContent, biancaPhotos } from '@/data/bianca/letter'

/**
 * A tasteful achievement beat built around the certificate photo.
 */
export default function Achievement() {
  const a = biancaContent.achievement

  return (
    <section className="relative mx-auto w-full max-w-5xl px-5 py-16 sm:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="mx-auto w-full max-w-xs sm:max-w-sm lg:order-2">
          <PhotoFrame photo={biancaPhotos.certificate} sizes="(min-width: 1024px) 34vw, 80vw" />
        </Reveal>

        <Reveal className="lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a5b4fc]">{a.eyebrow}</p>
          <h2 className="bianca-serif mt-3 text-4xl font-semibold text-[#f8fafc] sm:text-5xl">{a.title}</h2>
          <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-[#cbd5e1]">{a.line}</p>
          <span className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-[#d6d9ff]/25 bg-white/[0.05] px-5 py-2 text-sm font-medium tracking-wide text-[#d6d9ff] backdrop-blur">
            <svg viewBox="0 0 24 24" className="size-4 text-[#a5b4fc]" fill="currentColor" aria-hidden="true">
              <path d="M12 1.6l2.7 6.2 6.8.6-5.1 4.5 1.5 6.6L12 16.6 6.1 20.1l1.5-6.6L2.5 9l6.8-.6L12 1.6z" />
            </svg>
            {a.badge}
          </span>
        </Reveal>
      </div>
    </section>
  )
}
