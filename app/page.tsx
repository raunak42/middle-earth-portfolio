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

      <div className="pointer-events-none absolute inset-0 z-[3] flex justify-center md:block">
        <div
          className={`relative overflow-visible transform-gpu transition-[width,height,margin,border-radius,box-shadow,opacity] duration-[650ms] ease-[cubic-bezier(0.76,0,0.24,1)] after:content-[''] after:absolute after:z-[2] after:pointer-events-none after:border-dashed after:opacity-100 after:transition-[border-width,border-radius,inset] after:duration-[650ms] after:ease-[cubic-bezier(0.76,0,0.24,1)] ${
            loading ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
          } ${
            infoOpen
              ? "mt-[16vh] h-[36vh] w-[min(58vw,280px)] min-w-[210px] rounded-[18px] shadow-[0_24px_80px_rgba(55,23,17,0.22)] after:inset-[-3px] after:border-[3px] after:border-[#24211d] after:rounded-[21px] md:ml-[11.6vw] md:mt-[27vh] md:h-[40.24vh] md:w-[36.56vw] md:min-w-0 md:rounded-[16px] md:after:inset-[-4px] md:after:border-[4px] md:after:rounded-[20px]"
              : "m-0 h-full w-full rounded-none shadow-none after:inset-0 after:border-[6px] after:border-white/95 after:rounded-none"
          }`}
        >
          <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
            <ScenePanel
              controlsDisabled={infoOpen}
              zoom={zoom}
              onViewClick={setInfoView}
            />
          </div>
        </div>
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
