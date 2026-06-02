'use client'

import { useEffect, useState } from 'react'
import type { BuildStep } from '@/data/showcase/projects'
import styles from '@/app/showcase/showcase.module.css'

type Props = {
  steps: BuildStep[]
  language?: string
}

const REGIONS: Array<{ key: NonNullable<BuildStep['region']>; className: string }> = [
  { key: 'header', className: styles.regionHeader },
  { key: 'main', className: styles.regionMain },
  { key: 'aside', className: styles.regionAside },
  { key: 'footer', className: styles.regionFooter },
]

/**
 * "Watch it get built": code types out line by line in the left pane while the
 * matching UI block snaps into the preview on the right. Replayable; under
 * reduced-motion it shows the finished state immediately.
 */
export default function BuildSimulation({ steps, language = 'tsx' }: Props) {
  const [revealed, setRevealed] = useState(0)
  const [partial, setPartial] = useState('')
  const [done, setDone] = useState(false)
  // Bumping this re-runs the build sequence (initial play + replays).
  const [playId, setPlayId] = useState(0)

  useEffect(() => {
    const timers: number[] = []
    const push = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms))

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      // Skip the animation, jump to the finished state (still async, off the effect body).
      push(() => {
        setRevealed(steps.length)
        setDone(true)
      }, 0)
      return () => timers.forEach((t) => window.clearTimeout(t))
    }

    const runStep = (i: number) => {
      if (i >= steps.length) {
        setDone(true)
        return
      }
      const text = steps[i].code
      let ch = 0
      const typeNext = () => {
        ch += 1
        setPartial(text.slice(0, ch))
        if (ch < text.length) {
          push(typeNext, 22)
        } else {
          push(() => {
            setRevealed(i + 1)
            setPartial('')
            push(() => runStep(i + 1), 280)
          }, 160)
        }
      }
      typeNext()
    }

    push(() => {
      setRevealed(0)
      setPartial('')
      setDone(false)
      runStep(0)
    }, 120)
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [playId, steps])

  const visibleSteps = steps.slice(0, revealed)
  const typingActive = !done && revealed < steps.length

  return (
    <div className={styles.build}>
      <div className={styles.buildControls}>
        <button type="button" className={styles.buildBtn} onClick={() => setPlayId((n) => n + 1)}>
          {done ? '↻ Replay build' : '↻ Restart'}
        </button>
        <span className={styles.buildProgress}>
          {revealed}/{steps.length} blocks assembled
        </span>
      </div>

      <div className={styles.codePane} aria-hidden="true">
        <div className={styles.codeHead}>{language}</div>
        {visibleSteps.map((step, i) => (
          <code key={i} className={styles.codeLine}>
            {step.code}
          </code>
        ))}
        {typingActive && (
          <code className={styles.codeLine}>
            {partial}
            <span className={styles.cursor} />
          </code>
        )}
      </div>

      <div className={styles.previewPane}>
        {REGIONS.map((region) => {
          const blocks = visibleSteps.filter(
            (step) => (step.region ?? 'main') === region.key,
          )
          return (
            <div key={region.key} className={`${styles.region} ${region.className}`}>
              {blocks.map((step, i) => (
                <div key={i} className={styles.block}>
                  <span className={styles.blockLabel}>{step.block}</span>
                  {step.caption && <span className={styles.blockCaption}>{step.caption}</span>}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
