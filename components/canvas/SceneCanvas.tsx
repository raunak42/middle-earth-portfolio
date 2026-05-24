"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

export default function SceneCanvas({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: 4 }} // ACESFilmic tone mapping
        camera={{
  fov: 45,
  near: 2,
  far: 30,
}}
      >
        <Suspense
          fallback={
            <mesh>
              <boxGeometry />
              <meshStandardMaterial color="red" />
            </mesh>
          }
        >
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
