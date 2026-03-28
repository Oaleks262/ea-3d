import { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

// Track mouse globally
const mouse = { x: 0, y: 0 }
const targetRotation = { x: 0, y: 0 }

function ModelMesh({ url }) {
  const groupRef = useRef()
  const { scene } = useGLTF(url)

  useFrame(() => {
    if (!groupRef.current) return
    // Smooth lerp toward cursor direction
    targetRotation.y = mouse.x * 0.6
    targetRotation.x = -mouse.y * 0.3

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation.y,
      0.04
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotation.x,
      0.04
    )
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.5} position={[0, -1, 0]} />
    </group>
  )
}

function OrbPlaceholder() {
  const orbRef = useRef()
  const orbitRef = useRef()
  const glowRef = useRef()
  const timeRef = useRef(0)

  useFrame((state, delta) => {
    timeRef.current += delta

    if (!orbRef.current) return

    // Smooth cursor following
    const targetY = mouse.x * 0.8
    const targetX = -mouse.y * 0.4

    orbRef.current.rotation.y = THREE.MathUtils.lerp(
      orbRef.current.rotation.y,
      targetY,
      0.04
    )
    orbRef.current.rotation.x = THREE.MathUtils.lerp(
      orbRef.current.rotation.x,
      targetX,
      0.04
    )

    // Gentle floating animation on Y position
    orbRef.current.position.y = Math.sin(timeRef.current * 0.8) * 0.08

    // Slow self-rotation for visual interest
    orbRef.current.rotation.z += delta * 0.15

    // Orbiting satellite
    if (orbitRef.current) {
      orbitRef.current.position.x = Math.cos(timeRef.current * 1.2) * 1.2
      orbitRef.current.position.y = Math.sin(timeRef.current * 0.7) * 0.4
      orbitRef.current.position.z = Math.sin(timeRef.current * 1.2) * 1.2
    }

    // Pulsing glow sphere
    if (glowRef.current) {
      const pulse = 1 + Math.sin(timeRef.current * 2.5) * 0.05
      glowRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  return (
    <group>
      {/* Inner glow point light */}
      <pointLight color="#7B2FF7" intensity={3} distance={4} position={[0, 0, 0.5]} />
      <pointLight color="#FF2FD1" intensity={1.5} distance={3} position={[0.5, 0.5, -0.5]} />

      {/* Main orb */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.85, 64, 64]} />
        <meshStandardMaterial
          color="#7B2FF7"
          emissive="#FF2FD1"
          emissiveIntensity={0.35}
          metalness={0.8}
          roughness={0.15}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Outer glow shell */}
      <mesh ref={glowRef} scale={1.18}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial
          color="#9B4FFF"
          emissive="#7B2FF7"
          emissiveIntensity={0.12}
          metalness={0}
          roughness={1}
          transparent
          opacity={0.18}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Orbiting satellite sphere */}
      <mesh ref={orbitRef} position={[1.2, 0, 0]} scale={0.22}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#FF2FD1"
          emissive="#FF2FD1"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Thin ring around the orb */}
      <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
        <torusGeometry args={[1.2, 0.015, 16, 100]} />
        <meshStandardMaterial
          color="#FF2FD1"
          emissive="#FF2FD1"
          emissiveIntensity={0.8}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  )
}

function ModelWithFallback({ url }) {
  return (
    <ModelMesh url={url} />
  )
}

function SceneContent({ modelUrl }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.4} color="#7B2FF7" />
      <Environment preset="city" />

      {modelUrl ? (
        <Suspense fallback={<OrbPlaceholder />}>
          <ModelWithFallback url={modelUrl} />
        </Suspense>
      ) : (
        <OrbPlaceholder />
      )}
    </>
  )
}

function AvatarScene({ modelUrl }) {
  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <SceneContent modelUrl={modelUrl} />
    </Canvas>
  )
}

export default AvatarScene
