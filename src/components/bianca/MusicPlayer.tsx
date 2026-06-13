'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { biancaContent } from '@/data/bianca/letter'

/**
 * Floating music control for "My Wish". Browsers block autoplay-with-sound, so
 * the song starts on the first interaction anywhere on the page (tap, key, or
 * touch) and gently fades in — while an always-visible button lets her
 * pause/replay. Reduced-motion users still get a static, working control.
 */
export default function MusicPlayer() {
  const m = biancaContent.music
  const rootRef = useRef<HTMLDivElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const disarmRef = useRef<() => void>(() => {})
  const [playing, setPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  // Sync UI with the actual element state.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => {
      setPlaying(true)
      setHasStarted(true)
    }
    const onPause = () => setPlaying(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [])

  // Try to start immediately; if blocked, start on the first user gesture. Fade
  // the volume in on the first play so it never blasts.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const target = 0.85
    audio.volume = 0

    let fade: ReturnType<typeof setInterval> | undefined
    const fadeIn = () => {
      window.clearInterval(fade)
      fade = setInterval(() => {
        const next = Math.min(target, audio.volume + 0.04)
        audio.volume = next
        if (next >= target) window.clearInterval(fade)
      }, 70)
    }
    const onFirstPlaying = () => {
      fadeIn()
      audio.removeEventListener('playing', onFirstPlaying)
    }
    audio.addEventListener('playing', onFirstPlaying)

    let done = false
    const cleanup = () => {
      done = true
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
      window.removeEventListener('touchstart', onGesture)
    }
    disarmRef.current = cleanup

    const onGesture = (e: Event) => {
      if (done) return
      // Taps on the control are handled by the button's own onClick — don't
      // also auto-start here, or the start + toggle cancel each other out.
      if (e.target instanceof Node && rootRef.current?.contains(e.target)) return
      if (audio.paused) audio.play().catch(() => {})
      cleanup()
    }

    // best-effort immediate start (usually blocked until a gesture)
    audio.play().catch(() => {})

    window.addEventListener('pointerdown', onGesture, { passive: true })
    window.addEventListener('keydown', onGesture)
    window.addEventListener('touchstart', onGesture, { passive: true })

    return () => {
      cleanup()
      window.clearInterval(fade)
      audio.removeEventListener('playing', onFirstPlaying)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    // The recipient has taken control — stop the first-gesture auto-start so it
    // can never fight the button.
    disarmRef.current()
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }

  const showLabel = !hasStarted || playing

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {showLabel ? (
        <span
          aria-live="polite"
          className="max-w-[70vw] truncate rounded-full border border-[#d6d9ff]/20 bg-[#0b1026]/75 px-3.5 py-1.5 text-xs text-[#cbd5e1] shadow-lg shadow-[#05070f]/40 backdrop-blur"
        >
          {playing ? `${m.title} · ${m.artist}` : m.hint}
        </span>
      ) : null}

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? m.pause : m.play}
        aria-pressed={playing}
        className="bianca-glow group relative grid size-14 place-items-center rounded-full border border-[#d6d9ff]/25 bg-[#111633]/80 text-[#d6d9ff] backdrop-blur transition hover:scale-105 hover:border-[#a5b4fc]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a5b4fc]"
      >
        {playing ? (
          <span className="pointer-events-none absolute inset-0 rounded-full border border-[#a5b4fc]/40 bianca-pulse-ring" aria-hidden="true" />
        ) : null}

        {playing ? (
          <span className="flex items-end gap-[3px]" aria-hidden="true">
            <span className="bianca-eq w-[3px] rounded-full bg-current" style={{ '--bx-delay': '0s' } as CSSProperties} />
            <span className="bianca-eq w-[3px] rounded-full bg-current" style={{ '--bx-delay': '0.2s' } as CSSProperties} />
            <span className="bianca-eq w-[3px] rounded-full bg-current" style={{ '--bx-delay': '0.4s' } as CSSProperties} />
            <span className="bianca-eq w-[3px] rounded-full bg-current" style={{ '--bx-delay': '0.15s' } as CSSProperties} />
          </span>
        ) : (
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18V6l11-2v12" />
            <circle cx="6.5" cy="18" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="17.5" cy="16" r="2.5" fill="currentColor" stroke="none" />
          </svg>
        )}
      </button>

      <audio ref={audioRef} src={m.src} loop preload="metadata" />
    </div>
  )
}
