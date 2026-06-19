"use client";

import { type ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import AboutView from "@/components/info-views/AboutView";
import ContactView from "@/components/info-views/ContactView";
import ExperienceView from "@/components/info-views/ExperienceView";
import ProjectsView from "@/components/info-views/ProjectsView";

export type InfoViewName = "about" | "projects" | "experience" | "contact";

function CurrentView({ view }: { view: InfoViewName | null }) {
  if (view === "projects") return <ProjectsView />;
  if (view === "experience") return <ExperienceView />;
  if (view === "contact") return <ContactView />;
  return null;
}

function HandDrawnIcon({ view }: { view: InfoViewName }) {
  const svgClass = "h-[1.32em] w-[1.32em] shrink-0 overflow-visible";
  const sharedProps = {
    className: svgClass,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 3.1,
    viewBox: "0 0 32 32",
  };

  if (view === "about") {
    return (
      <svg {...sharedProps}>
        <path d="M5.4 15.2 16 6.1l10.7 9.2" />
        <path d="M8 14.2v12.1c0 .9.6 1.5 1.5 1.5h13.1c.9 0 1.5-.6 1.5-1.5V14.2" />
        <path d="M13.1 27.7v-7.2c1.9-.18 3.8-.18 5.8 0v7.2" />
      </svg>
    );
  }

  if (view === "projects") {
    return (
      <svg {...sharedProps}>
        <path d="M7.2 27.2c5.9.25 11.9.24 18.1-.05 1.05-.05 1.75-.78 1.85-1.82l.64-9.7c.09-1.28-.72-2.18-2.02-2.2l-9.2-.08-1.74-2.58c-.28-.44-.72-.64-1.25-.64H8.9c-.98 0-1.7.72-1.7 1.7v15.35Z" />
        <path d="M10.5 13.85c2.38-.16 4.72-.14 7.05.08" />
        <path d="M17.4 16.95c2.55-.13 5.05-.11 7.56.05" />
      </svg>
    );
  }

  if (view === "experience") {
    return (
      <svg {...sharedProps}>
        <path d="M6.35 11.9c6.45-.28 12.9-.26 19.28.05 1.25.06 2.12 1 2.12 2.25v11.08c0 1.3-.92 2.25-2.22 2.32-6.38.28-12.78.28-19.18-.02-1.28-.06-2.1-.98-2.1-2.26V14.1c0-1.25.86-2.15 2.1-2.2Z" />
        <path d="M11.85 11.75V9.15c0-1.05.72-1.75 1.78-1.75h4.7c1.05 0 1.78.7 1.78 1.75v2.6" />
        <path d="M11.12 12.05c-.18 5.15-.16 10.28.06 15.38" />
        <path d="M20.82 12.08c.18 5.12.16 10.23-.06 15.35" />
        <path d="M5.2 19.4c1.35-.13 2.68-.13 4.02 0" />
        <path d="M22.8 19.4c1.35-.13 2.68-.13 4.02 0" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <path d="M5.6 13.7 16 7.15l10.6 6.58v12.05c-7 .28-14.03.28-21.05 0L5.6 13.7Z" />
      <path d="M5.8 14.02 16.05 20.75 26.35 14" />
      <path d="M5.9 25.55c2.32-1.72 4.62-3.34 6.92-4.9" />
      <path d="M26.1 25.48c-2.28-1.67-4.6-3.28-6.92-4.84" />
    </svg>
  );
}

const INFO_TABS: { label: string; view: InfoViewName }[] = [
  { label: "About", view: "about" },
  { label: "Projects", view: "projects" },
  { label: "Experience", view: "experience" },
  { label: "Contact", view: "contact" },
];

const INFO_BACKGROUNDS: Record<InfoViewName, string> = {
  about: "/green.webp",
  projects: "/orange.webp",
  experience: "/blue.webp",
  contact: "/white.webp",
};

const INFO_VIEW_IMAGES_TO_PRELOAD = [
  ...Object.values(INFO_BACKGROUNDS),
  "/profile.jpg",
  "/projects/perry.webp",
  "/meta/lotr-portfolio-card.jpg",
  "/projects/bubblz.webp",
  "/projects/nebula-store.webp",
  "/experience/dardoc-og.png",
  "/experience/pandabase-icon.png",
  "/tech/nextjs.svg",
  "/tech/react.svg",
  "/tech/typescript.svg",
  "/tech/tailwindcss.svg",
  "/tech/threejs.svg",
  "/tech/react-three-fiber.svg",
  "/tech/gsap.svg",
  "/tech/motion.svg",
  "/tech/mongodb.svg",
  "/tech/mongoose.svg",
  "/tech/stripe.svg",
  "/tech/prisma.svg",
  "/tech/postgres.svg",
  "/tech/vercel.svg",
  "/tech/aws.svg",
];

const INFO_HEADINGS: Record<
  InfoViewName,
  {
    doodle: string;
    title: string;
    subtitle: string;
  }
> = {
  about: {
    doodle: "✿",
    title: "About Me",
    subtitle:
      "Playful interactive web experiences with code, motion, and tiny hand-crafted details.",
  },
  projects: {
    doodle: "☆",
    title: "My Projects",
    subtitle:
      "Interactive builds, visual experiments, and product experiences from the journey so far.",
  },
  experience: {
    doodle: "♕",
    title: "Experience",
    subtitle:
      "Frontend engineering, interaction design, 3D web scenes, and detail-heavy interfaces.",
  },
  contact: {
    doodle: "♡",
    title: "Let's Connect",
    subtitle:
      "Want to collaborate, ask about a project, or build something unusual? Send a note.",
  },
};

function HeadingDoodle({
  doodle,
  view,
}: {
  doodle: string;
  view: InfoViewName;
}) {
  const className =
    "inline-block align-[-0.04em] text-[0.9em] text-[#4c9a47] [&>svg]:h-[1em] [&>svg]:w-[1em]";

  if (view === "contact") {
    return <span className={className}>{doodle}</span>;
  }

  return (
    <span className={className}>
      <HandDrawnIcon view={view} />
    </span>
  );
}

const PAPER_LINE_STYLE = {
  backgroundImage:
    "linear-gradient(90deg, transparent 0 76px, rgba(190,99,83,0.28) 77px, transparent 78px), repeating-linear-gradient(0deg, transparent 0 31px, rgba(83,121,145,0.22) 32px, transparent 33px)",
  fontFamily: "'Shantell Sans', 'Comic Sans MS', 'Bradley Hand', cursive",
};

export default function InfoView({
  view,
  onClose,
  mobileScenePanel,
  onViewChange,
}: {
  view: InfoViewName | null;
  mobileScenePanel?: ReactNode;
  onClose: () => void;
  onViewChange: (view: InfoViewName) => void;
}) {
  const open = view !== null;
  const activeView = view ?? "about";
  const heading = INFO_HEADINGS[activeView];
  const backgroundImage = INFO_BACKGROUNDS[activeView];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeView = (nextView: InfoViewName) => {
    onViewChange(nextView);
    setMobileMenuOpen(false);
  };

  return (
    <div
      className={`fixed inset-0 z-[2] overflow-hidden bg-[#202020] text-[#201c18] transition-opacity duration-[450ms] ${
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {INFO_VIEW_IMAGES_TO_PRELOAD.map((image) => (
        <div
          key={image}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}

      <div
        className="pointer-events-none absolute inset-[1.6vh_3vw_2.2vh_3vw] bg-[#f7e6c7] shadow-[0_20px_80px_rgba(0,0,0,0.42)] md:inset-[4vh_4vw_4.5vh_4vw]"
        style={PAPER_LINE_STYLE}
      />

      <div className="notebook-scroll absolute inset-[1.6vh_3vw_2.2vh_3vw] overflow-y-auto overflow-x-hidden bg-transparent md:inset-[4vh_4vw_4.5vh_4vw] md:overflow-hidden">
        <div className="absolute bottom-0 left-0 top-0 z-[2] hidden w-[104px] bg-[linear-gradient(90deg,rgba(35,27,19,0.16),rgba(255,255,255,0.12)_42%,transparent_82%)] md:block">
          {Array.from({ length: 15 }).map((_, index) => (
            <div
              key={index}
              className="absolute left-[-18px] h-[28px] w-[104px]"
              style={{ top: `${3.4 + index * 6.45}%` }}
            >
              <div className="absolute left-[52px] top-[5px] h-[18px] w-[39px] rounded-full bg-[#211d19]/45 shadow-[inset_4px_4px_7px_rgba(0,0,0,0.34),inset_-3px_-3px_5px_rgba(255,255,255,0.26)]" />
              <div className="absolute left-0 top-[2px] h-[24px] w-[88px] rounded-full border-[6px] border-[#292722] bg-transparent shadow-[0_4px_7px_rgba(0,0,0,0.3),inset_0_3px_2px_rgba(255,255,255,0.24)]" />
              <div className="absolute left-[8px] top-[5px] h-[5px] w-[66px] rounded-full bg-white/28 blur-[0.5px]" />
              <div className="absolute left-[9px] bottom-[5px] h-[4px] w-[64px] rounded-full bg-black/28 blur-[0.5px]" />
            </div>
          ))}
        </div>

        <div className="relative z-[3] flex min-h-full flex-col px-[6vw] pb-[4vh] pt-[26px] md:absolute md:inset-0 md:px-[5.8vw] md:pb-[6.2vh] md:pt-[7.4vh]">
          <div className="flex shrink-0 items-start justify-between gap-3 md:ml-[1.8vw] md:gap-6">
            <div className="min-w-0 md:hidden">
              <h1 className="m-0 text-[clamp(28px,8vw,42px)] font-black leading-none text-[#24211d]">
                {heading.title} <HeadingDoodle view={activeView} doodle={heading.doodle} />
              </h1>
              <div className="mt-2 h-[4px] w-[min(220px,68vw)] rounded-full bg-[#4c9a47]" />
            </div>

            <nav className="hidden min-w-0 flex-1 items-center gap-4 pr-3 md:flex md:flex-none md:gap-[clamp(22px,3vw,54px)] md:overflow-visible md:pr-0">
              {INFO_TABS.map((tab) => {
                const active = view === tab.view;

                return (
                  <button
                    key={tab.view}
                    className="group relative flex min-w-0 shrink-0 cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[clamp(12px,3.4vw,15px)] font-black text-[#24211d] [font:inherit] md:gap-2 md:text-[clamp(16px,1.2vw,23px)]"
                    onClick={() => changeView(tab.view)}
                  >
                    <HandDrawnIcon view={tab.view} />
                    <span className="min-w-0 truncate">{tab.label}</span>
                    <span
                      className={`absolute -bottom-2 left-0 h-[3px] rounded-full bg-[#4c9a47] transition-all duration-200 ${
                        active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            <button
              className="ml-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-2 border-dashed border-[#24211d]/45 bg-[#fff8e8]/50 text-[#24211d] shadow-[2px_3px_0_rgba(39,32,24,0.08)] [font:inherit] md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileMenuOpen}
            >
              <span className="relative block h-[16px] w-[20px] before:absolute before:left-0 before:top-0 before:h-[3px] before:w-full before:rounded-full before:bg-current before:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-current after:content-['']">
                <span className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full bg-current" />
              </span>
            </button>

            <button
              className="hidden shrink-0 cursor-pointer rounded-[8px] border-2 border-dashed border-transparent bg-transparent px-3 py-1 font-black text-[#24211d] transition-colors hover:border-[#24211d] [font:inherit] md:block md:text-[clamp(18px,1.25vw,24px)]"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          {open && mobileMenuOpen && typeof document !== "undefined"
            ? createPortal(
                <div
                  className="fixed inset-0 z-[60] bg-[#201c18]/28 opacity-100 md:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-hidden={false}
                >
                  <div
                    className="absolute right-[6vw] top-[24px] w-[min(260px,72vw)] translate-x-0 rounded-[18px] border-2 border-dashed border-[#24211d]/55 bg-[#fff3d5] p-3 shadow-[6px_8px_0_rgba(39,32,24,0.16)]"
                    style={PAPER_LINE_STYLE}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="m-0 text-[18px] font-black text-[#24211d]">Menu</p>
                      <button
                        className="cursor-pointer rounded-[8px] border-2 border-dashed border-[#24211d]/35 bg-transparent px-2 py-0.5 text-[15px] font-black text-[#24211d] [font:inherit]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid gap-2">
                      {INFO_TABS.map((tab) => {
                        const active = view === tab.view;

                        return (
                          <button
                            key={tab.view}
                            className={`flex cursor-pointer items-center gap-3 rounded-[12px] border-2 border-dashed px-3 py-2 text-left text-[17px] font-black text-[#24211d] [font:inherit] ${
                              active
                                ? "border-[#4c9a47]/70 bg-[#4c9a47]/12"
                                : "border-transparent bg-[#fff8e8]/35"
                            }`}
                            onClick={() => changeView(tab.view)}
                          >
                            <HandDrawnIcon view={tab.view} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>,
                document.body,
              )
            : null}

          {mobileScenePanel ? (
            <div className="mt-[clamp(26px,4.5vh,44px)] md:hidden">
              {mobileScenePanel}
            </div>
          ) : null}

          <div
            className={`flex flex-none flex-col md:mt-[5vh] md:grid md:min-h-0 md:flex-1 md:grid-cols-[minmax(0,48%)_minmax(0,1fr)] md:gap-[4vw] md:pl-[4vw] ${
              mobileScenePanel ? "mt-8" : "mt-[40vh]"
            }`}
          >
            <div aria-hidden="true" className="hidden md:block" />

            <section className="flex flex-none flex-col text-left md:min-h-0 md:flex-1 md:max-w-[760px]">
              {activeView === "about" ? (
                <>
                  <header className="hidden shrink-0 md:block">
                    <h1 className="m-0 text-[clamp(30px,9vw,46px)] font-black leading-none text-[#24211d] md:text-[clamp(34px,2.8vw,58px)]">
                      {heading.title} <HeadingDoodle view={activeView} doodle={heading.doodle} />
                    </h1>
                    <div className="mt-2 h-[4px] w-[min(260px,60%)] rounded-full bg-[#4c9a47]" />
                  </header>

                  <main className="mt-[2.4vh] flex-none overflow-visible pr-1 md:mt-[3vh] md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-2">
                    <AboutView />
                  </main>
                </>
              ) : (
                <>
                  <header className="hidden shrink-0 md:block">
                    <h1 className="m-0 text-[clamp(30px,9vw,46px)] font-black leading-none text-[#24211d] md:text-[clamp(34px,2.8vw,58px)]">
                      {heading.title} <HeadingDoodle view={activeView} doodle={heading.doodle} />
                    </h1>
                    <div className="mt-2 h-[4px] w-[min(260px,60%)] rounded-full bg-[#4c9a47]" />
                    <p className="mt-3 max-w-[760px] text-[clamp(14px,4vw,17px)] font-bold leading-[1.45] text-[#3d3830] md:mt-4 md:text-[clamp(14px,1vw,19px)]">
                      {heading.subtitle}
                    </p>
                  </header>

                  <main className="mt-[2.4vh] flex-none overflow-visible pr-1 md:mt-[3vh] md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-2">
                    <CurrentView view={view} />
                  </main>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
