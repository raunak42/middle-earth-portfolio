"use client";

import "@/components/setupCustomToneMapping";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import AnimatedPropsSquash from "@/components/AnimatedPropsSquash";
import CameraRig from "@/components/CameraRig";
import Cave from "@/components/Cave";
import SceneClickHandler from "@/components/SceneClickHandler";
import { type InfoViewName } from "@/components/InfoView";

export default function ScenePanel({
  controlsDisabled,
  onViewClick,
  zoom,
}: {
  controlsDisabled: boolean;
  onViewClick: (view: InfoViewName) => void;
  zoom: number;
}) {
  return (
    <Canvas
      className="!h-full !w-full !block"
      shadows
      camera={{ position: [0, 0.15, 0.5], fov: 60, near: 0.001, far: 100 }}
      gl={{
        antialias: true,
        toneMapping: THREE.CustomToneMapping,
        toneMappingExposure: 1.2,
      }}
    >
      <Cave />
      <CameraRig disabled={controlsDisabled} zoom={zoom} />
      <AnimatedPropsSquash />
      <SceneClickHandler disabled={controlsDisabled} onViewClick={onViewClick} />
    </Canvas>
  );
}
