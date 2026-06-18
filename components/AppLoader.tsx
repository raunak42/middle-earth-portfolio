"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";

const HIDE_DELAY_MS = 450;

export default function AppLoader() {
  const { progress } = useProgress();
  const maxProgressRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const nextProgress = Math.min(
      100,
      Math.max(maxProgressRef.current, progress),
    );

    if (nextProgress !== maxProgressRef.current) {
      maxProgressRef.current = nextProgress;
      setDisplayProgress(nextProgress);
    }

    if (nextProgress < 100) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setVisible((current) => (current ? current : true));
      return;
    }

    if (hideTimerRef.current) return;

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      hideTimerRef.current = null;
    }, HIDE_DELAY_MS);
  }, [progress]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black transition-opacity duration-300">
      <div className="pointer-events-none absolute inset-[-28px] scale-105 bg-[#d9c49f] bg-[url('/bgggg.webp')] bg-cover bg-center opacity-95 blur-[4px] saturate-[0.8]" />

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="relative px-14 py-8 text-center before:absolute before:inset-[-64px] before:-z-10 before:rounded-full before:bg-[radial-gradient(ellipse_at_center,rgba(248,223,180,0.82)_0%,rgba(248,223,180,0.56)_32%,rgba(248,223,180,0.26)_62%,transparent_100%)] before:blur-[30px] before:content-[''] after:absolute after:inset-[-36px] after:-z-10 after:rounded-full after:bg-[radial-gradient(ellipse_at_center,rgba(255,241,210,0.38)_0%,rgba(255,241,210,0.14)_55%,transparent_100%)] after:blur-[14px] after:content-['']">
          <div className="h-[6px] w-[180px] overflow-hidden rounded-full bg-white/40">
            <div
              className="h-full rounded-full bg-[#163522] transition-[width] duration-200 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <div className="mt-[6px] text-[0.9em] font-black tabular-nums text-[#163522]">
            {displayProgress.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}
