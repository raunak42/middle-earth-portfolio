"use client";

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

const PAPER_LINE_STYLE = {
  backgroundImage:
    "linear-gradient(90deg, transparent 0 76px, rgba(190,99,83,0.28) 77px, transparent 78px), repeating-linear-gradient(0deg, transparent 0 31px, rgba(83,121,145,0.22) 32px, transparent 33px)",
  fontFamily: "'Shantell Sans', 'Comic Sans MS', 'Bradley Hand', cursive",
};

export default function InfoView({
  view,
  onClose,
  onViewChange,
}: {
  view: InfoViewName | null;
  onClose: () => void;
  onViewChange: (view: InfoViewName) => void;
}) {
  const open = view !== null;
  const activeView = view ?? "about";
  const heading = INFO_HEADINGS[activeView];
  const backgroundImage = INFO_BACKGROUNDS[activeView];

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

      {Object.values(INFO_BACKGROUNDS).map((image) => (
        <div
          key={image}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}

      <div
        className="absolute inset-[1.6vh_3vw_2.2vh_3vw] overflow-hidden bg-[#f7e6c7] shadow-[0_20px_80px_rgba(0,0,0,0.42)] md:inset-[4vh_4vw_4.5vh_4vw]"
        style={PAPER_LINE_STYLE}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.45),transparent_32%),radial-gradient(circle_at_88%_88%,rgba(125,78,31,0.07),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[url('/green.webp')] bg-cover bg-center opacity-[0.16] mix-blend-multiply saturate-[0.35]" />

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

        <div className="absolute left-0 right-0 top-0 z-[2] h-[72px] bg-[linear-gradient(180deg,rgba(35,27,19,0.16),rgba(255,255,255,0.12)_48%,transparent_88%)] md:hidden">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="absolute top-[-18px] h-[104px] w-[28px]"
              style={{ left: `${8 + index * 12}%` }}
            >
              <div className="absolute left-[5px] top-[52px] h-[39px] w-[18px] rounded-full bg-[#211d19]/45 shadow-[inset_4px_4px_7px_rgba(0,0,0,0.34),inset_-3px_-3px_5px_rgba(255,255,255,0.26)]" />
              <div className="absolute left-[2px] top-0 h-[88px] w-[24px] rounded-full border-[6px] border-[#292722] bg-transparent shadow-[0_4px_7px_rgba(0,0,0,0.3),inset_0_3px_2px_rgba(255,255,255,0.24)]" />
              <div className="absolute left-[5px] top-[9px] h-[62px] w-[5px] rounded-full bg-white/28 blur-[0.5px]" />
              <div className="absolute right-[5px] top-[10px] h-[60px] w-[4px] rounded-full bg-black/28 blur-[0.5px]" />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 z-[3] flex flex-col px-[6vw] pb-[4vh] pt-[78px] md:px-[5.8vw] md:pb-[6.2vh] md:pt-[7.4vh]">
          <div className="flex shrink-0 items-start justify-between gap-3 md:ml-[1.8vw] md:gap-6">
            <nav className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto pr-2 md:flex-none md:gap-[clamp(22px,3vw,54px)] md:overflow-visible md:pr-0">
              {INFO_TABS.map((tab) => {
                const active = view === tab.view;

                return (
                  <button
                    key={tab.view}
                    className="group relative flex shrink-0 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[clamp(13px,3.6vw,17px)] font-black text-[#24211d] [font:inherit] md:text-[clamp(16px,1.2vw,23px)]"
                    onClick={() => onViewChange(tab.view)}
                  >
                    <HandDrawnIcon view={tab.view} />
                    <span>{tab.label}</span>
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
              className="cursor-pointer rounded-[8px] border-2 border-dashed border-transparent bg-transparent px-3 py-1 text-[clamp(14px,3.7vw,18px)] font-black text-[#24211d] transition-colors hover:border-[#24211d] [font:inherit] md:text-[clamp(18px,1.25vw,24px)]"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="mt-[48vh] flex min-h-0 flex-1 flex-col md:mt-[5vh] md:grid md:grid-cols-[minmax(0,48%)_minmax(0,1fr)] md:gap-[4vw] md:pl-[4vw]">
            <div aria-hidden="true" className="hidden md:block" />

            <section className="flex min-h-0 flex-1 flex-col text-left md:max-w-[760px]">
              {activeView === "about" ? (
                <>
                  <header className="shrink-0">
                    <h1 className="m-0 text-[clamp(30px,9vw,46px)] font-black leading-none text-[#24211d] md:text-[clamp(34px,2.8vw,58px)]">
                      {heading.title} <span className="text-[#4c9a47]">{heading.doodle}</span>
                    </h1>
                    <div className="mt-2 h-[4px] w-[min(260px,60%)] rounded-full bg-[#4c9a47]" />
                  </header>

                  <main className="mt-[2.4vh] min-h-0 flex-1 overflow-y-auto pr-1 md:mt-[3vh] md:pr-2">
                    <AboutView />
                  </main>
                </>
              ) : (
                <>
                  <header className="shrink-0">
                    <h1 className="m-0 text-[clamp(30px,9vw,46px)] font-black leading-none text-[#24211d] md:text-[clamp(34px,2.8vw,58px)]">
                      {heading.title} <span className="text-[#4c9a47]">{heading.doodle}</span>
                    </h1>
                    <div className="mt-2 h-[4px] w-[min(260px,60%)] rounded-full bg-[#4c9a47]" />
                    <p className="mt-3 max-w-[760px] text-[clamp(14px,4vw,17px)] font-bold leading-[1.45] text-[#3d3830] md:mt-4 md:text-[clamp(14px,1vw,19px)]">
                      {heading.subtitle}
                    </p>
                  </header>

                  <main className="mt-[2.4vh] min-h-0 flex-1 overflow-y-auto pr-1 md:mt-[3vh] md:pr-2">
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
