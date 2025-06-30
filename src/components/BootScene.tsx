import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import GlobeMesh from './GlobeMesh'

export default function BootScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 2, 5]} />
      <GlobeMesh />
      <OrbitControls autoRotate enableZoom={false} enablePan={false} />
    </Canvas>
  )
} 