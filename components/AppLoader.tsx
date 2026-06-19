"use client";

import { useEffect, useRef, useState } from "react";
import useLoadingProgress from "@/components/useLoadingProgress";

const HIDE_DELAY_MS = 450;
const FAKE_PROGRESS_INTERVAL_MS = 50;
const FAKE_FAST_PROGRESS_STEP = 4;
const FAKE_SLOW_PROGRESS_STEP = 1.2;

export default function AppLoader({ hidden = false }: { hidden?: boolean }) {
  const { progress } = useLoadingProgress();
  const maxProgressRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fakeProgressTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const [visible, setVisible] = useState(true);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (fakeProgressTimerRef.current) {
        clearInterval(fakeProgressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fakeProgressTimerRef.current = setInterval(() => {
      setFakeProgress((currentProgress) => {
        if (currentProgress >= 90) return currentProgress;

        const step =
          currentProgress < 50
            ? FAKE_FAST_PROGRESS_STEP
            : FAKE_SLOW_PROGRESS_STEP;

        return Math.min(90, currentProgress + step);
      });
    }, FAKE_PROGRESS_INTERVAL_MS);

    return () => {
      if (fakeProgressTimerRef.current) {
        clearInterval(fakeProgressTimerRef.current);
        fakeProgressTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const nextProgress = Math.min(
      100,
      Math.max(maxProgressRef.current, progress),
    );

    if (nextProgress !== maxProgressRef.current) {
      maxProgressRef.current = nextProgress;
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

  useEffect(() => {
    const actualProgress = maxProgressRef.current;
    const nextDisplayProgress =
      actualProgress >= 100
        ? 100
        : actualProgress >= 90
          ? actualProgress
          : Math.max(actualProgress, fakeProgress);

    setDisplayProgress((currentProgress) =>
      nextDisplayProgress > currentProgress
        ? Math.min(100, nextDisplayProgress)
        : currentProgress,
    );
  }, [fakeProgress, progress]);

  if (hidden || !visible) return null;

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
