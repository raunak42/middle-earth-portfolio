"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Loader } from "lucide-react";
import AppLoader from "@/components/AppLoader";
import InfoView, { type InfoViewName } from "@/components/InfoView";
import SceneErrorBoundary from "@/components/SceneErrorBoundary";
import ScenePanel from "@/components/ScenePanel";
import ZoomControl from "@/components/ZoomControl";
import useLoadingProgress from "@/components/useLoadingProgress";
const SCENE_PANEL_TRANSITION_MS = 700;
const MOBILE_SCENE_PANEL_ASPECT = 1.6;
const MOBILE_SCENE_PANEL_DPR = 2.4;
const MOBILE_TRANSITION_LOADING_MS = 450;
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

type MobileScenePhase = "scene" | "opening" | "open" | "closing";

function subscribeToMobileViewport(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getMobileViewportSnapshot() {
  return typeof window !== "undefined"
    ? window.matchMedia(MOBILE_MEDIA_QUERY).matches
    : false;
}

function getServerMobileViewportSnapshot() {
  return false;
}

function useIsMobileViewport() {
  return useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewportSnapshot,
    getServerMobileViewportSnapshot,
  );
}

function getSceneStartupError(): Error | null {
  if (typeof document === "undefined") return null;

  try {
    const canvas = document.createElement("canvas");
    const contextAttributes = {
      alpha: true,
      antialias: true,
      powerPreference: "default" as WebGLPowerPreference,
    };
    const context = (
      canvas.getContext("webgl2", contextAttributes) ??
      canvas.getContext("webgl", contextAttributes)
    ) as WebGLRenderingContext | WebGL2RenderingContext | null;

    if (!context) {
      return new Error(
        "WebGL is unavailable, so the 3D scene could not start.",
      );
    }

    context.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  } catch (error) {
    return error instanceof Error
      ? error
      : new Error("The browser refused to create a WebGL context.");
  }
}

function getSceneErrorHelp(error: Error) {
  const message = error.message.toLowerCase();

  if (message.includes("webgl") || message.includes("context")) {
    return "Your browser/GPU refused the WebGL context this 3D scene needs. This can happen intermittently when the GPU process is busy, disabled, or has just recovered from a crash.";
  }

  if (message.includes("failed to fetch") || message.includes("load")) {
    return "A scene asset failed to download. Reloading usually fixes this if the network request was interrupted.";
  }

  return "The 3D scene hit a startup error before it could finish loading.";
}

function MobileTransitionLoader() {
  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden bg-black text-[#163522]">
      <div className="pointer-events-none absolute inset-[-28px] scale-105 bg-[#d9c49f] bg-[url('/bgggg.webp')] bg-cover bg-center opacity-95 blur-[4px] saturate-[0.8]" />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="relative px-10 py-8 text-center before:absolute before:inset-[-64px] before:-z-10 before:rounded-full before:bg-[radial-gradient(ellipse_at_center,rgba(248,223,180,0.82)_0%,rgba(248,223,180,0.56)_32%,rgba(248,223,180,0.26)_62%,transparent_100%)] before:blur-[30px] before:content-[''] after:absolute after:inset-[-36px] after:-z-10 after:rounded-full after:bg-[radial-gradient(ellipse_at_center,rgba(255,241,210,0.38)_0%,rgba(255,241,210,0.14)_55%,transparent_100%)] after:blur-[14px] after:content-['']">
          <Loader
            className="mx-auto h-8 w-8 animate-spin text-[#163522]"
            aria-label="Loading"
            role="status"
            strokeWidth={2}
          />
          <div className="mt-3 text-[15px] font-black">Loading...</div>
        </div>
      </div>
    </div>
  );
}

function SceneErrorFallback({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black text-[#163522]">
      <div className="pointer-events-none absolute inset-[-28px] scale-105 bg-[#d9c49f] bg-[url('/bgggg.webp')] bg-cover bg-center opacity-95 blur-[4px] saturate-[0.8]" />
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
        <div className="max-w-[440px] rounded-[28px] border-2 border-dashed border-[#163522]/35 bg-[#fff8e8]/75 px-7 py-6 shadow-[0_20px_70px_rgba(22,53,34,0.18)] backdrop-blur-sm">
          <div className="text-[clamp(22px,4vw,34px)] font-black leading-tight">
            The 3D scene couldn&apos;t start
          </div>
          <p className="mt-3 text-[15px] font-bold leading-relaxed md:text-[17px]">
            {getSceneErrorHelp(error)}
          </p>
          <p className="mt-3 break-words rounded-[14px] bg-white/45 px-3 py-2 text-[12px] font-bold text-[#163522]/75 md:text-[13px]">
            {error.message}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="cursor-pointer rounded-full border-2 border-dashed border-[#163522]/55 bg-[#fff8e8]/80 px-4 py-2 text-[15px] font-black text-[#163522] [font:inherit] hover:bg-white/80"
              onClick={onRetry}
            >
              Try scene again
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-full border-2 border-dashed border-[#163522]/55 bg-[#163522] px-4 py-2 text-[15px] font-black text-[#fff8e8] [font:inherit] hover:bg-[#214b30]"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    const targetArea = viewportWidth * 0.3656 * viewportHeight * 0.4024;
    const scale = Math.sqrt(targetArea / (viewportWidth * viewportHeight));
    const width = viewportWidth * scale;
    const height = viewportHeight * scale;

    return {
      frameWidth: 4,
      height,
      radius: 16,
      viewportHeight,
      viewportWidth,
      width,
      x: viewportWidth * 0.116,
      y: viewportHeight * 0.27,
    };
  }

  const maxMobileWidth = Math.max(viewportWidth - 56, 1);
  const width = Math.min(
    Math.max(viewportWidth * 0.72, Math.min(240, maxMobileWidth)),
    maxMobileWidth,
    360,
  );
  const height = width / MOBILE_SCENE_PANEL_ASPECT;

  return {
    frameWidth: 4,
    height,
    radius: 16,
    viewportHeight,
    viewportWidth,
    width,
    x: (viewportWidth - width) / 2,
    y: 0,
  };
}

function areScenePanelMetricsEqual(
  a: ScenePanelMetrics | null,
  b: ScenePanelMetrics | null,
) {
  if (a === b) return true;
  if (!a || !b) return false;

  return (
    a.frameWidth === b.frameWidth &&
    a.height === b.height &&
    a.radius === b.radius &&
    a.viewportHeight === b.viewportHeight &&
    a.viewportWidth === b.viewportWidth &&
    a.width === b.width &&
    a.x === b.x &&
    a.y === b.y
  );
}

function useScenePanelMetrics() {
  const [metrics, setMetrics] = useState<ScenePanelMetrics | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      const nextMetrics = getScenePanelMetrics();
      setMetrics((currentMetrics) =>
        areScenePanelMetricsEqual(currentMetrics, nextMetrics)
          ? currentMetrics
          : nextMetrics,
      );
    };

    updateMetrics();
    window.addEventListener("resize", updateMetrics);

    return () => window.removeEventListener("resize", updateMetrics);
  }, []);

  return metrics;
}

export default function HomePage() {
  const [infoView, setInfoView] = useState<InfoViewName | null>(null);
  const [visibleInfoView, setVisibleInfoView] = useState<InfoViewName | null>(
    null,
  );
  const [zoom, setZoom] = useState(0);
  const [sceneError, setSceneError] = useState<Error | null>(null);
  const [sceneRetryKey, setSceneRetryKey] = useState(0);
  const [webGLChecked, setWebGLChecked] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileOpeningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const scenePointerStartedOpenRef = useRef(false);
  const maxProgressRef = useRef(0);
  const { progress } = useLoadingProgress();
  const [sceneReady, setSceneReady] = useState(false);
  const [mobileScenePhase, setMobileScenePhase] =
    useState<MobileScenePhase>("scene");
  const sceneMetrics = useScenePanelMetrics();
  const isMobileViewport = useIsMobileViewport();

  const infoOpen = infoView !== null;
  const mobileTransitionLoading =
    isMobileViewport &&
    (mobileScenePhase === "opening" || mobileScenePhase === "closing");
  const sceneInMobileNotebook =
    visibleInfoView !== null &&
    isMobileViewport &&
    mobileScenePhase === "open";
  const mobileScenePanelVisible =
    (infoView !== null || visibleInfoView !== null) && isMobileViewport;
  const loading = !webGLChecked || (!sceneReady && !sceneError);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (mobileOpeningTimerRef.current) {
        clearTimeout(mobileOpeningTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkTimer = setTimeout(() => {
      const startupError = getSceneStartupError();
      setWebGLChecked((checked) => (checked ? checked : true));

      if (!startupError) return;

      console.error("3D scene startup check failed:", startupError);
      setSceneError(startupError);
    }, 0);

    return () => clearTimeout(checkTimer);
  }, [sceneRetryKey]);

  useEffect(() => {
    if (!webGLChecked || sceneError) return;

    maxProgressRef.current = Math.max(maxProgressRef.current, progress);

    if (maxProgressRef.current < 100) return;

    const readyTimer = setTimeout(() => {
      setSceneReady((ready) => (ready ? ready : true));
    }, 100);

    return () => clearTimeout(readyTimer);
  }, [progress, sceneError, sceneRetryKey, webGLChecked]);

  useEffect(() => {
    if (mobileScenePhase !== "opening") return;
    if (mobileOpeningTimerRef.current) return;

    mobileOpeningTimerRef.current = setTimeout(() => {
      mobileOpeningTimerRef.current = null;
      setMobileScenePhase("open");
    }, MOBILE_TRANSITION_LOADING_MS);

    return () => {
      if (mobileOpeningTimerRef.current) {
        clearTimeout(mobileOpeningTimerRef.current);
        mobileOpeningTimerRef.current = null;
      }
    };
  }, [mobileScenePhase]);

  const retryScene = useCallback(() => {
    maxProgressRef.current = 0;
    setSceneReady(false);
    setSceneError(null);
    setWebGLChecked(false);
    setSceneRetryKey((key) => key + 1);
  }, []);

  const handleSceneError = useCallback((error: Error) => {
    console.error("3D scene render failed:", error);
    setSceneError((currentError) => currentError ?? error);
  }, []);

  const openInfoView = useCallback(
    (view: InfoViewName) => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (mobileOpeningTimerRef.current) {
        clearTimeout(mobileOpeningTimerRef.current);
      }
      closeTimerRef.current = null;
      mobileOpeningTimerRef.current = null;

      if (isMobileViewport && mobileScenePhase === "scene") {
        setMobileScenePhase("opening");
        setVisibleInfoView(view);
        setInfoView(view);
        return;
      }

      setVisibleInfoView((currentView) =>
        currentView === view ? currentView : view,
      );
      setInfoView((currentView) => (currentView === view ? currentView : view));
    },
    [isMobileViewport, mobileScenePhase],
  );

  const closeInfoView = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (mobileOpeningTimerRef.current) {
      clearTimeout(mobileOpeningTimerRef.current);
    }
    closeTimerRef.current = null;
    mobileOpeningTimerRef.current = null;

    if (isMobileViewport && visibleInfoView !== null) {
      setMobileScenePhase("closing");
      setInfoView((currentView) => (currentView === null ? currentView : null));

      closeTimerRef.current = setTimeout(() => {
        setVisibleInfoView((currentView) =>
          currentView === null ? currentView : null,
        );
        setMobileScenePhase("scene");
        closeTimerRef.current = null;
      }, MOBILE_TRANSITION_LOADING_MS);
      return;
    }

    setInfoView((currentView) => (currentView === null ? currentView : null));
    closeTimerRef.current = setTimeout(() => {
      setVisibleInfoView((currentView) =>
        currentView === null ? currentView : null,
      );
      closeTimerRef.current = null;
    }, SCENE_PANEL_TRANSITION_MS);
  }, [isMobileViewport, visibleInfoView]);

  const renderSceneContent = (
    controlsDisabled = infoOpen,
    dprOverride?: number,
  ) => {
    if (sceneError) {
      return <SceneErrorFallback error={sceneError} onRetry={retryScene} />;
    }

    if (!webGLChecked) return null;

    return (
      <SceneErrorBoundary
        fallback={(error) => (
          <SceneErrorFallback error={error} onRetry={retryScene} />
        )}
        onError={handleSceneError}
        resetKey={sceneRetryKey}
      >
        <ScenePanel
          key={sceneRetryKey}
          controlsDisabled={controlsDisabled}
          dprOverride={dprOverride}
          zoom={zoom}
          onViewClick={openInfoView}
        />
      </SceneErrorBoundary>
    );
  };

  const sceneTransformStyle = useMemo(() => {
    if (isMobileViewport || !infoOpen || !sceneMetrics) {
      return {
        borderRadius: "0px",
        height: "100vh",
        left: "0px",
        top: "0px",
        transform: "translate3d(0, 0, 0)",
        width: "100vw",
      };
    }

    return {
      borderRadius: `${sceneMetrics.radius}px`,
      height: `${sceneMetrics.height}px`,
      left: `${sceneMetrics.x}px`,
      top: `${sceneMetrics.y}px`,
      transform: "translate3d(0, 0, 0)",
      width: `${sceneMetrics.width}px`,
    };
  }, [infoOpen, isMobileViewport, sceneMetrics]);

  const frameStyle = useMemo(() => {
    if (isMobileViewport || !infoOpen || !sceneMetrics) {
      return {
        borderColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 0,
        borderWidth: 6,
        inset: 0,
      };
    }

    const frameWidth = sceneMetrics.frameWidth;

    return {
      borderBottomWidth: frameWidth,
      borderColor: "#24211d",
      borderLeftWidth: frameWidth,
      borderRadius: `${sceneMetrics.radius + frameWidth}px`,
      borderRightWidth: frameWidth,
      borderTopWidth: frameWidth,
      bottom: -frameWidth,
      left: -frameWidth,
      right: -frameWidth,
      top: -frameWidth,
    };
  }, [infoOpen, isMobileViewport, sceneMetrics]);

  const sceneContentStyle = useMemo(() => {
    if (isMobileViewport || !infoOpen || !sceneMetrics) {
      return {
        height: "100vh",
        transform: "translate3d(0, 0, 0) scale(1)",
        width: "100vw",
      };
    }

    const scale = Math.max(
      sceneMetrics.width / sceneMetrics.viewportWidth,
      sceneMetrics.height / sceneMetrics.viewportHeight,
    );
    const x = (sceneMetrics.width - sceneMetrics.viewportWidth * scale) / 2;
    const y = (sceneMetrics.height - sceneMetrics.viewportHeight * scale) / 2;

    return {
      height: `${sceneMetrics.viewportHeight}px`,
      transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
      width: `${sceneMetrics.viewportWidth}px`,
    };
  }, [infoOpen, isMobileViewport, sceneMetrics]);

  const mobileScenePanelStyle = {
    aspectRatio: MOBILE_SCENE_PANEL_ASPECT,
    width: "calc(100% - 8px)",
  };
  const mobileScenePanelRevealed =
    mobileScenePhase === "open" || mobileScenePhase === "closing";
  const mobileScenePanelShouldRender =
    mobileScenePanelVisible && mobileScenePanelRevealed;
  const mainSceneShouldRender =
    !isMobileViewport || !mobileScenePanelShouldRender;
  const mobileScenePanelInteractive =
    infoOpen && mobileScenePanelRevealed && mobileScenePhase === "open";

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <InfoView
        view={visibleInfoView}
        mobileScenePanel={
          mobileScenePanelVisible ? (
            <div
              aria-label={mobileScenePanelInteractive ? "Expand scene" : undefined}
              className={`relative mx-auto overflow-visible transition-opacity duration-150 ${
                mobileScenePanelRevealed ? "opacity-100" : "opacity-0"
              } ${
                mobileScenePanelInteractive
                  ? "cursor-pointer"
                  : "pointer-events-none"
              }`}
              role={mobileScenePanelInteractive ? "button" : undefined}
              tabIndex={mobileScenePanelInteractive ? 0 : undefined}
              style={mobileScenePanelStyle}
              onClick={mobileScenePanelInteractive ? closeInfoView : undefined}
              onKeyDown={(event) => {
                if (!mobileScenePanelInteractive) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  closeInfoView();
                }
              }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-[16px] bg-black shadow-[0_12px_32px_rgba(36,33,29,0.18)]">
                {mobileScenePanelShouldRender
                  ? renderSceneContent(true, MOBILE_SCENE_PANEL_DPR)
                  : null}
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[-4px] z-[2] rounded-[20px] border-4 border-dashed border-[#24211d]"
              />
            </div>
          ) : null
        }
        onClose={closeInfoView}
        onViewChange={openInfoView}
      />

      <div
        aria-label={infoOpen ? "Expand scene" : undefined}
        className={`absolute left-0 top-0 ${
          sceneInMobileNotebook ? "z-[1]" : "z-[3]"
        } transform-gpu overflow-visible shadow-none transition-[left,top,width,height,border-radius,box-shadow,opacity] duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
          loading || sceneInMobileNotebook
            ? "pointer-events-none opacity-0"
            : "pointer-events-auto opacity-100"
        } ${infoOpen ? "cursor-pointer shadow-[0_24px_80px_rgba(55,23,17,0.22)]" : ""}`}
        role={infoOpen && !sceneInMobileNotebook ? "button" : undefined}
        tabIndex={infoOpen && !sceneInMobileNotebook ? 0 : undefined}
        style={{
          ...sceneTransformStyle,
          transformOrigin: "top left",
        }}
        onClick={() => {
          if (infoOpen && scenePointerStartedOpenRef.current) {
            closeInfoView();
          }
          scenePointerStartedOpenRef.current = false;
        }}
        onPointerDownCapture={() => {
          scenePointerStartedOpenRef.current = infoOpen;
        }}
        onKeyDown={(event) => {
          if (!infoOpen) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            closeInfoView();
          }
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <div
            className="absolute left-0 top-0 transform-gpu transition-transform duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform"
            style={{
              ...sceneContentStyle,
              transformOrigin: "top left",
            }}
          >
            {mainSceneShouldRender ? renderSceneContent(infoOpen) : null}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-[2] border-dashed transition-[top,right,bottom,left,border-width,border-radius,border-color] duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
          style={frameStyle}
        />
      </div>

      <ZoomControl
        hidden={infoOpen || loading || Boolean(sceneError)}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <AppLoader hidden={Boolean(sceneError)} />
      {mobileTransitionLoading ? <MobileTransitionLoader /> : null}
    </div>
  );
}
