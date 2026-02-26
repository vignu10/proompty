'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, Environment, Float, MeshDistortMaterial } from '@react-three/drei'
import { Group, Mesh } from 'three'
import { easing } from 'maath'
import Text3D from './Text3D'

export default function Experience() {
  const groupRef = useRef<Group>(null)
  const sphereRef = useRef<Mesh>(null)
  const scroll = useScroll()
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    const scrollOffset = scroll.offset

    // Camera movement based on scroll
    easing.damp3(
      state.camera.position,
      [
        Math.sin(scrollOffset * Math.PI * 2) * 5,
        -scrollOffset * 10,
        15 + Math.cos(scrollOffset * Math.PI) * 5,
      ],
      0.5,
      delta
    )

    state.camera.lookAt(0, 0, 0)

    // Animate hero text based on scroll
    if (groupRef.current) {
      groupRef.current.rotation.y = scrollOffset * Math.PI * 2
      groupRef.current.position.y = -scrollOffset * 8

      // Opacity fade based on scroll
      const opacity = 1 - scrollOffset * 2
      groupRef.current.children.forEach((child) => {
        if (child instanceof Mesh) {
          const material = child.material as any
          if (material) {
            material.opacity = Math.max(0, opacity)
            material.transparent = true
          }
        }
      })
    }

    // Animate background sphere
    if (sphereRef.current) {
      sphereRef.current.rotation.x += delta * 0.1
      sphereRef.current.rotation.y += delta * 0.15
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      sphereRef.current.scale.setScalar(scale)
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#a78bfa"
        castShadow
      />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Main 3D Content Group */}
      <group ref={groupRef}>
        {/* Hero Text */}
        <Text3D
          text="CREATIVE"
          position={[-4, 2, 0]}
          size={1.5}
          height={0.3}
          color="#ffffff"
          floatIntensity={0.05}
        />

        <Text3D
          text="TECHNOLOGY"
          position={[-4.5, 0, 0]}
          size={1.5}
          height={0.3}
          color="#a78bfa"
          floatIntensity={0.05}
        />

        <Text3D
          text="REIMAGINED"
          position={[-4, -2, 0]}
          size={1.5}
          height={0.3}
          color="#8b5cf6"
          floatIntensity={0.05}
        />
      </group>

      {/* Background Abstract Shape */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={sphereRef} position={[8, 0, -5]} scale={4}>
          <torusKnotGeometry args={[1, 0.3, 128, 32]} />
          <MeshDistortMaterial
            color="#8b5cf6"
            attach="material"
            distort={0.5}
            speed={2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </Float>

      {/* Floating Particles */}
      <Particles count={100} />
    </>
  )
}

function Particles({ count = 50 }: { count: number }) {
  const particles = useRef<Group>(null)

  const positions = Array.from({ length: count }, () => ({
    position: [
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20 - 5,
    ] as [number, number, number],
    scale: Math.random() * 0.1 + 0.02,
    speed: Math.random() * 0.5 + 0.1,
  }))

  useFrame((state) => {
    if (!particles.current) return

    particles.current.children.forEach((particle, i) => {
      const data = positions[i]
      particle.position.y = data.position[1] + Math.sin(state.clock.elapsedTime * data.speed) * 2
    })
  })

  return (
    <group ref={particles}>
      {positions.map((data, i) => (
        <mesh key={i} position={data.position} scale={data.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#a78bfa" emissive="#8b5cf6" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}
