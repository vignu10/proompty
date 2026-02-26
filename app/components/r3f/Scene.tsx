'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import Experience from './Experience'

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: 2, // ACESFilmicToneMapping
        toneMappingExposure: 1.2,
      }}
      camera={{
        position: [0, 0, 15],
        fov: 45,
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
      }}
    >
      <Suspense fallback={null}>
        <ScrollControls pages={4} damping={0.3}>
          <Experience />
        </ScrollControls>
      </Suspense>
    </Canvas>
  )
}
