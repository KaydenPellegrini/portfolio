import { Clapperboard, Gamepad2, Headphones, Moon, Plane, Sparkles } from 'lucide-react'

const universeCards = [
  {
    title: 'Now playing',
    copy: 'End of Beginning by Djo gets its own little orbit here, because some songs feel like a doorway.',
    icon: Headphones,
  },
  {
    title: 'Co-op mode',
    copy: 'Built for the two gamers who can turn a normal evening into a side quest with snacks.',
    icon: Gamepad2,
  },
  {
    title: 'Movie night treaty',
    copy: 'Series, horror, cozy watches, and the occasional action pick that I will defend with suspicious confidence.',
    icon: Clapperboard,
  },
  {
    title: 'Soft landing',
    copy: 'Thursday, 11 June 2026 at 17:05. The airport side quest ends with you here.',
    icon: Plane,
  },
]

export default function SharedUniverse() {
  return (
    <section className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-5 shadow-2xl shadow-violet-950/20 backdrop-blur md:p-7">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-full border border-pink-200/20 bg-pink-200/10 text-pink-100">
          <Moon size={18} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-200/80">Our universe</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">A tiny world with lore</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {universeCards.map(({ title, copy, icon: Icon }) => (
          <article key={title} className="group rounded-3xl border border-white/10 bg-slate-950/35 p-4 transition hover:-translate-y-1 hover:border-pink-200/30 hover:bg-white/[0.08]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Icon size={20} className="text-pink-100" aria-hidden="true" />
              <Sparkles size={16} className="text-sky-100 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
