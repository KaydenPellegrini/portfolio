'use client'

import styles from '@/app/showcase/showcase.module.css'

type Props = {
  url: string
  title?: string
}

/** A running project framed inside a faux browser window. */
export default function LiveEmbed({ url, title }: Props) {
  const isExternal = /^https?:\/\//.test(url)

  return (
    <div className={styles.browser}>
      <div className={styles.browserBar}>
        <span className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className={styles.browserUrl}>{title ?? url}</span>
      </div>
      <iframe
        className={styles.embedFrame}
        src={url}
        title={title ?? 'Live project preview'}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
      <a
        className={styles.embedOpen}
        href={url}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        Open in a new tab ↗
      </a>
    </div>
  )
}
