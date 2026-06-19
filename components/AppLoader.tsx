"use client";

import { useEffect, useRef, useState } from "react";
import useLoadingProgress from "@/components/useLoadingProgress";

const HIDE_DELAY_MS = 450;
const FAKE_FAST_PROGRESS_DELAY_MS = 20;
const FAKE_SLOW_PROGRESS_DELAY_MS = 70;

export default function AppLoader({ hidden = false }: { hidden?: boolean }) {
  const { progress } = useLoadingProgress();
  const maxProgressRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fakeProgressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [visible, setVisible] = useState(true);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (fakeProgressTimerRef.current) {
        clearTimeout(fakeProgressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tickFakeProgress = () => {
      setFakeProgress((currentProgress) => {
        if (currentProgress >= 90) return currentProgress;

        const nextProgress = Math.min(90, currentProgress + 1);
        const nextDelay =
          nextProgress < 50
            ? FAKE_FAST_PROGRESS_DELAY_MS
            : FAKE_SLOW_PROGRESS_DELAY_MS;

        if (!cancelled && nextProgress < 90) {
          fakeProgressTimerRef.current = setTimeout(
            tickFakeProgress,
            nextDelay,
          );
        }

        return nextProgress;
      });
    };

    fakeProgressTimerRef.current = setTimeout(
      tickFakeProgress,
      FAKE_FAST_PROGRESS_DELAY_MS,
    );

    return () => {
      cancelled = true;
      if (fakeProgressTimerRef.current) {
        clearTimeout(fakeProgressTimerRef.current);
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
    }
  }, [progress]);

  useEffect(() => {
    const actualProgress = maxProgressRef.current;
    const nextDisplayProgress =
      fakeProgress < 90
        ? fakeProgress
        : actualProgress >= 90
          ? actualProgress
          : 90;

    setDisplayProgress((currentProgress) =>
      nextDisplayProgress > currentProgress
        ? Math.min(100, nextDisplayProgress)
        : currentProgress,
    );

    if (actualProgress < 100 || fakeProgress < 90) return;
    if (hideTimerRef.current) return;

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      hideTimerRef.current = null;
    }, HIDE_DELAY_MS);
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
