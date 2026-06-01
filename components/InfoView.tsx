"use client";

import AboutView from "@/components/info-views/AboutView";
import ContactView from "@/components/info-views/ContactView";
import ExperienceView from "@/components/info-views/ExperienceView";
import ProjectsView from "@/components/info-views/ProjectsView";

export type InfoViewName = "about" | "projects" | "experience" | "contact";

function CurrentTextView({ view }: { view: InfoViewName | null }) {
  if (view === "experience") return <ExperienceView />;
  if (view === "contact") return <ContactView />;
  return <AboutView />;
}

const INFO_TABS: { label: string; view: InfoViewName }[] = [
  { label: "About", view: "about" },
  { label: "Projects", view: "projects" },
  { label: "Experience", view: "experience" },
  { label: "Contact", view: "contact" },
];

const INFO_BG_SATURATION = 0.55;

const INFO_HEADINGS: Record<
  InfoViewName,
  {
    title: string;
    subtitle: string;
  }
> = {
  about: {
    title: "About",
    subtitle:
      "I build playful interactive web experiences with code, motion, and a lot of tiny hand-crafted details.",
  },
  projects: {
    title: "Projects",
    subtitle:
      "A collection of interactive builds, visual experiments, and product experiences.",
  },
  experience: {
    title: "Experience",
    subtitle:
      "I work across frontend engineering, interaction design, 3D web scenes, and detail-heavy product interfaces.",
  },
  contact: {
    title: "Contact",
    subtitle:
      "Want to collaborate, ask about a project, or build something unusual? I’d love to hear from you.",
  },
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
  const heading = INFO_HEADINGS[view ?? "about"];

  return (
    <div
      className={`fixed inset-0 z-[2] overflow-hidden text-white transition-opacity duration-[450ms] ${
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/green.webp')] bg-cover bg-center"
        style={{ filter: `saturate(${INFO_BG_SATURATION})` }}
      />

      <div className="absolute left-1/2 top-[6.5vh] z-[2] flex -translate-x-1/2 items-center rounded-full border border-dashed border-white/18 bg-white/8 p-1 backdrop-blur-sm">
        {INFO_TABS.map((tab) => {
          const active = view === tab.view;

          return (
            <button
              key={tab.view}
              className={`cursor-pointer rounded-full border-0 px-5 py-2 text-[15px] font-extrabold text-white transition-colors duration-200 [font:inherit] ${
                active ? "bg-white/22" : "bg-transparent hover:bg-white/10"
              }`}
              onClick={() => onViewChange(tab.view)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="absolute left-1/2 top-[13vh] z-[1] w-[min(62vw,1040px)] -translate-x-1/2 text-center">
        <h1 className="mb-4 mt-0 text-[clamp(38px,3.4vw,66px)] leading-none">
          {heading.title}
        </h1>
        <p className="mx-auto mt-0 max-w-[820px] text-[clamp(15px,1.15vw,21px)] leading-[1.45] opacity-90">
          {heading.subtitle}
        </p>
      </div>

      <button
        className="absolute right-[7vw] top-[10vh] z-[2] cursor-pointer border-0 bg-transparent text-[22px] font-extrabold text-white [font:inherit]"
        onClick={onClose}
      >
        Close
      </button>

      {view === "projects" ? (
        <ProjectsView />
      ) : (
        <div className="absolute right-[8vw] top-[36vh] w-[min(31vw,560px)] leading-[1.45] [text-wrap:pretty]">
          <CurrentTextView view={view} />
        </div>
      )}
    </div>
  );
}
