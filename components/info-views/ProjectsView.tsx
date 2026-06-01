"use client";

import { useState } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  previewImage: string;
}

const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Immersive Gallery",
    description:
      "WebGL-powered 3D art gallery with physics-based interactions and dynamic lighting.",
    previewImage: "/green.webp",
  },
  {
    id: "2",
    title: "Motion Design System",
    description:
      "A reusable animation kit with spring motion, gestures, and small delightful details.",
    previewImage: "/orange.webp",
  },
  {
    id: "3",
    title: "Data Platform",
    description:
      "Realtime dashboards with custom visualizations and interactive filters.",
    previewImage: "/blue.webp",
  },
  {
    id: "4",
    title: "Generative Tool",
    description:
      "A browser creative-coding playground with shader controls and exports.",
    previewImage: "/white.webp",
  },
];

function GitHubIcon() {
  return (
    <svg
      className="h-[1.25em] w-[1.25em]"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.6 2 12.26c0 4.53 2.86 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.02-1.9-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.07 1.53 1.07.9 1.56 2.35 1.1 2.92.84.09-.67.35-1.1.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.96c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.36-.02 2.46-.02 2.8 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.26C22 6.6 17.52 2 12 2Z" />
    </svg>
  );
}

function GoToIcon() {
  return (
    <svg
      className="h-[1.25em] w-[1.25em]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.6"
      aria-hidden="true"
    >
      <path d="M8 6h10v10" />
      <path d="M18 6 6 18" />
      <path d="M5 9v10h10" />
    </svg>
  );
}

const PROJECT_PAGES = Array.from(
  { length: Math.ceil(PROJECTS.length / 2) },
  (_, index) => PROJECTS.slice(index * 2, index * 2 + 2),
);

export default function ProjectsView() {
  const [activePage, setActivePage] = useState(0);

  const moveBy = (amount: number) => {
    setActivePage(
      (currentPage) =>
        (currentPage + amount + PROJECT_PAGES.length) % PROJECT_PAGES.length,
    );
  };

  return (
    <div className="flex h-full min-h-[330px] flex-col overflow-hidden pr-1 md:min-h-0">
      <div className="min-h-0 flex-1 overflow-hidden rounded-[18px]">
        <div
          className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
          style={{ transform: `translateX(-${activePage * 100}%)` }}
        >
          {PROJECT_PAGES.map((pageProjects, pageIndex) => (
            <div
              key={pageIndex}
              className="flex min-w-full flex-col justify-center gap-3 md:gap-4"
            >
              {pageProjects.map((project, projectIndex) => (
                <article
                  key={project.id}
                  className={`flex min-h-[132px] items-center gap-3 rounded-[16px] border-2 border-dashed border-[#2f2a23]/70 bg-[#fff8e8]/42 p-3 shadow-[3px_4px_0_rgba(39,32,24,0.08)] backdrop-blur-[1px] md:min-h-[150px] md:gap-5 md:rounded-[18px] md:border-[3px] md:p-4 ${
                    projectIndex % 2 === 0
                      ? "rotate-[-0.12deg]"
                      : "rotate-[0.12deg]"
                  }`}
                >
                  <div
                    className="aspect-[16/9] w-[36%] shrink-0 rounded-[12px] border-2 border-dashed border-[#2f2a23]/45 bg-cover bg-center md:w-[42%]"
                    style={{ backgroundImage: `url(${project.previewImage})` }}
                  />

                  <div className="flex min-w-0 flex-1 flex-col self-stretch py-1">
                    <div className="flex items-start justify-between gap-3 md:gap-4">
                      <h3 className="m-0 text-[clamp(17px,5vw,23px)] font-black leading-[1.05] text-[#221f1a] md:text-[clamp(20px,1.55vw,30px)]">
                        {project.title}
                      </h3>

                      <div className="flex shrink-0 items-center gap-2 text-[clamp(17px,4.4vw,22px)] text-[#221f1a] md:gap-3 md:text-[clamp(18px,1.25vw,25px)]">
                        <button
                          className="cursor-pointer border-0 bg-transparent p-0 text-current transition-transform hover:scale-110"
                          aria-label={`${project.title} GitHub`}
                        >
                          <GitHubIcon />
                        </button>
                        <button
                          className="cursor-pointer border-0 bg-transparent p-0 text-current transition-transform hover:scale-110"
                          aria-label={`Open ${project.title}`}
                        >
                          <GoToIcon />
                        </button>
                      </div>
                    </div>

                    <p className="mb-0 mt-2 text-[clamp(12px,3.6vw,15px)] font-bold leading-[1.3] text-[#3b362e] md:mt-3 md:text-[clamp(13px,0.9vw,16px)] md:leading-[1.35]">
                      {project.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex shrink-0 items-center justify-center gap-3 text-[#221f1a] md:mt-5 md:gap-4">
        <button
          className="cursor-pointer rounded-full border-2 border-dashed border-[#2f2a23]/65 bg-transparent px-3 py-1.5 text-[14px] font-black transition-colors hover:bg-[#2f2a23]/8 [font:inherit] md:px-4 md:py-2 md:text-[16px]"
          onClick={() => moveBy(-1)}
          aria-label="Previous project"
        >
          ←
        </button>

        <div className="flex items-center justify-center gap-2.5">
          {PROJECT_PAGES.map((_, index) => {
            const active = index === activePage;

            return (
              <button
                key={index}
                className={`h-3 w-3 cursor-pointer rounded-full border-2 border-dashed transition-colors [font:inherit] ${
                  active
                    ? "border-[#4c9a47] bg-[#4c9a47]/65"
                    : "border-[#2f2a23]/45 bg-transparent hover:border-[#2f2a23]/75"
                }`}
                onClick={() => setActivePage(index)}
                aria-label={`Go to project page ${index + 1}`}
              />
            );
          })}
        </div>

        <button
          className="cursor-pointer rounded-full border-2 border-dashed border-[#2f2a23]/65 bg-transparent px-3 py-1.5 text-[14px] font-black transition-colors hover:bg-[#2f2a23]/8 [font:inherit] md:px-4 md:py-2 md:text-[16px]"
          onClick={() => moveBy(1)}
          aria-label="Next project"
        >
          →
        </button>
      </div>
    </div>
  );
}
