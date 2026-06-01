import type { Metadata } from 'next'
import { CalendarHeart, Flower2, Gem, Heart, Leaf, Palette, Shirt, Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'
import MemoryGallery from '@/components/one-month/MemoryGallery'
import OneMonthAtmosphere from '@/components/one-month/OneMonthAtmosphere'
import TimeTogether from '@/components/one-month/TimeTogether'
import { oneMonthStory } from '@/data/oneMonth/story'

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

const details = [
  { label: 'Favourite colour', value: 'Turquoise', icon: Gem },
  { label: 'Happy fuel', value: 'Sushi, Lunch Bar, Red Bull', icon: Heart },
  { label: 'Creative magic', value: 'Fashion design and big ideas', icon: Shirt },
  { label: 'Tiny universe', value: 'Flowers, Marvel, Spider-Man, Lego', icon: Sparkles },
]

export default async function OneMonthPage({ params }: Props) {
  const { secret } = await params

  if (!process.env.ONE_MONTH_TOKEN || secret !== process.env.ONE_MONTH_TOKEN) {
    notFound()
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#031312] text-white">
      <OneMonthAtmosphere />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(45,212,191,0.26),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_50%_82%,rgba(250,204,21,0.11),transparent_34%),linear-gradient(145deg,#031312_0%,#071f24_44%,#121025_100%)]" />
      <div className="one-month-web pointer-events-none absolute right-[-7rem] top-12 h-80 w-80 rounded-full border border-cyan-100/10" />
      <div className="one-month-web pointer-events-none absolute bottom-20 left-[-9rem] h-96 w-96 rounded-full border border-pink-100/10" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
        <section className="grid min-h-[92svh] content-center gap-8 py-8 md:grid-cols-[1fr_0.9fr] md:items-center md:py-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/80">
              {oneMonthStory.eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl">
              {oneMonthStory.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">{oneMonthStory.heroMessage}</p>

            <div className="mt-7">
              <TimeTogether startDate={oneMonthStory.startDate} />
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-200 sm:max-w-2xl sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                <CalendarHeart size={18} className="mb-3 text-cyan-100" aria-hidden="true" />
                <span className="block text-cyan-100">Started</span>
                <strong className="mt-1 block text-white">2 May 2026, 12:04:36</strong>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                <Flower2 size={18} className="mb-3 text-pink-100" aria-hidden="true" />
                <span className="block text-pink-100">One month</span>
                <strong className="mt-1 block text-white">2 June 2026, 12:04:36</strong>
              </div>
            </div>
          </div>

          <div className="relative min-h-[32rem] overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/45 p-5 shadow-[0_28px_90px_rgba(8,47,73,0.45)] backdrop-blur">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(45,212,191,0.26),transparent_35%),linear-gradient(160deg,rgba(255,255,255,0.08),transparent_58%)]" />
            <div className="one-month-orbit absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/20" />
            <div className="absolute left-1/2 top-1/2 grid size-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-100/30 bg-cyan-200/15 text-center shadow-[0_0_70px_rgba(45,212,191,0.28)] backdrop-blur">
              <div>
                <Sparkles className="mx-auto text-cyan-100" size={26} aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-50">Month one</p>
                <p className="mt-2 text-xs leading-5 text-slate-200">turquoise, silly, sweet, and completely theirs</p>
              </div>
            </div>
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-slate-200 backdrop-blur">
              A tiny cinematic garden for the girl who makes ordinary moments feel handmade.
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur md:p-7">
            <div className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-full border border-cyan-100/25 bg-cyan-100/10 text-cyan-100">
                <Palette size={19} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/80">About her</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">The colour of the whole thing</h2>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-200">
              {oneMonthStory.aboutHer.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {details.map(({ label, value, icon: Icon }) => (
              <article
                key={label}
                className="group rounded-3xl border border-white/10 bg-slate-950/40 p-4 transition hover:-translate-y-1 hover:border-cyan-100/30 hover:bg-white/[0.08]"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <Icon size={20} className="text-cyan-100" aria-hidden="true" />
                  <Leaf
                    size={16}
                    className="text-emerald-100 opacity-0 transition group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-base font-semibold text-white">{label}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{value}</p>
              </article>
            ))}
          </div>
        </section>

        <MemoryGallery memories={oneMonthStory.memories} />

        <section className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.07] p-6 text-center shadow-2xl shadow-pink-950/20 backdrop-blur md:p-10">
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
