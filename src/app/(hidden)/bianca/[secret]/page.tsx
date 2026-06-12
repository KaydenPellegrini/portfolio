import type { Metadata } from 'next'
import Image from 'next/image'
import { Cormorant_Garamond, Great_Vibes } from 'next/font/google'
import { notFound } from 'next/navigation'
import Achievement from '@/components/bianca/Achievement'
import Atmosphere from '@/components/bianca/Atmosphere'
import CascadeTitle from '@/components/bianca/CascadeTitle'
import Climax from '@/components/bianca/Climax'
import Closing from '@/components/bianca/Closing'
import FloatingWords from '@/components/bianca/FloatingWords'
import Future from '@/components/bianca/Future'
import Journey from '@/components/bianca/Journey'
import Letter from '@/components/bianca/Letter'
import PhotoFrame from '@/components/bianca/PhotoFrame'
import Reveal from '@/components/bianca/Reveal'
import Tulips from '@/components/bianca/Tulips'
import { biancaContent, biancaPhotos } from '@/data/bianca/letter'

// Scoped to this page only — the elegant serif + script never touch the rest
// of the portfolio.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-greatvibes',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vir Bianca',
  description: 'A private letter for Bianca.',
  robots: {
    index: false,
    follow: false,
  },
}

interface Props {
  params: Promise<{ secret: string }>
}

export default async function BiancaPage({ params }: Props) {
  const { secret } = await params

  if (!process.env.BIANCA_TOKEN || secret !== process.env.BIANCA_TOKEN) {
    notFound()
  }

  const { hero } = biancaContent

  return (
    <main
      className={`bianca-root ${cormorant.variable} ${greatVibes.variable} relative min-h-screen overflow-hidden bg-[#070a1f] text-[#f8fafc] antialiased`}
    >
      <Atmosphere />

      <div className="relative z-10">
        {/* ---------- Hero ---------- */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-end overflow-hidden px-5 pb-24 pt-24 text-center sm:pb-28">
          <Image
            src={biancaPhotos.embrace.src}
            alt={biancaPhotos.embrace.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_26%]"
          />
          {/* deep navy scrim anchoring the text, airy toward the top (no pink) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#070a1f_2%,rgba(7,10,31,0.9)_26%,rgba(7,10,31,0.5)_50%,rgba(7,10,31,0.16)_74%,rgba(7,10,31,0.38)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(124,58,237,0.4),transparent_46%),radial-gradient(circle_at_14%_28%,rgba(37,99,235,0.32),transparent_46%)] mix-blend-screen" />
          <div className="absolute inset-0 bg-[#0b1026]/15" />

          <div className="relative z-10 flex flex-col items-center">
            <Reveal delay={150}>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.5em] text-[#a5b4fc] drop-shadow-[0_1px_12px_rgba(7,10,31,0.8)]">
                {hero.eyebrow}
              </p>
            </Reveal>

            <CascadeTitle
              as="h1"
              text={hero.title}
              baseDelay={420}
              stepMs={70}
              className="mt-5 text-6xl font-semibold leading-[0.95] drop-shadow-[0_3px_22px_rgba(7,10,31,0.98)] sm:text-8xl"
            />

            <Reveal delay={1100} className="mt-7">
              <p className="bianca-serif text-xl italic text-[#e9edf7] drop-shadow-[0_1px_12px_rgba(7,10,31,0.9)] sm:text-2xl">
                Met al my liefde en trots
              </p>
            </Reveal>
          </div>

          <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2">
            <svg
              className="bianca-scroll-cue size-6 text-[#a5b4fc]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </section>

        {/* ---------- Who she is ---------- */}
        <FloatingWords />

        {/* ---------- The journey ---------- */}
        <Journey />

        {/* ---------- Mother & daughter, into the letter ---------- */}
        <section className="mx-auto w-full max-w-md px-5 pt-4">
          <Reveal>
            <PhotoFrame
              photo={biancaPhotos.mammieLaughing}
              sizes="(min-width: 640px) 28rem, 88vw"
              caption="Ek en jy."
            />
          </Reveal>
        </section>

        <Letter />

        <section className="mx-auto w-full max-w-4xl px-5 pb-4">
          <div className="grid gap-5 sm:grid-cols-2">
            <Reveal>
              <PhotoFrame photo={biancaPhotos.mammieGarden} sizes="(min-width: 640px) 44vw, 90vw" />
            </Reveal>
            <Reveal delay={130}>
              <PhotoFrame photo={biancaPhotos.portraitWarm} sizes="(min-width: 640px) 44vw, 90vw" />
            </Reveal>
          </div>
        </section>

        {/* ---------- Surrounded by love ---------- */}
        <Climax />

        {/* ---------- The achievement ---------- */}
        <Achievement />

        {/* ---------- The road ahead ---------- */}
        <Future />

        {/* ---------- Tulips from Mammie ---------- */}
        <Tulips />

        {/* ---------- The world is yours ---------- */}
        <Closing />
      </div>
    </main>
  )
}
