import { openWhenCards } from '@/data/myMoon/openWhen'

export default function OpenWhenCards() {
  return (
    <section className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20 backdrop-blur md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-200/80">Open when</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Small pockets of me</h2>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {openWhenCards.map((card) => (
          <article key={card.title} className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
            <h3 className="text-base font-semibold text-white">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{card.message}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
