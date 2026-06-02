'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import TronGrid from './TronGrid'

// R3F is client-only — never let it touch SSR.
const HeroCore = dynamic(() => import('./HeroCore'), { ssr: false })

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * Decides the hero visual at runtime:
 *  - small viewport / no WebGL  -> TronGrid alone (reliable, cheap)
 *  - otherwise                  -> TronGrid backdrop + 3D core floating above it
 * Reduced-motion is handled inside HeroCore (renders a still frame), so the 3D
 * still shows for those users — just without animation.
 */
export default function HeroVisual() {
  const [use3D, setUse3D] = useState(false)

  useEffect(() => {
    const decide = () => {
      const wideEnough = window.innerWidth >= 768
      setUse3D(wideEnough && supportsWebGL())
    }
    decide()
    window.addEventListener('resize', decide)
    return () => window.removeEventListener('resize', decide)
  }, [])

  return (
    <>
      <TronGrid />
      {use3D && (
        <div className="absolute inset-0" aria-hidden="true">
          <HeroCore />
        </div>
      )}
    </>
  )
}
