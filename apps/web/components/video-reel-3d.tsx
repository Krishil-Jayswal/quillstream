"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { useRef, useEffect } from "react"
import type * as THREE from "three"

function AINotesModel() {
  const videoScreenRef = useRef<THREE.Group>(null)
  const notesGroupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Group>(null)
  const playButtonRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    const animate = () => {
      // Rotate video screen slightly
      if (videoScreenRef.current) {
        videoScreenRef.current.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1
      }

      // Animate notes appearing and fading
      if (notesGroupRef.current) {
        notesGroupRef.current.children.forEach((child, index) => {
          const time = Date.now() * 0.001
          const cycle = (time + index * 0.3) % 3
          child.position.y = -0.3 + cycle * 0.6
          const mesh = child as THREE.Mesh
          if (mesh.material && 'opacity' in mesh.material) {
            ;(mesh.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 1 - (cycle - 1.5) * 2)
          }
        })
      }

      // Animate particles flowing from video to notes
      if (particlesRef.current) {
        particlesRef.current.children.forEach((child, index) => {
          const time = Date.now() * 0.001
          const progress = (time * 0.5 + index * 0.1) % 1
          child.position.x = -2.5 + progress * 5
          child.position.y = Math.sin(progress * Math.PI * 2) * 0.8
          child.position.z = Math.cos(progress * Math.PI * 2) * 0.5
          const mesh = child as THREE.Mesh
          if (mesh.material && 'opacity' in mesh.material) {
            ;(mesh.material as THREE.MeshStandardMaterial).opacity = Math.sin(progress * Math.PI) * 0.8
          }
        })
      }

      // Pulse play button
      if (playButtonRef.current) {
        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1
        playButtonRef.current.scale.set(scale, scale, scale)
      }

      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  return (
    <group>
      {/* VIDEO SCREEN - LEFT SIDE */}
      <group ref={videoScreenRef} position={[-2.5, 0, 0]}>
        {/* Screen frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.8, 1.2, 0.15]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Screen display */}
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[1.6, 1, 0.05]} />
          <meshStandardMaterial color="#0f3460" emissive="#00c8ff" emissiveIntensity={0.3} />
        </mesh>

        {/* Video content - animated bars */}
        {[...Array(4)].map((_, i) => (
          <mesh key={`bar-${i}`} position={[-0.5 + i * 0.4, -0.2 + Math.sin(Date.now() * 0.005 + i) * 0.15, 0.12]}>
            <boxGeometry args={[0.25, 0.3 + Math.sin(Date.now() * 0.005 + i) * 0.2, 0.02]} />
            <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.6} />
          </mesh>
        ))}

        {/* Play button */}
        <mesh ref={playButtonRef} position={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
          <meshStandardMaterial color="#6500ff" emissive="#6500ff" emissiveIntensity={0.8} />
        </mesh>

        {/* Play icon triangle */}
        <mesh position={[0.05, 0, 0.18]}>
          <coneGeometry args={[0.12, 0.15, 3]} />
          <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={1} />
        </mesh>

        {/* Glow border */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[2, 1.4, 0.1]} />
          <meshStandardMaterial color="#00c8ff" transparent opacity={0.2} emissive="#00c8ff" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* NOTES DOCUMENT - RIGHT SIDE */}
      <group position={[2.5, 0, 0]}>
        {/* Document background */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 2, 0.1]} />
          <meshStandardMaterial color="#f5f5f5" metalness={0.1} roughness={0.8} />
        </mesh>

        {/* Document lines (notes) */}
        <group ref={notesGroupRef}>
          {[...Array(5)].map((_, i) => (
            <mesh key={`line-${i}`} position={[-0.6, 0.7 - i * 0.35, 0.08]}>
              <boxGeometry args={[1.2, 0.08, 0.02]} />
              <meshStandardMaterial color="#6500ff" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>

        {/* Document glow */}
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[1.8, 2.2, 0.05]} />
          <meshStandardMaterial color="#00d9ff" transparent opacity={0.15} emissive="#00d9ff" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* ANIMATED PARTICLES - Data flow from video to notes */}
      <group ref={particlesRef}>
        {[...Array(8)].map((_, i) => (
          <mesh key={`particle-${i}`} position={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#00c8ff"
              emissive="#00c8ff"
              emissiveIntensity={0.9}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* CENTER PROCESSING INDICATOR */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.4, 0.05, 16, 100]} />
        <meshStandardMaterial color="#6500ff" emissive="#6500ff" emissiveIntensity={0.5} />
      </mesh>

      {/* Rotating processing ring */}
      <mesh position={[0, 0, 0]} rotation={[0, Date.now() * 0.002, 0]}>
        <torusGeometry args={[0.6, 0.04, 16, 100]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

export function VideoReel3D() {
  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border border-border bg-card/50 backdrop-blur-sm">
      <Canvas>
        <PerspectiveCamera position={[0, 0, 7]} fov={50} />
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00c8ff" />
        <pointLight position={[-5, -5, 5]} intensity={0.8} color="#6500ff" />
        <AINotesModel />
        <OrbitControls enableZoom={false} autoRotate={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
