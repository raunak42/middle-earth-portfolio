"use client";

import { useEffect, useRef, useState } from "react";
import useLoadingProgress from "@/components/useLoadingProgress";

const HIDE_DELAY_MS = 450;

// Tune these to change the "feel" of the fake crawl.
// 0 -> 50 happens fast, 50 -> 90 happens slower, then we wait on real progress.
const FAST_PHASE_DURATION_MS = 350; // 0 -> 50
const SLOW_PHASE_DURATION_MS = 1400; // 50 -> 90

function computeFakeProgress(elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;

  if (elapsedMs < FAST_PHASE_DURATION_MS) {
    return (elapsedMs / FAST_PHASE_DURATION_MS) * 50;
  }

  const slowElapsed = elapsedMs - FAST_PHASE_DURATION_MS;
  if (slowElapsed < SLOW_PHASE_DURATION_MS) {
    return 50 + (slowElapsed / SLOW_PHASE_DURATION_MS) * 40;
  }

  return 90;
}

export default function AppLoader({ hidden = false }: { hidden?: boolean }) {
  const { progress: realProgress } = useLoadingProgress();

  const [displayProgress, setDisplayProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  const realProgressRef = useRef(0);
  const displayRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always keep the latest real progress available to the animation loop,
  // without needing to restart it.
  useEffect(() => {
    const safeValue = Number.isFinite(realProgress) ? realProgress : 0;
    realProgressRef.current = Math.min(100, Math.max(0, safeValue));
  }, [realProgress]);

  // Single source of truth: one rAF loop computes displayProgress every frame.
  useEffect(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }

    const tick = (now: number) => {
      const elapsed = now - (startTimeRef.current ?? now);
      const fake = computeFakeProgress(elapsed);
      const real = realProgressRef.current;

      // Below 90: follow the fake crawl.
      // At/above 90: hand off to real progress (never below 90 though).
      const target = fake < 90 ? fake : Math.max(90, real);

      if (target > displayRef.current) {
        displayRef.current = Math.min(100, target);
        setDisplayProgress(displayRef.current);
      }

      const isDone = real >= 100 && displayRef.current >= 100;

      if (isDone) {
        if (!hideTimerRef.current) {
          hideTimerRef.current = setTimeout(() => {
            setVisible(false);
            hideTimerRef.current = null;
          }, HIDE_DELAY_MS);
        }
        return; // stop looping once finished
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (hidden || !visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black transition-opacity duration-300">
      <div className="pointer-events-none absolute inset-[-28px] scale-105 bg-[#d9c49f] bg-[url('/bgggg.webp')] bg-cover bg-center opacity-95 blur-[4px] saturate-[0.8]" />

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="relative px-14 py-8 text-center before:absolute before:inset-[-64px] before:-z-10 before:rounded-full before:bg-[radial-gradient(ellipse_at_center,rgba(248,223,180,0.82)_0%,rgba(248,223,180,0.56)_32%,rgba(248,223,180,0.26)_62%,transparent_100%)] before:blur-[30px] before:content-[''] after:absolute after:inset-[-36px] after:-z-10 after:rounded-full after:bg-[radial-gradient(ellipse_at_center,rgba(255,241,210,0.38)_0%,rgba(255,241,210,0.14)_55%,transparent_100%)] after:blur-[14px] after:content-['']">
          <div className="h-[6px] w-[180px] overflow-hidden rounded-full bg-white/40">
            <div
              className="h-full rounded-full bg-[#163522] transition-none"
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