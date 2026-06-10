import Reveal from './Reveal'
import CascadeTitle from './CascadeTitle'
import PhotoFrame from './PhotoFrame'
import { biancaContent, biancaPhotos } from '@/data/bianca/letter'

/**
 * The closing blessing — "Die wêreld is joune, Bianca." — ending on her smile
 * and a final handwritten signature.
 */
export default function Closing() {
  const c = biancaContent.closing

  return (
    <section className="relative mx-auto w-full max-w-4xl px-5 py-24 text-center sm:py-32">
      <Reveal className="mx-auto mb-12 w-full max-w-[15rem] sm:max-w-xs">
        <PhotoFrame photo={biancaPhotos.portraitJoy} sizes="(min-width: 640px) 20rem, 60vw" />
      </Reveal>

      <CascadeTitle
        text={c.title}
        trigger="visible"
        baseDelay={80}
        stepMs={40}
        className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-[1.05] sm:text-7xl"
      />

      <Reveal delay={200}>
        <p className="mx-auto mt-7 max-w-xl text-pretty text-lg text-[#cbd5e1] sm:text-xl">{c.subtitle}</p>
        <p
          className="bianca-script mt-8 text-6xl text-[#f8fafc] sm:text-7xl"
          style={{ textShadow: '0 0 34px rgba(214,217,255,0.5)' }}
        >
          {c.signoff}
        </p>
        <div className="bianca-ribbon mx-auto mt-10 h-px w-40" />
      </Reveal>
    </section>
  )
}
