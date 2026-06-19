"use client";

import { useEffect, useRef, useState } from "react";
import useLoadingProgress from "@/components/useLoadingProgress";

const HIDE_DELAY_MS = 450;
const FAST_PHASE_DURATION_MS = 350; // 0 -> 50, runs on the compositor, immune to JS jank
const SLOW_PHASE_DURATION_MS = 1400; // 50 -> 90, same
const FINISH_DURATION_MS = 300; // 90 -> 100, only once real load is done
const RAMP_DURATION_MS = FAST_PHASE_DURATION_MS + SLOW_PHASE_DURATION_MS;
const FAST_OFFSET = FAST_PHASE_DURATION_MS / RAMP_DURATION_MS;

// Reads the bar's *actual* current rendered scaleX, straight off the DOM.
// This is how the displayed number stays guaranteed in sync with the bar —
// it's not tracked separately, it's read from the same thing you're looking at.
function readScaleX(el: HTMLElement): number {
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === "none") return 0;
  const match = transform.match(/matrix\(([^)]+)\)/);
  if (!match) return 0;
  const value = parseFloat(match[1].split(",")[0].trim());
  return Number.isFinite(value) ? value : 0;
}

export default function AppLoader({ hidden = false }: { hidden?: boolean }) {
  const { progress: realProgress } = useLoadingProgress();

  const [displayProgress, setDisplayProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  const barRef = useRef<HTMLDivElement | null>(null);
  const realProgressRef = useRef(0);
  const rampFinishedRef = useRef(false);
  const finishStartedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function maybeStartFinish() {
    if (
      rampFinishedRef.current &&
      realProgressRef.current >= 100 &&
      !finishStartedRef.current &&
      barRef.current
    ) {
      finishStartedRef.current = true;
      const finishAnim = barRef.current.animate(
        [{ transform: "scaleX(0.9)" }, { transform: "scaleX(1)" }],
        { duration: FINISH_DURATION_MS, easing: "ease-out", fill: "forwards" },
      );
      finishAnim.finished
        .then(() => {
          hideTimerRef.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
        })
        .catch(() => {});
    }
  }

  useEffect(() => {
    const safeValue = Number.isFinite(realProgress) ? realProgress : 0;
    realProgressRef.current = Math.min(100, Math.max(0, safeValue));
    maybeStartFinish();
  }, [realProgress]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // 0 -> 50 -> 90, entirely on the browser's animation engine.
    // Nothing on the JS main thread — including the real loader's work —
    // can pause or skip this.
    const rampAnim = bar.animate(
      [
        { transform: "scaleX(0)", offset: 0 },
        { transform: "scaleX(0.5)", offset: FAST_OFFSET },
        { transform: "scaleX(0.9)", offset: 1 },
      ],
      { duration: RAMP_DURATION_MS, fill: "forwards", easing: "linear" },
    );

    rampAnim.finished
      .then(() => {
        rampFinishedRef.current = true;
        maybeStartFinish();
      })
      .catch(() => {});

    // Lightweight loop purely to drive the displayed number — it reads the
    // bar's real current value, so it can never disagree with what's on screen.
    const readLoop = () => {
      const scaleX = readScaleX(bar);
      setDisplayProgress((current) => {
        const next = Math.min(100, Math.max(0, scaleX * 100));
        return next > current ? next : current;
      });
      rafRef.current = requestAnimationFrame(readLoop);
    };
    rafRef.current = requestAnimationFrame(readLoop);

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
              ref={barRef}
              className="h-full w-full origin-left rounded-full bg-[#163522]"
              style={{ transform: "scaleX(0)" }}
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