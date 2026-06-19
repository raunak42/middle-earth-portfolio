"use client";

import "@/components/setupCustomToneMapping";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import AnimatedPropsSquash from "@/components/AnimatedPropsSquash";
import CameraRig from "@/components/CameraRig";
import Cave from "@/components/Cave";
import SceneClickHandler from "@/components/SceneClickHandler";
import { type InfoViewName } from "@/components/InfoView";

type SceneFrameloop = "always" | "never";

const IDLE_DPR = 2;
const MOVING_DPR = 1.5;
const CAMERA_MOTION_DPR = 1.6;
const PANEL_DPR = 1.1;
const PAUSED_DPR = 1;
const DPR_RESTORE_DELAY = 1200;
const EXPAND_DPR_RESTORE_DELAY = 750;

function shouldPauseScene() {
  if (typeof document === "undefined") return false;

  return document.visibilityState !== "visible";
}

function useInactiveTabPause() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const updatePaused = () => {
      const nextPaused = shouldPauseScene();
      setPaused((current) => (current === nextPaused ? current : nextPaused));
    };

    updatePaused();

    window.addEventListener("focus", updatePaused);
    window.addEventListener("blur", updatePaused);
    window.addEventListener("pageshow", updatePaused);
    window.addEventListener("pagehide", updatePaused);
    document.addEventListener("visibilitychange", updatePaused);

    return () => {
      window.removeEventListener("focus", updatePaused);
      window.removeEventListener("blur", updatePaused);
      window.removeEventListener("pageshow", updatePaused);
      window.removeEventListener("pagehide", updatePaused);
      document.removeEventListener("visibilitychange", updatePaused);
    };
  }, []);

  return paused;
}

function useMotionAwareDpr(
  inactivePaused: boolean,
  controlsDisabled: boolean,
) {
  const [dpr, setDpr] = useState(MOVING_DPR);
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearRestoreTimer = () => {
      if (restoreTimer.current) clearTimeout(restoreTimer.current);
      restoreTimer.current = null;
    };

    const restoreQualitySoon = () => {
      clearRestoreTimer();
      restoreTimer.current = setTimeout(() => {
        setDpr(IDLE_DPR);
        restoreTimer.current = null;
      }, DPR_RESTORE_DELAY);
    };

    if (inactivePaused) {
      clearRestoreTimer();
      const pauseTimer = setTimeout(() => setDpr(PAUSED_DPR), 0);

      return () => {
        clearTimeout(pauseTimer);
        clearRestoreTimer();
      };
    }

    if (controlsDisabled) {
      clearRestoreTimer();
      const panelTimer = setTimeout(() => setDpr(PANEL_DPR), 0);

      return () => {
        clearTimeout(panelTimer);
        clearRestoreTimer();
      };
    }

    const idleTimer = setTimeout(
      () => setDpr(IDLE_DPR),
      EXPAND_DPR_RESTORE_DELAY,
    );

    const markCameraMotion = () => {
      setDpr(CAMERA_MOTION_DPR);
      restoreQualitySoon();
    };

    window.addEventListener("wheel", markCameraMotion, {
      passive: true,
    });
    window.addEventListener("keydown", markCameraMotion);
    window.addEventListener("touchstart", markCameraMotion, {
      passive: true,
    });

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("wheel", markCameraMotion);
      window.removeEventListener("keydown", markCameraMotion);
      window.removeEventListener("touchstart", markCameraMotion);
      clearRestoreTimer();
    };
  }, [controlsDisabled, inactivePaused]);

  return dpr;
}

export default function ScenePanel({
  controlsDisabled,
  dprOverride,
  onViewClick,
  zoom,
}: {
  controlsDisabled: boolean;
  dprOverride?: number;
  onViewClick: (view: InfoViewName) => void;
  zoom: number;
}) {
  const inactivePaused = useInactiveTabPause();
  const frameloop: SceneFrameloop = inactivePaused ? "never" : "always";
  const motionAwareDpr = useMotionAwareDpr(inactivePaused, controlsDisabled);
  const dpr = dprOverride ?? motionAwareDpr;

  return (
    <Canvas
      className="!h-full !w-full !block"
      shadows
      dpr={dpr}
      frameloop={frameloop}
      camera={{ position: [0, 0.15, 0.5], fov: 60, near: 0.001, far: 100 }}
      gl={{
        antialias: true,
        powerPreference: "default",
        preserveDrawingBuffer: true,
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
