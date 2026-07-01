import Reveal from './Reveal'
import PhotoFrame from './PhotoFrame'
import { biancaContent, biancaPhotos } from '@/data/bianca/letter'

/**
 * The journey from her first day of school to this moment, anchored by the
 * photo of Bianca holding her childhood graduation picture. A glowing spine
 * with four stations reveals as you scroll.
 */
export default function Journey({ secret }: { secret: string }) {
  const { eyebrow, title, steps } = biancaContent.journey

  return (
    <section className="relative mx-auto w-full max-w-5xl px-5 py-16 sm:py-24">
      <Reveal className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#a5b4fc]">{eyebrow}</p>
        <h2 className="bianca-serif mt-3 text-4xl font-semibold text-[#f8fafc] sm:text-5xl">{title}</h2>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14">
        <Reveal className="mx-auto w-full max-w-xs sm:max-w-sm">
          <PhotoFrame
            photo={biancaPhotos.childhood}
            secret={secret}
            sizes="(min-width: 1024px) 30vw, 80vw"
            caption="Toe en nou, dieselfde stralende glimlag."
          />
        </Reveal>

        <ol className="relative ml-1">
          <span
            className="bianca-spine pointer-events-none absolute bottom-0 left-[7px] top-0 w-[2px] rounded-full"
            aria-hidden="true"
          />
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 130} className="relative py-5 pl-10">
              <span className="absolute left-0 top-[1.7rem] grid size-4 place-items-center rounded-full bg-[#0b1026]" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-[#a5b4fc] shadow-[0_0_14px_4px_rgba(165,180,252,0.7)]" />
              </span>
              <h3 className="bianca-serif text-2xl font-medium text-[#f8fafc] sm:text-[1.75rem]">{step.title}</h3>
              <p className="mt-1.5 text-[#cbd5e1]">{step.note}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
