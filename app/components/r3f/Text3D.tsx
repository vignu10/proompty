'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text3D as Text3DImpl, Center } from '@react-three/drei'
import { Mesh } from 'three'
import { easing } from 'maath'

interface Text3DProps {
  text: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  color?: string
  size?: number
  height?: number
  bevelEnabled?: boolean
  bevelThickness?: number
  bevelSize?: number
  floatIntensity?: number
  scrollIntensity?: number
}

export default function Text3D({
  text,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#ffffff',
  size = 2,
  height = 0.5,
  bevelEnabled = true,
  bevelThickness = 0.1,
  bevelSize = 0.05,
  floatIntensity = 0.1,
  scrollIntensity = 1,
}: Text3DProps) {
  const meshRef = useRef<Mesh>(null)
  const initialPosition = useRef(position)
  const initialRotation = useRef(rotation)
  const time = useRef(0)

  useFrame((state, delta) => {
    if (!meshRef.current) return

    time.current += delta

    // Floating animation
    const floatY = Math.sin(time.current * 0.5) * floatIntensity
    const floatX = Math.cos(time.current * 0.3) * (floatIntensity * 0.5)

    // Scroll-based rotation
    const scrollRotation = state.clock.elapsedTime * 0.05

    meshRef.current.position.x = initialPosition.current[0] + floatX
    meshRef.current.position.y = initialPosition.current[1] + floatY
    meshRef.current.position.z = initialPosition.current[2]

    meshRef.current.rotation.x = initialRotation.current[0] + Math.sin(time.current * 0.2) * 0.1
    meshRef.current.rotation.y = initialRotation.current[1] + Math.cos(time.current * 0.3) * 0.1
  })

  return (
    <Center position={position}>
      <Text3DImpl
        ref={meshRef}
        font="/fonts/helvetiker_bold.typeface.json"
        size={size}
        height={height}
        curveSegments={12}
        bevelEnabled={bevelEnabled}
        bevelThickness={bevelThickness}
        bevelSize={bevelSize}
        bevelOffset={0}
        bevelSegments={5}
      >
        {text}
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1}
        />
      </Text3DImpl>
    </Center>
  )
}
