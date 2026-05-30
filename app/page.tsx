"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AnimatedPropsSquash from "@/components/AnimatedPropsSquash";
import CameraRig from "@/components/CameraRig";
import Cave from "@/components/Cave";
import { useProgress } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ShaderChunk } from "three";

ShaderChunk.tonemapping_pars_fragment =
  ShaderChunk.tonemapping_pars_fragment.replace(
    "vec3 CustomToneMapping( vec3 color ) { return color; }",
    `
  vec3 CustomToneMapping( vec3 color ) {
    // ============================================
    // BRIGHTNESS CONTROL
    // ============================================
    // Increase this value to make the image brighter
    // Default: 1.0 (no change)
    // Try: 1.1 - 1.3 for brighter
    // Try: 0.8 - 0.9 for darker
    float brightness = 4.5;
    color *= toneMappingExposure * brightness;

    // ============================================
    // TONE MAPPING (affects highlight rolloff)
    // ============================================
    // Lower values = brighter highlights, more vibrant
    // Higher values = softer, more compressed highlights
    // Default: 1.0
    // Try: 0.7 - 0.9 for punchier highlights
    // Try: 1.1 - 1.3 for softer look
    float toneMapStrength = 1.0;
    color = color / (color + vec3(toneMapStrength));

    // ============================================
    // SATURATION CONTROL
    // ============================================
    // Increase this value to boost color saturation
    // Default: 1.0 (no change)
    // Try: 1.1 - 1.3 for more saturated colors
    // Try: 0.7 - 0.9 for desaturated/muted colors
    float saturation = 0.75;
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luma), color, saturation);

    // ============================================
    // CONTRAST CONTROL
    // ============================================
    // Lower values = more contrast (darker darks, brighter brights)
    // Higher values = less contrast (flatter image)
    // Default: 1.0 (no change)
    // Try: 0.9 - 0.95 for more contrast
    // Try: 1.05 - 1.1 for less contrast
    float contrast = 2.0;
    color = pow(color, vec3(contrast));

    // ============================================
    // SHADOW LIFT (optional)
    // ============================================
    // Uncomment the line below to lift shadows (makes darks brighter/grayer)
    // Increase the second value (0.04) to lift more
    // Try: 0.02 - 0.06 for subtle to strong lift
    // color = color * 0.93 + 0.04;

    // ============================================
    // VIBRANCE (optional - alternative to saturation)
    // ============================================
    // Uncomment to boost only less-saturated colors (more natural than saturation)
    // float maxColor = max(max(color.r, color.g), color.b);
    // float minColor = min(min(color.r, color.g), color.b);
    // float colorSat = maxColor - minColor;
    // float vibranceAmount = 0.3; // Try: 0.2 - 0.5
    // color = mix(vec3(luma), color, 1.0 + vibranceAmount * (1.0 - colorSat));

    return color;
  }
  `,
  );

function LoadingOverlay() {
  const { active, progress } = useProgress();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (active || progress < 100) return;

    const id = window.setTimeout(() => setDone(true), 250);
    return () => window.clearTimeout(id);
  }, [active, progress]);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#c98270] text-white">
      <div className="w-[min(320px,70vw)] text-center">
        <div className="mb-4 text-xl font-extrabold tracking-wide">Loading</div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-200 ease-out"
            style={{ width: `${Math.max(4, Math.round(progress))}%` }}
          />
        </div>
        <div className="mt-3 text-sm font-bold tabular-nums">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}

function CanvasTransitionResizeSync() {
  const { gl, setSize } = useThree();
  const lastSize = useRef({ height: 0, width: 0 });

  useFrame(() => {
    const parent = gl.domElement.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    if (width === lastSize.current.width && height === lastSize.current.height) {
      return;
    }

    lastSize.current = { height, width };
    setSize(width, height);
  });

  return null;
}

const CLICKABLE_SIGN_NAMES = [
  "CLICK_About",
  "CLICK_Projects",
  "CLICK_Experience",
  "CLICK_Contact",
];

function SceneClickHandler({
  disabled,
  onAboutClick,
}: {
  disabled: boolean;
  onAboutClick: () => void;
}) {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);

  useEffect(() => {
    if (disabled) return;

    const findClickableSign = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(scene.children, true);

      for (const hit of hits) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          if (CLICKABLE_SIGN_NAMES.includes(obj.name)) return obj.name;
          obj = obj.parent;
        }
      }

      return null;
    };

    const onPointerMove = (event: PointerEvent) => {
      gl.domElement.classList.toggle("cursor-pointer", Boolean(findClickableSign(event)));
    };

    const onPointerLeave = () => {
      gl.domElement.classList.remove("cursor-pointer");
    };

    const onPointerDown = (event: PointerEvent) => {
      if (findClickableSign(event) === "CLICK_About") {
        onAboutClick();
      }
    };

    gl.domElement.addEventListener("pointermove", onPointerMove);
    gl.domElement.addEventListener("pointerleave", onPointerLeave);
    gl.domElement.addEventListener("pointerdown", onPointerDown);
    return () => {
      gl.domElement.removeEventListener("pointermove", onPointerMove);
      gl.domElement.removeEventListener("pointerleave", onPointerLeave);
      gl.domElement.removeEventListener("pointerdown", onPointerDown);
      gl.domElement.classList.remove("cursor-pointer");
    };
  }, [camera, disabled, gl, onAboutClick, pointer, raycaster, scene]);

  return null;
}

export default function HomePage() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [zoom, setZoom] = useState(0);

  const setClampedZoom = (nextZoom: number) => {
    setZoom(Math.min(1, Math.max(0, nextZoom)));
  };

  const scenePanelClass = [
    "absolute z-[3] overflow-hidden transform-gpu transition-[inset,border-radius,box-shadow] duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)]",
    "after:content-[''] after:absolute after:inset-0 after:z-[2] after:pointer-events-none after:border-dashed after:border-white/95 after:opacity-100 after:transition-[border-width,border-radius] after:duration-[900ms] after:ease-[cubic-bezier(0.76,0,0.24,1)]",
    aboutOpen
      ? "inset-[20vh_39vw_14vh_2vw] rounded-[28px] shadow-[0_24px_80px_rgba(55,23,17,0.22)] after:border-[4px] after:rounded-[28px]"
      : "inset-0 rounded-none shadow-none after:border-[6px] after:rounded-none",
  ].join(" ");

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#c98270]">
      <div
        className={`fixed inset-0 z-[2] text-white transition-opacity duration-[450ms] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.07),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(80,25,15,0.09),transparent_32%),#c98270] ${
          aboutOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!aboutOpen}
      >
        <button
          className="absolute right-[7vw] top-[10vh] cursor-pointer border-0 bg-transparent text-[22px] font-extrabold text-white [font:inherit]"
          onClick={() => setAboutOpen(false)}
        >
          Close
        </button>
        <div className="absolute right-[8vw] top-[36vh] w-[min(31vw,560px)] leading-[1.45] [text-wrap:pretty]">
          <h1 className="mb-6 mt-0 text-[clamp(34px,3vw,58px)] leading-none">About</h1>
          <p className="mb-[18px] mt-0 text-[clamp(16px,1.25vw,24px)] font-bold">
            I build playful interactive web experiences with code, motion, and
            a lot of tiny hand-crafted details.
          </p>
          <p className="mb-[18px] mt-0 text-[clamp(16px,1.25vw,24px)] font-bold">
            This portfolio is a miniature Middle-earth inspired room. Scroll to
            travel through the sections, follow Frodo&apos;s journey, and click the
            signs to open more details.
          </p>
        </div>
      </div>

      <LoadingOverlay />

      <div className={scenePanelClass}>
        <Canvas
          className="!h-full !w-full !block"
          shadows
          camera={{ position: [0, 0.15, 0.5], fov: 60, near: 0.001, far: 100 }}
          gl={{
            antialias: true,
            toneMapping: THREE.CustomToneMapping,
            toneMappingExposure: 1.2,
          }}
        >
          <Cave />
          {/* <OrbitControls target={[0, 0.1, 0]} /> */}
          <CameraRig disabled={aboutOpen} zoom={zoom} />
          <AnimatedPropsSquash />
          <CanvasTransitionResizeSync />
          <SceneClickHandler
            disabled={aboutOpen}
            onAboutClick={() => setAboutOpen(true)}
          />
          {/* <CameraDebug /> */}
        </Canvas>
      </div>

      <div
        className={`pointer-events-auto fixed bottom-10 left-1/2 z-20 grid -translate-x-1/2 grid-cols-[18px_205px_18px] items-center gap-2 text-white transition-opacity duration-300 ${
          aboutOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <button
          aria-label="Zoom out"
          className="relative h-[18px] w-[18px] cursor-pointer border-0 bg-transparent p-0 drop-shadow"
          onClick={() => setClampedZoom(zoom - 0.1)}
        >
          <span className="absolute left-1/2 top-1/2 h-[1.5px] w-[13px] -translate-x-1/2 -translate-y-1/2 bg-white" />
        </button>
        <input
          aria-label="Zoom"
          className="zoom-slider block w-[205px] cursor-pointer self-center"
          max={1}
          min={0}
          step={0.01}
          type="range"
          value={zoom}
          onChange={(event) => setClampedZoom(Number(event.target.value))}
        />
        <button
          aria-label="Zoom in"
          className="relative h-[18px] w-[18px] cursor-pointer border-0 bg-transparent p-0 drop-shadow"
          onClick={() => setClampedZoom(zoom + 0.1)}
        >
          <span className="absolute left-1/2 top-1/2 h-[1.5px] w-[15px] -translate-x-1/2 -translate-y-1/2 bg-white" />
          <span className="absolute left-1/2 top-1/2 h-[15px] w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-white" />
        </button>
      </div>
    </div>
  );
}
