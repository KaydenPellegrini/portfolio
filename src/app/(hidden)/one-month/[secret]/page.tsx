import type { Metadata } from 'next'
import { CalendarHeart, Flower2, Palette } from 'lucide-react'
import { notFound } from 'next/navigation'
import GardenReveal from '@/components/one-month/GardenReveal'
import MemoryGallery from '@/components/one-month/MemoryGallery'
import OneMonthAtmosphere from '@/components/one-month/OneMonthAtmosphere'
import OneMonthHeroStage from '@/components/one-month/OneMonthHeroStage'
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
      <OneMonthAtmosphere />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(45,212,191,0.26),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_50%_82%,rgba(250,204,21,0.11),transparent_34%),linear-gradient(145deg,#031312_0%,#071f24_44%,#121025_100%)]" />
      <div className="one-month-vine pointer-events-none absolute right-0 top-0 h-full w-28 opacity-50" />
      <div className="one-month-vine pointer-events-none absolute bottom-0 left-0 h-full w-24 rotate-180 opacity-35" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:py-6">
        <section className="grid gap-4 py-2 md:grid-cols-[1fr_0.9fr] md:items-stretch">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/80">
              {oneMonthStory.eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl">
              {oneMonthStory.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">{oneMonthStory.heroMessage}</p>

            <div className="mt-5">
              <TimeTogether startDate={oneMonthStory.startDate} />
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-200 sm:max-w-2xl sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                <CalendarHeart size={18} className="mb-3 text-cyan-100" aria-hidden="true" />
                <span className="block text-cyan-100">Started</span>
                <strong className="mt-1 block text-white">2 May 2026, 17:04:36</strong>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                <Flower2 size={18} className="mb-3 text-pink-100" aria-hidden="true" />
                <span className="block text-pink-100">One month</span>
                <strong className="mt-1 block text-white">2 June 2026, 17:04:36</strong>
              </div>
            </div>
          </div>

          <OneMonthHeroStage />
        </section>

        <section className="rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur md:p-7">
          <div className="grid gap-5 lg:grid-cols-[0.28fr_1fr] lg:items-start">
            <div className="flex items-center gap-4 lg:block">
              <div className="grid size-11 shrink-0 place-items-center rounded-full border border-cyan-100/25 bg-cyan-100/10 text-cyan-100">
                <Palette size={19} aria-hidden="true" />
              </div>
              <div className="lg:mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/80">About her</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Turquoise in human form</h2>
              </div>
            </div>

            <div className="text-base leading-8 text-slate-200 md:text-lg">
              <p>{oneMonthStory.aboutHer}</p>
            </div>
          </div>
        </section>

        <GardenReveal memories={memories} />

        <MemoryGallery memories={memories} />

        <section className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 text-center shadow-2xl shadow-pink-950/20 backdrop-blur md:p-8">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/50 to-transparent" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-100/80">Still only the beginning</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-4xl">
            {oneMonthStory.closing}
          </h2>
        </section>
      </div>
    </main>
  )
}
