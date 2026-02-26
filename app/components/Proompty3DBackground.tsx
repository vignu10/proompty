"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Floating card component
function FloatingCard({
  position,
  rotation,
  color,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  scale: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle rotation based on time
      meshRef.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.y = rotation[1] + Math.cos(state.clock.elapsedTime * 0.2) * 0.1;

      // Subtle float movement
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[1, 1.4, 0.1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={0.7}
          emissive={color}
          emissiveIntensity={0.4}
          wireframe
        />
      </mesh>
    </Float>
  );
}

// Floating code block component
function FloatingCodeBlock({
  position,
  rotation,
  color,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  scale: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * 0.25) * 0.15;
      groupRef.current.rotation.z = rotation[2] + Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 + position[2]) * 0.15;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Main block */}
        <mesh>
          <boxGeometry args={[1.2, 0.8, 0.15]} />
          <meshStandardMaterial
            color={color}
            metalness={0.5}
            roughness={0.3}
            transparent
            opacity={0.6}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Code lines */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.15 - i * 0.15, 0.08]}>
            <boxGeometry args={[0.9, 0.04, 0.01]} />
            <meshStandardMaterial
              color="#00f3ff"
              emissive="#00f3ff"
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Floating geometric shapes
function FloatingShape({
  position,
  geometry,
  color,
  scale,
}: {
  position: [number, number, number];
  geometry: "icosahedron" | "octahedron" | "tetrahedron";
  color: string;
  scale: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry === "icosahedron" && <icosahedronGeometry args={[1, 0]} />}
        {geometry === "octahedron" && <octahedronGeometry args={[1, 0]} />}
        {geometry === "tetrahedron" && <tetrahedronGeometry args={[1, 0]} />}
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.2}
          transparent
          opacity={0.5}
          emissive={color}
          emissiveIntensity={0.2}
          wireframe
        />
      </mesh>
    </Float>
  );
}

// Scene component
function Scene({ scrollY }: { scrollY: number }) {
  const { camera } = useThree();

  // Generate floating elements
  const floatingCards = useMemo(() => {
    return Array.from({ length: 8 }, () => ({
      position: [
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10 - 5,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ] as [number, number, number],
      color: Math.random() > 0.5 ? "#00f3ff" : "#9d00ff",
      scale: 0.6 + Math.random() * 0.6,
    }));
  }, []);

  const floatingCodeBlocks = useMemo(() => {
    return Array.from({ length: 6 }, () => ({
      position: [
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8 - 4,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI * 0.5,
        Math.random() * Math.PI * 0.5,
        Math.random() * Math.PI * 0.5,
      ] as [number, number, number],
      color: Math.random() > 0.5 ? "#9d00ff" : "#00f3ff",
      scale: 0.5 + Math.random() * 0.5,
    }));
  }, []);

  const floatingShapes = useMemo(() => {
    const geometries: Array<"icosahedron" | "octahedron" | "tetrahedron"> = [
      "icosahedron",
      "octahedron",
      "tetrahedron",
    ];
    return Array.from({ length: 12 }, () => ({
      position: [
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12 - 6,
      ] as [number, number, number],
      geometry: geometries[Math.floor(Math.random() * geometries.length)],
      color: Math.random() > 0.5 ? "#00f3ff" : "#9d00ff",
      scale: 0.4 + Math.random() * 0.6,
    }));
  }, []);

  // Update camera based on scroll
  useFrame(() => {
    camera.position.y = -scrollY * 0.002;
  });

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.4} />

      {/* Point lights for neon effect */}
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00f3ff" />
      <pointLight position={[-10, -10, 10]} intensity={0.8} color="#9d00ff" />
      <pointLight position={[0, 5, -10]} intensity={0.5} color="#00f3ff" />
      <pointLight position={[5, -5, 5]} intensity={0.4} color="#9d00ff" />

      {/* Floating cards */}
      {floatingCards.map((card, index) => (
        <FloatingCard
          key={`card-${index}`}
          position={card.position}
          rotation={card.rotation}
          color={card.color}
          scale={card.scale}
        />
      ))}

      {/* Floating code blocks */}
      {floatingCodeBlocks.map((block, index) => (
        <FloatingCodeBlock
          key={`block-${index}`}
          position={block.position}
          rotation={block.rotation}
          color={block.color}
          scale={block.scale}
        />
      ))}

      {/* Floating geometric shapes */}
      {floatingShapes.map((shape, index) => (
        <FloatingShape
          key={`shape-${index}`}
          position={shape.position}
          geometry={shape.geometry}
          color={shape.color}
          scale={shape.scale}
        />
      ))}
    </>
  );
}

// Main component
export default function Proompty3DBackground() {
  const [isMounted, setIsMounted] = useState(false);
  const scrollYRef = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <Scene scrollY={scrollYRef.current} />
      </Canvas>
    </div>
  );
}
