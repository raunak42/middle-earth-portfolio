"use client";

import { useEffect, useMemo, useState } from "react";
import { useProgress } from "@react-three/drei";
import AppLoader from "@/components/AppLoader";
import InfoView, { type InfoViewName } from "@/components/InfoView";
import ScenePanel from "@/components/ScenePanel";
import ZoomControl from "@/components/ZoomControl";

type ScenePanelMetrics = {
  frameWidth: number;
  height: number;
  radius: number;
  viewportHeight: number;
  viewportWidth: number;
  width: number;
  x: number;
  y: number;
};

function getScenePanelMetrics(): ScenePanelMetrics {
  const viewportWidth = Math.max(window.innerWidth, 1);
  const viewportHeight = Math.max(window.innerHeight, 1);

  if (viewportWidth >= 768) {
    return {
      frameWidth: 4,
      height: viewportHeight * 0.4024,
      radius: 16,
      viewportHeight,
      viewportWidth,
      width: viewportWidth * 0.3656,
      x: viewportWidth * 0.116,
      y: viewportHeight * 0.27,
    };
  }

  const width = Math.min(Math.max(viewportWidth * 0.58, 210), 280);

  return {
    frameWidth: 3,
    height: viewportHeight * 0.36,
    radius: 18,
    viewportHeight,
    viewportWidth,
    width,
    x: (viewportWidth - width) / 2,
    y: viewportHeight * 0.16,
  };
}

function useScenePanelMetrics() {
  const [metrics, setMetrics] = useState<ScenePanelMetrics | null>(null);

  useEffect(() => {
    const updateMetrics = () => setMetrics(getScenePanelMetrics());

    updateMetrics();
    window.addEventListener("resize", updateMetrics);

    return () => window.removeEventListener("resize", updateMetrics);
  }, []);

  return metrics;
}

export default function HomePage() {
  const [infoView, setInfoView] = useState<InfoViewName | null>(null);
  const [zoom, setZoom] = useState(0);
  const { active, progress } = useProgress();
  const sceneMetrics = useScenePanelMetrics();

  const infoOpen = infoView !== null;
  const loading = active || progress < 100;

  const sceneTransformStyle = useMemo(() => {
    if (!infoOpen || !sceneMetrics) {
      return {
        borderRadius: "0px",
        transform: "translate3d(0, 0, 0) scale(1, 1)",
      };
    }

    const scaleX = sceneMetrics.width / sceneMetrics.viewportWidth;
    const scaleY = sceneMetrics.height / sceneMetrics.viewportHeight;

    return {
      borderRadius: `${sceneMetrics.radius / scaleX}px / ${
        sceneMetrics.radius / scaleY
      }px`,
      transform: `translate3d(${sceneMetrics.x}px, ${sceneMetrics.y}px, 0) scale(${scaleX}, ${scaleY})`,
    };
  }, [infoOpen, sceneMetrics]);

  const frameStyle = useMemo(() => {
    if (!infoOpen || !sceneMetrics) {
      return {
        borderColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 0,
        borderWidth: 6,
        height: sceneMetrics?.viewportHeight ?? "100vh",
        left: 0,
        top: 0,
        width: sceneMetrics?.viewportWidth ?? "100vw",
      };
    }

    const frameWidth = sceneMetrics.frameWidth;

    return {
      borderColor: "#24211d",
      borderRadius: sceneMetrics.radius + frameWidth,
      borderWidth: frameWidth,
      height: sceneMetrics.height + frameWidth * 2,
      left: sceneMetrics.x - frameWidth,
      top: sceneMetrics.y - frameWidth,
      width: sceneMetrics.width + frameWidth * 2,
    };
  }, [infoOpen, sceneMetrics]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <InfoView
        view={infoView}
        onClose={() => setInfoView(null)}
        onViewChange={setInfoView}
      />

      <div
        className={`absolute inset-0 z-[3] transform-gpu overflow-hidden shadow-none transition-[transform,border-radius,box-shadow,opacity] duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform ${
          loading
            ? "pointer-events-none opacity-0"
            : "pointer-events-auto opacity-100"
        } ${infoOpen ? "shadow-[0_24px_80px_rgba(55,23,17,0.22)]" : ""}`}
        style={{
          ...sceneTransformStyle,
          transformOrigin: "top left",
        }}
      >
        <ScenePanel
          controlsDisabled={infoOpen}
          zoom={zoom}
          onViewClick={setInfoView}
        />
      </div>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute z-[4] border-dashed transition-[left,top,width,height,border-width,border-radius,border-color,opacity] duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        style={frameStyle}
      />

      <ZoomControl
        hidden={infoOpen || loading}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <AppLoader />
    </div>
  );
}
