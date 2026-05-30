"use client";

import { useGLTF, Center } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export default function Cave() {
  const gltf = useGLTF("/models/portfolio_room_export_NEW_MASKED_020_AURA_BLEND.glb");

  useEffect(() => {
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [gltf]);

  return (
    <>
      <ambientLight intensity={2} color="#d0e8ff" />
      <directionalLight
        position={[-6.59, 0.98, 6.59]}
        intensity={2}
        color="#d0e8ff"
      />

      <directionalLight
        position={[6.59, 0.98, 6.59]}
        intensity={3.5}
        color="#d0e8ff"
      />

      <directionalLight
        position={[6.59, 0.98, -6.59]}
        intensity={1.5}
        color="#d0e8ff"
      />

      <directionalLight
        position={[-6.59, 0.98, -6.59]}
        intensity={2}
        color="#d0e8ff"
      />
      <Center>
        <primitive object={gltf.scene} />
      </Center>
    </>
  );
}

useGLTF.preload("/models/portfolio_room_export_NEW_MASKED_020_AURA_BLEND.glb");
