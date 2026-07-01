import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { matchesSecret } from '@/lib/secretGate'
import Countdown from '@/components/my-moon/Countdown'
import DistanceFromKayden from '@/components/my-moon/DistanceFromKayden'
import MemoryPlace from '@/components/my-moon/MemoryPlace'
import MoonScene from '@/components/my-moon/MoonScene'
import MoonTrail from '@/components/my-moon/MoonTrail'
import OpenWhenCards from '@/components/my-moon/OpenWhenCards'
import RandomLoveMessage from '@/components/my-moon/RandomLoveMessage'
import SharedUniverse from '@/components/my-moon/SharedUniverse'

export const metadata: Metadata = {
  title: 'For My Moon',
  description: 'A private little place for My Moon.',
  robots: {
    index: false,
    follow: false,
  },
}

interface Props {
  params: Promise<{ secret: string }>
}

export default async function MyMoonPage({ params }: Props) {
  const { secret } = await params

  if (!matchesSecret(secret, process.env.MY_MOON_TOKEN)) {
    notFound()
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070914] text-white">
      <MoonTrail />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(244,114,182,0.22),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.18),transparent_32%),linear-gradient(145deg,#070914_0%,#111827_46%,#27142f_100%)]" />
      <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-200/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
        <section className="grid min-h-[92svh] content-center gap-8 py-8 md:grid-cols-[1fr_0.95fr] md:items-center md:py-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-pink-200/80">Private orbit</p>
            <h1 className="mt-4 text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl">
              For My Moon
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              A small place I made for you. For when you miss me, need reassurance, or just want to remember that you
              are loved.
            </p>
            <p className="mt-5 inline-flex rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm text-pink-100 backdrop-blur">
              Made by pickeltjie, obviously over-engineered into a small moon simulator.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-200 sm:max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
                <span className="block text-pink-100">Landing</span>
                <strong className="mt-1 block text-white">11 June, 17:05</strong>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
                <span className="block text-sky-100">Soundtrack</span>
                <strong className="mt-1 block text-white">End of Beginning</strong>
              </div>
            </div>
          </div>

          <MoonScene />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <RandomLoveMessage />
          <Countdown />
        </div>

        <SharedUniverse />

        <div className="grid gap-6 lg:grid-cols-2">
          <DistanceFromKayden secret={secret} />
          <MemoryPlace secret={secret} />
        </div>

        <OpenWhenCards />
      </div>
    </main>
  )
}
