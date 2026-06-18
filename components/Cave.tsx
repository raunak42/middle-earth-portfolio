"use client";

import { useGLTF, Center } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

const CUTOUT_ALPHA_TEST = 0.55;

function tuneCutoutMaterial(material: THREE.Material) {
  if (material.alphaTest <= 0) return;

  material.alphaTest = Math.max(material.alphaTest, CUTOUT_ALPHA_TEST);
  material.needsUpdate = true;
}

export default function Cave() {
  const gltf = useGLTF("/models/portfolio_room_export_NEW_MASKED_020_AURA_BLEND.glb");
  const scene = useMemo(() => cloneSkeleton(gltf.scene), [gltf.scene]);

  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const { material } = mesh;
        if (Array.isArray(material)) {
          material.forEach(tuneCutoutMaterial);
        } else {
          tuneCutoutMaterial(material);
        }
      }
    });
  }, [scene]);

  return (
    <>
      <ambientLight intensity={2} color="#d0e8ff" />
      {/* Raise intensity to brighten the roof underside; keep y below the ceiling. */}
      <pointLight
        position={[0, 4.05, 0]}
        intensity={0.9}
        distance={20}
        decay={0.75}
        color="#fff1d8"
      />
      <pointLight
        position={[-4.2, 4.05, 4.2]}
        intensity={0.85}
        distance={12}
        decay={0.75}
        color="#fff1d8"
      />
      <pointLight
        position={[4.2, 4.05, 4.2]}
        intensity={0.85}
        distance={12}
        decay={0.75}
        color="#fff1d8"
      />
      <pointLight
        position={[4.2, 4.05, -4.2]}
        intensity={0.85}
        distance={12}
        decay={0.75}
        color="#fff1d8"
      />
      <pointLight
        position={[-4.2, 4.05, -4.2]}
        intensity={0.85}
        distance={12}
        decay={0.75}
        color="#fff1d8"
      />
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
        <primitive object={scene} />
      </Center>
    </>
  );
}

useGLTF.preload("/models/portfolio_room_export_NEW_MASKED_020_AURA_BLEND.glb");
