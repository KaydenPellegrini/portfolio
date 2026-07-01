import { Map } from 'lucide-react'

const placeName = process.env.NEXT_PUBLIC_MY_MOON_PLACE_NAME || 'Our little beginning'

// The exact coordinate is resolved server-side and only ever handed out as a
// redirect (see /api/my-moon/place/[secret]) — it never appears in this
// page's HTML or client JS.
export default function MemoryPlace({ secret }: { secret: string }) {
  const mapHref = `/api/my-moon/place/${encodeURIComponent(secret)}`

  return (
    <section className="rounded-[2rem] border border-white/15 bg-slate-950/45 p-5 shadow-2xl shadow-fuchsia-950/20 backdrop-blur md:p-7">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 text-fuchsia-100">
          <Map size={18} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-200/80">Memory</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Where you became My Moon</h2>
        </div>
      </div>

      <a
        href={mapHref}
        target="_blank"
        rel="noreferrer"
        className="mt-6 block rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_25%_20%,rgba(244,114,182,0.24),transparent_35%),radial-gradient(circle_at_75%_70%,rgba(125,211,252,0.22),transparent_35%),rgba(255,255,255,0.06)] p-5 transition hover:border-white/25"
      >
        <p className="text-lg font-semibold text-white">{placeName}</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          The exact spot where the chapter changed. Open it when you want to revisit where you became My Moon.
        </p>
        <p className="mt-5 text-sm font-semibold text-pink-100">Open in Google Maps</p>
      </a>
    </section>
  )
}
