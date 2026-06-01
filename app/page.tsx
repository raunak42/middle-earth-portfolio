"use client";

import { useState } from "react";
import { useProgress } from "@react-three/drei";
import AppLoader from "@/components/AppLoader";
import InfoView, { type InfoViewName } from "@/components/InfoView";
import ScenePanel from "@/components/ScenePanel";
import ZoomControl from "@/components/ZoomControl";

export default function HomePage() {
  const [infoView, setInfoView] = useState<InfoViewName | null>(null);
  const [zoom, setZoom] = useState(0);
  const { active, progress } = useProgress();

  const infoOpen = infoView !== null;
  const loading = active || progress < 100;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <InfoView
        view={infoView}
        onClose={() => setInfoView(null)}
        onViewChange={setInfoView}
      />

      <div
        className={`absolute z-[3] overflow-hidden transform-gpu transition-[inset,border-radius,box-shadow,opacity] duration-[650ms] ease-[cubic-bezier(0.76,0,0.24,1)] after:content-[''] after:absolute after:inset-0 after:z-[2] after:pointer-events-none after:border-dashed after:border-white/95 after:opacity-100 after:transition-[border-width,border-radius] after:duration-[650ms] after:ease-[cubic-bezier(0.76,0,0.24,1)] ${
          loading ? "pointer-events-none opacity-0" : "opacity-100"
        } ${
          infoOpen
            ? "inset-[25vh_42.5vw_19.1vh_6.5vw] rounded-[16px] shadow-[0_24px_80px_rgba(55,23,17,0.22)] after:border-[4px] after:rounded-[16px]"
            : "inset-0 rounded-none shadow-none after:border-[6px] after:rounded-none"
        }`}
      >
        <ScenePanel
          controlsDisabled={infoOpen}
          zoom={zoom}
          onViewClick={setInfoView}
        />
      </div>

      <ZoomControl
        hidden={infoOpen || loading}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <AppLoader />
    </div>
  );
}
