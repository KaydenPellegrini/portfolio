import Reveal from './Reveal'
import { biancaContent } from '@/data/bianca/letter'

/**
 * The emotional centre of the page: the letter itself, set on a softly glowing
 * glass card with an illuminated drop cap, a stanza of virtues, and a
 * handwritten "Mammie" signature. Generous spacing throughout.
 */
export default function Letter() {
  const l = biancaContent.letter

  return (
    <section className="relative mx-auto w-full max-w-3xl px-5 py-16 sm:py-24">
      <Reveal>
        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-6 rounded-[2.8rem] bg-[radial-gradient(circle_at_28%_-5%,rgba(124,58,237,0.3),transparent_60%),radial-gradient(circle_at_82%_105%,rgba(37,99,235,0.24),transparent_60%)] blur-2xl"
            aria-hidden="true"
          />

          <article className="relative overflow-hidden rounded-[2.2rem] border border-[#d6d9ff]/15 bg-[#111633]/60 px-6 py-10 shadow-2xl shadow-[#05070f]/60 backdrop-blur-xl sm:px-12 sm:py-14">
            <div className="bianca-ribbon pointer-events-none absolute inset-x-10 top-0 h-px" aria-hidden="true" />

            <header className="text-center">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-[#a5b4fc]">{l.eyebrow}</p>
              <p
                className="bianca-script mt-3 text-5xl leading-none text-[#d6d9ff] sm:text-6xl"
                style={{ textShadow: '0 0 30px rgba(165,180,252,0.4)' }}
              >
                {l.heading}
              </p>
            </header>

            <div className="bianca-serif mx-auto mt-10 max-w-[60ch] text-[1.18rem] leading-[1.95] text-[#e9edf7] sm:text-[1.28rem]">
              <p className="bianca-dropcap text-pretty">{l.opening}</p>

              <div className="my-9 flex flex-col items-center gap-1.5 text-center">
                {l.virtues.map((v, i) => (
                  <p
                    key={v}
                    className={
                      i === l.virtues.length - 1
                        ? 'bianca-shine mt-2 text-2xl sm:text-3xl'
                        : 'text-xl text-[#d6d9ff] sm:text-2xl'
                    }
                  >
                    {v}
                  </p>
                ))}
              </div>

              {l.body.map((p) => (
                <p key={p.slice(0, 24)} className="mt-6 text-pretty">
                  {p}
                </p>
              ))}

              <p className="bianca-shine my-9 text-center text-2xl sm:text-3xl">{l.congrats}</p>

              <p className="text-pretty">{l.blessing}</p>

              <div className="mt-8 flex flex-col items-center gap-1.5 text-center">
                {l.emphasis.map((e) => (
                  <p key={e} className="text-xl text-[#d6d9ff] sm:text-2xl">
                    {e}
                  </p>
                ))}
              </div>

              <footer className="mt-10 text-center">
                <p className="text-lg italic text-[#cbd5e1]">{l.signoffLine}</p>
                <p
                  className="bianca-script mt-1 text-5xl text-[#f8fafc] sm:text-6xl"
                  style={{ textShadow: '0 0 30px rgba(214,217,255,0.45)' }}
                >
                  {l.signoffName}
                </p>
              </footer>
            </div>
          </article>
        </div>
      </Reveal>
    </section>
  )
}
