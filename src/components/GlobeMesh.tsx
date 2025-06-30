import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const cities = [
  { name: 'Ashburn', lat: 39.0438, lon: -77.4874 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918 },
  { name: 'Port of Spain', lat: 10.6549, lon: -61.5019 },
]

function latLonToVector3(lat: number, lon: number, radius = 1.5) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

export default function GlobeMesh() {
  const globeRef = useRef<any>()

  useFrame(() => {
    if (globeRef.current) globeRef.current.rotation.y += 0.0015
  })

  return (
    <group ref={globeRef}>
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial color="#1e293b" wireframe />
      </mesh>

      {cities.map((city, i) => {
        const pos = latLonToVector3(city.lat, city.lon)
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial emissive="#00f0ff" emissiveIntensity={1.5} color="black" />
          </mesh>
        )
      })}
    </group>
  )
} 