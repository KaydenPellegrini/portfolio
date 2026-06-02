'use client'

import { useState } from 'react'
/* eslint-disable @next/next/no-img-element -- poster is a local SVG; <video> poster handles the rest */
import styles from '@/app/showcase/showcase.module.css'

type Props = {
  src: string
  poster?: string
}

/**
 * Looping, muted screen-capture. If the video file is missing (placeholder
 * stage) it falls back to the poster image so the layout never breaks.
 */
export default function VideoLoop({ src, poster }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed && poster) {
    return (
      <div className={styles.video}>
        <img src={poster} alt="Project walkthrough preview" />
        <span className={styles.videoNote}>Demo clip coming soon</span>
      </div>
    )
  }

  return (
    <div className={styles.video}>
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
      />
      <span className={styles.videoNote}>Looping walkthrough</span>
    </div>
  )
}
