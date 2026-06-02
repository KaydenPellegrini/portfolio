'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const CYAN = '#00ff88'
const PURPLE = '#aa50ff'
const DEEP_PURPLE = '#6a0dad'

/** Tiny deterministic PRNG (mulberry32) — pure, so it is safe to call during render. */
function makeRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function usePrefersReducedMotion() {
  // Evaluated once on the client; HeroVisual only mounts this after a client check.
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type GroupProps = { still: boolean }

/** Rotating neon wireframe core with a pulsing inner solid. */
function Core({ still }: GroupProps) {
  const wire = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (still) return
    if (wire.current) {
      wire.current.rotation.x += delta * 0.18
      wire.current.rotation.y += delta * 0.26
    }
    if (inner.current) {
      inner.current.rotation.x -= delta * 0.12
      inner.current.rotation.y -= delta * 0.2
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.04
      inner.current.scale.setScalar(pulse)
    }
  })

  return (
    <group>
      <mesh ref={wire}>
        <icosahedronGeometry args={[1.55, 1]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.9} />
      </mesh>
      <mesh ref={inner} scale={0.62}>
        <icosahedronGeometry args={[1.55, 0]} />
        <meshStandardMaterial
          color={DEEP_PURPLE}
          emissive={PURPLE}
          emissiveIntensity={1.4}
          roughness={0.25}
          metalness={0.6}
          transparent
          opacity={0.55}
        />
      </mesh>
    </group>
  )
}

/** Drifting particle field, cyan-dominant with a purple minority (mirrors TronGrid's 144/278 hue split). */
function ParticleField({ still }: GroupProps) {
  const points = useRef<THREE.Points>(null)
  const COUNT = 520

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const cyan = new THREE.Color(CYAN)
    const purple = new THREE.Color(PURPLE)
    const rand = makeRandom(0x9e3779b9)

    for (let i = 0; i < COUNT; i += 1) {
      // Spherical shell shimmer around the core.
      const radius = 2.4 + rand() * 4.6
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(rand() * 2 - 1)
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const tint = rand() > 0.22 ? cyan : purple
      colors[i * 3] = tint.r
      colors[i * 3 + 1] = tint.g
      colors[i * 3 + 2] = tint.b
    }
    return { positions, colors }
  }, [])

  useFrame((state, delta) => {
    if (still || !points.current) return
    points.current.rotation.y += delta * 0.04
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.08
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Tilts the whole rig toward the cursor for parallax depth. */
function ParallaxRig({ still, children }: GroupProps & { children: React.ReactNode }) {
  const rig = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!rig.current) return
    const targetX = still ? 0 : state.pointer.y * 0.25
    const targetY = still ? 0 : state.pointer.x * 0.35
    rig.current.rotation.x += (targetX - rig.current.rotation.x) * 0.05
    rig.current.rotation.y += (targetY - rig.current.rotation.y) * 0.05
  })

  return <group ref={rig}>{children}</group>
}

export default function HeroCore() {
  const still = usePrefersReducedMotion()

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      frameloop={still ? 'demand' : 'always'}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 5]} intensity={2.4} color={CYAN} />
      <pointLight position={[-5, -3, 2]} intensity={1.6} color={PURPLE} />
      <ParallaxRig still={still}>
        <Core still={still} />
        <ParticleField still={still} />
      </ParallaxRig>
      <EffectComposer>
        <Bloom intensity={1.1} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}
