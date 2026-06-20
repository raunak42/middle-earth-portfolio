"use client";

import "@/components/setupCustomToneMapping";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
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

// The desktop info-card effect scales the DOM around the scene with CSS
// transforms while clipping it into the notebook cutout. react-use-measure
// (used by R3F's <Canvas>) reads getBoundingClientRect() by default, which
// includes that transform. On some screens the renderer would then lock its
// WebGL viewport to the small notebook size and never grow it back when the
// scene expanded, leaving the scene rendered only in the top-left corner with
// black everywhere else. offsetSize measures the element's layout box instead
// of the transformed visual box, so the renderer stays correctly sized.
const CANVAS_RESIZE_OPTIONS = { offsetSize: true };

function shouldPauseScene() {
  if (typeof document === "undefined") return false;

  return document.visibilityState !== "visible";
}

function useInactiveTabPause() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const setPausedState = (nextPaused: boolean) => {
      setPaused((current) => (current === nextPaused ? current : nextPaused));
    };

    const updatePaused = () => {
      setPausedState(shouldPauseScene());
    };

    const pauseImmediately = () => {
      setPausedState(true);
    };

    updatePaused();

    window.addEventListener("pageshow", updatePaused);
    window.addEventListener("pagehide", pauseImmediately);
    document.addEventListener("visibilitychange", updatePaused);

    return () => {
      window.removeEventListener("pageshow", updatePaused);
      window.removeEventListener("pagehide", pauseImmediately);
      document.removeEventListener("visibilitychange", updatePaused);
    };
  }, []);

  return paused;
}

function SceneReadyNotifier({ onReady }: { onReady?: () => void }) {
  const readyRef = useRef(false);

  useFrame(() => {
    if (readyRef.current || !onReady) return;
    readyRef.current = true;
    requestAnimationFrame(onReady);
  });

  return null;
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
  onReady,
  onViewClick,
  zoom,
}: {
  controlsDisabled: boolean;
  dprOverride?: number;
  onReady?: () => void;
  onViewClick: (view: InfoViewName) => void;
  zoom: number;
}) {
  const inactivePaused = useInactiveTabPause();
  const frameloop: SceneFrameloop = inactivePaused ? "never" : "always";
  const motionAwareDpr = useMotionAwareDpr(inactivePaused, controlsDisabled);
  const dpr = dprOverride ?? motionAwareDpr;

  return (
    <Canvas
      className={`!h-full !w-full !block ${controlsDisabled ? "touch-pan-y" : "touch-none"}` }
      shadows
      dpr={dpr}
      resize={CANVAS_RESIZE_OPTIONS}
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
      <SceneReadyNotifier onReady={onReady} />
      <Cave />
      <CameraRig disabled={controlsDisabled} zoom={zoom} />
      <AnimatedPropsSquash />
      <SceneClickHandler disabled={controlsDisabled} onViewClick={onViewClick} />
    </Canvas>
  );
}
