import type { Metadata } from 'next'
import { CalendarHeart, Flower2, Heart, Palette, Sparkles, Stars } from 'lucide-react'
import { notFound } from 'next/navigation'
import AboutHerReveal from '@/components/one-month/AboutHerReveal'
import AnimatedTitle from '@/components/one-month/AnimatedTitle'
import ClosingFireworks from '@/components/one-month/ClosingFireworks'
import ColourByNumber from '@/components/one-month/ColourByNumber'
import FloatingHearts from '@/components/one-month/FloatingHearts'
import GardenReveal from '@/components/one-month/GardenReveal'
import MemoryGallery from '@/components/one-month/MemoryGallery'
import OneMonthAtmosphere from '@/components/one-month/OneMonthAtmosphere'
import OneMonthHeroStage from '@/components/one-month/OneMonthHeroStage'
import OpeningCurtain from '@/components/one-month/OpeningCurtain'
import Reveal from '@/components/one-month/Reveal'
import TimeTogether from '@/components/one-month/TimeTogether'
import { createOneMonthMemories, oneMonthStory } from '@/data/oneMonth/story'

export const metadata: Metadata = {
  title: 'My Month With You',
  description: 'A private one-month anniversary page.',
  robots: {
    index: false,
    follow: false,
  },
}

interface Props {
  params: Promise<{ secret: string }>
}

function getImageCount() {
  const count = Number(process.env.ONE_MONTH_IMAGE_COUNT ?? '10')

  if (!Number.isFinite(count)) return 10
  return Math.min(40, Math.max(1, Math.floor(count)))
}

export default async function OneMonthPage({ params }: Props) {
  const { secret } = await params

  if (!process.env.ONE_MONTH_TOKEN || secret !== process.env.ONE_MONTH_TOKEN) {
    notFound()
  }

  const memories = createOneMonthMemories(getImageCount())

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#031312] text-white">
      <OpeningCurtain />
      <OneMonthAtmosphere />
      <FloatingHearts />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(45,212,191,0.26),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_50%_82%,rgba(250,204,21,0.11),transparent_34%),linear-gradient(145deg,#031312_0%,#071f24_44%,#121025_100%)]" />
      <div className="one-month-vine pointer-events-none absolute right-0 top-0 h-full w-28 opacity-50" />
      <div className="one-month-vine pointer-events-none absolute bottom-0 left-0 h-full w-24 rotate-180 opacity-35" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:py-6">
        <section className="grid gap-4 py-2 md:grid-cols-[1fr_0.9fr] md:items-stretch">
          <div className="relative">
            <Reveal as="div" delay={300}>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/80">
                <Sparkles size={14} className="one-month-twinkle" aria-hidden="true" />
                {oneMonthStory.eyebrow}
                <Sparkles size={14} className="one-month-twinkle" aria-hidden="true" />
              </p>
            </Reveal>

            <div className="mt-3">
              <AnimatedTitle
                text={oneMonthStory.title}
                className="max-w-3xl text-5xl font-bold leading-tight sm:text-6xl md:text-7xl"
              />
            </div>

            <Reveal as="div" delay={1100}>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">{oneMonthStory.heroMessage}</p>
            </Reveal>

            <Reveal as="div" delay={1300} className="mt-5">
              <TimeTogether startDate={oneMonthStory.startDate} />
            </Reveal>

            <Reveal as="div" delay={1500} className="mt-4 grid gap-3 text-sm text-slate-200 sm:max-w-2xl sm:grid-cols-2">
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-200/40">
                <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-cyan-300/20 blur-2xl transition group-hover:bg-cyan-300/40" />
                <CalendarHeart size={18} className="mb-3 text-cyan-100 one-month-float" aria-hidden="true" />
                <span className="block text-cyan-100">Started</span>
                <strong className="mt-1 block text-white">{oneMonthStory.startedLabel}</strong>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-pink-200/40">
                <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-pink-300/20 blur-2xl transition group-hover:bg-pink-300/40" />
                <Flower2 size={18} className="mb-3 text-pink-100 one-month-float" aria-hidden="true" />
                <span className="block text-pink-100">One month</span>
                <strong className="mt-1 block text-white">{oneMonthStory.milestoneLabel}</strong>
              </div>
            </Reveal>
          </div>

          <Reveal as="div" delay={500}>
            <OneMonthHeroStage />
          </Reveal>
        </section>

        <Reveal
          as="section"
          delay={150}
          className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur md:p-7"
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px one-month-ribbon" />
          <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 size-44 rounded-full bg-pink-400/15 blur-3xl" />

          <div className="relative grid gap-5 lg:grid-cols-[0.28fr_1fr] lg:items-start">
            <div className="flex items-center gap-4 lg:block">
              <div className="relative grid size-12 shrink-0 place-items-center rounded-full border border-cyan-100/25 bg-cyan-100/10 text-cyan-100 one-month-glow">
                <Palette size={19} aria-hidden="true" />
                <span className="pointer-events-none absolute inset-[-6px] rounded-full border border-cyan-100/30 one-month-badge-rotate" />
              </div>
              <div className="lg:mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/80">About you</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  <span className="one-month-title">Turquoise in human form</span>
                </h2>
              </div>
            </div>

            <AboutHerReveal text={oneMonthStory.aboutHer} />
          </div>
        </Reveal>

        <Reveal as="div" delay={120}>
          <GardenReveal memories={memories} />
        </Reveal>

        <Reveal as="div" delay={120}>
          <MemoryGallery memories={memories} />
        </Reveal>

        <Reveal as="div" delay={120}>
          <ColourByNumber />
        </Reveal>

        <Reveal as="div" delay={150}>
          <ClosingFireworks>
            <section className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 text-center shadow-2xl shadow-pink-950/20 backdrop-blur md:p-8">
              <div className="absolute inset-x-8 top-0 h-px one-month-ribbon" />
              <div className="pointer-events-none absolute -top-20 left-1/2 size-72 -translate-x-1/2 rounded-full bg-pink-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl" />

              <div className="relative">
                <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-pink-100/80">
                  <Stars size={14} className="one-month-twinkle" aria-hidden="true" />
                  Still only the beginning
                  <Stars size={14} className="one-month-twinkle" aria-hidden="true" />
                </p>
                <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">
                  <span className="one-month-title">{oneMonthStory.closing}</span>
                </h2>

                <div className="mt-6 flex items-center justify-center gap-3 text-pink-200">
                  <Heart size={28} className="one-month-heartbeat" fill="currentColor" aria-hidden="true" />
                  <span className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100/80">
                    month one · sealed with colour
                  </span>
                  <Heart size={28} className="one-month-heartbeat" fill="currentColor" aria-hidden="true" />
                </div>
              </div>
            </section>
          </ClosingFireworks>
        </Reveal>
      </div>
    </main>
  )
}
