'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delay?: number
  threshold?: number
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'aside' | 'figure' | 'li'
  style?: CSSProperties
}

/**
 * Fade/blur-up on scroll into view. Once revealed it stays revealed.
 * Honours prefers-reduced-motion via the .bianca-* classes in globals.css.
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  threshold = 0.14,
  as: Tag = 'div',
  style,
}: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <Tag
      ref={ref as never}
      className={`${visible ? 'bianca-in' : 'bianca-pre'} ${className}`}
      style={{ animationDelay: visible ? `${delay}ms` : undefined, ...style }}
    >
      {children}
    </Tag>
  )
}
