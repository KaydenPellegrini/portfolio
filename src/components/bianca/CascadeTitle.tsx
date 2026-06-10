'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  text: string
  className?: string
  baseDelay?: number
  stepMs?: number
  /** 'load' animates on mount (hero); 'visible' waits until scrolled into view. */
  trigger?: 'load' | 'visible'
  as?: 'h1' | 'h2'
}

/**
 * Display heading that rises letter-by-letter out of a soft blur, painted with
 * the animated silver→glow→purple→blue gradient (.bianca-shine). The real text
 * is exposed to assistive tech via aria-label; the per-letter spans are hidden.
 */
export default function CascadeTitle({
  text,
  className = '',
  baseDelay = 160,
  stepMs = 46,
  trigger = 'load',
  as: Tag = 'h2',
}: Props) {
  const ref = useRef<HTMLHeadingElement | null>(null)
  const [go, setGo] = useState(trigger === 'load')

  useEffect(() => {
    if (trigger !== 'visible') return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGo(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [trigger])

  const words = text.split(' ')
  let letterIndex = -1

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      <span className="bianca-shine bianca-serif inline-block">
        {words.map((word, wordIdx) => (
          <span key={`${word}-${wordIdx}`} className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, chIdx) => {
              letterIndex += 1
              return (
                <span
                  key={`${ch}-${wordIdx}-${chIdx}`}
                  aria-hidden="true"
                  className={go ? 'bianca-letter' : 'inline-block opacity-0'}
                  style={{ animationDelay: `${baseDelay + letterIndex * stepMs}ms` }}
                >
                  {ch}
                </span>
              )
            })}
            {wordIdx < words.length - 1 ? (
              <span aria-hidden="true" className="inline-block" style={{ width: '0.3em' }} />
            ) : null}
          </span>
        ))}
      </span>
    </Tag>
  )
}
