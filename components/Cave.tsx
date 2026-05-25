"use client";

import { useGLTF, Center } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export default function Cave() {
  const gltf = useGLTF("/models/portfolio_room_export_FINAL_REVISED_v02_MASKED_020.glb");

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
      {/* BASE — warm ground, cool sky — creates natural depth contrast */}
      <ambientLight intensity={2} color="#d0e8ff" />
      {/* <ambientLight intensity={2} color="#d0e8ff" /> */}
      {/* SHIRE — ground level, angled toward Shire */}
      <directionalLight
        position={[-6.59, 0.98, 6.59]}
        intensity={2}
        color="#d0e8ff"
      />

      {/* MELLON — ground level, angled toward Mellon */}
      <directionalLight
        position={[6.59, 0.98, 6.59]}
        intensity={3.5}
        color="#d0e8ff"
      />

      {/* ARGONATH — ground level, angled toward Argonath */}
      <directionalLight
        position={[6.59, 0.98, -6.59]}
        intensity={1.5}
        color="#d0e8ff"
      />

      {/* BALROG — ground level, angled toward Balrog */}
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

useGLTF.preload("/models/portfolio_room_export_FINAL_REVISED_v02_MASKED_020.glb");
