import { createElement } from 'react'
import type { ElementType, ReactNode } from 'react'
import styles from '@/app/supremediesel/supremediesel.module.css'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Render as a different element (defaults to div). */
  as?: ElementType
}

/**
 * Scroll-reveal wrapper — pure CSS, no JavaScript.
 *
 * Content is visible by default; browsers that support scroll-driven animations
 * (`animation-timeline: view()`) fade/rise each block in as it scrolls into view.
 * Everything else — no-JS, older browsers, crawlers — simply sees the content,
 * so a business page can never end up blank. See `.reveal` in the CSS module.
 */
export default function Reveal({ children, className, as: Tag = 'div' }: RevealProps) {
  return createElement(
    Tag,
    { className: `${styles.reveal}${className ? ` ${className}` : ''}` },
    children,
  )
}
