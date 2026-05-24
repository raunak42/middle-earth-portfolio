"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Cave from "@/components/canvas/Cave";
import * as THREE from "three";
import CameraDebug from "@/components/CameraDebug";

export default function HomePage() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        shadows
        camera={{ position: [0, 0.15, 0.5], fov: 60, near: 0.001, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Cave />
        <OrbitControls target={[0, 0.1, 0]} />
        <CameraDebug />
      </Canvas>
    </div>
  );
}
