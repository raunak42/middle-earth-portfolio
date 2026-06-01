"use client";

import { useRef, useState, type WheelEvent } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  year: string;
}

const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Immersive Gallery",
    description:
      "WebGL-powered 3D art gallery with physics-based interactions and dynamic lighting",
    tech: ["Three.js", "React", "GLSL"],
    year: "2024",
  },
  {
    id: "2",
    title: "Motion Design System",
    description:
      "Comprehensive animation library with 60fps spring physics and gesture controls",
    tech: ["Framer Motion", "TypeScript", "Storybook"],
    year: "2024",
  },
  {
    id: "3",
    title: "Data Visualization Platform",
    description:
      "Real-time analytics dashboard with custom WebGL charts and interactive filters",
    tech: ["D3.js", "WebGL", "Node.js"],
    year: "2023",
  },
  {
    id: "4",
    title: "Generative Art Tool",
    description:
      "Browser-based creative coding environment with shader editor and export pipeline",
    tech: ["Canvas API", "WebGPU", "React"],
    year: "2023",
  },
  {
    id: "5",
    title: "E-commerce Experience",
    description:
      "Product configurator with AR preview and smooth micro-interactions",
    tech: ["Next.js", "Three.js", "Tailwind"],
    year: "2023",
  },
];

function wrapPosition(position: number) {
  return ((position % PROJECTS.length) + PROJECTS.length) % PROJECTS.length;
}

function getWheelOffset(index: number, position: number) {
  let offset = index - position;
  const half = PROJECTS.length / 2;

  if (offset > half) offset -= PROJECTS.length;
  if (offset < -half) offset += PROJECTS.length;

  return offset;
}

export default function ProjectsView() {
  const [wheelPosition, setWheelPosition] = useState(1);
  const wheelLockUntil = useRef(0);
  const activeIndex = Math.round(wrapPosition(wheelPosition)) % PROJECTS.length;

  const moveBy = (amount: number) => {
    setWheelPosition((prev) => wrapPosition(prev + amount));
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const now = performance.now();
    if (now < wheelLockUntil.current) return;

    const delta =
      Math.abs(event.deltaY) >= Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;

    if (Math.abs(delta) < 18) return;

    wheelLockUntil.current = now + 520;
    moveBy(delta > 0 ? 1 : -1);
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="pointer-events-auto absolute bottom-[19.1vh] right-[8vw] top-[25vh] w-[min(32vw,590px)]"
        onWheel={handleWheel}
      >
        <div className="relative h-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.2)_7%,black_19%,black_81%,rgba(0,0,0,0.2)_93%,transparent_100%)] [perspective:1300px]">
          <div className="absolute inset-0 [transform-style:preserve-3d]">
            {PROJECTS.map((project, index) => {
              const offset = getWheelOffset(index, wheelPosition);
              const absOffset = Math.abs(offset);
              const wheelAngle = offset * 42;
              const wheelAngleRad = (wheelAngle * Math.PI) / 180;
              const y = Math.sin(wheelAngleRad) * 255;
              const z = (Math.cos(wheelAngleRad) - 1) * 260;
              const rotateX = -wheelAngle * 0.72;
              const opacity = Math.max(0, 1 - absOffset * 0.28);
              const scale = Math.max(0.72, 1 - absOffset * 0.075);
              const isActive = absOffset < 0.45;

              return (
                <div
                  key={project.id}
                  className="absolute left-0 right-0 top-1/2 cursor-pointer transition-[opacity,transform,filter] duration-300 ease-out"
                  style={{
                    filter: `blur(${Math.max(0, absOffset - 1.25) * 0.45}px)`,
                    opacity,
                    pointerEvents: opacity > 0.22 ? "auto" : "none",
                    transform: `translateY(calc(-50% + ${y}px)) translateZ(${z}px) rotateX(${rotateX}deg) scale(${scale})`,
                    transformOrigin: "center center",
                    zIndex: 100 - Math.round(absOffset * 10),
                  }}
                  onClick={() => setWheelPosition(index)}
                >
                  <div
                    className={`rounded-2xl border-2 border-dashed p-5 backdrop-blur-sm transition-all duration-300 ${
                      isActive
                        ? "border-white/50 bg-white/13 shadow-[0_14px_42px_rgba(0,0,0,0.18)]"
                        : "border-white/18 bg-white/6"
                    }`}
                  >
                    <div className="mb-2 flex items-baseline justify-between">
                      <h3 className="text-[clamp(18px,1.35vw,25px)] font-bold leading-tight">
                        {project.title}
                      </h3>
                      <span className="text-[clamp(12px,0.9vw,16px)] opacity-70">
                        {project.year}
                      </span>
                    </div>
                    <p className="mb-3 text-[clamp(13px,0.95vw,16px)] leading-relaxed opacity-90">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full bg-white/15 px-3 py-1 text-[clamp(11px,0.8vw,14px)] font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] flex items-center justify-center gap-4">
          <button
            onClick={() => moveBy(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-white/30 bg-white/10 backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
            aria-label="Previous project"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="translate-x-[-1px]"
            >
              <path
                d="M7.5 2L3.5 6L7.5 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex gap-2">
            {PROJECTS.map((_, index) => (
              <button
                key={index}
                onClick={() => setWheelPosition(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to project ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => moveBy(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-white/30 bg-white/10 backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
            aria-label="Next project"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="translate-x-[1px]"
            >
              <path
                d="M4.5 2L8.5 6L4.5 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
