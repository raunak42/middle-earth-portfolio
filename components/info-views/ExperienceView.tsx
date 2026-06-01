"use client";

const EXPERIENCE = [
  {
    company: "Interactive Web",
    role: "Frontend + 3D Experiments",
    date: "2024 — Present",
  },
  {
    company: "Product Interfaces",
    role: "Motion, systems, and UI engineering",
    date: "2023 — 2024",
  },
  {
    company: "Creative Coding",
    role: "Shaders, Canvas, and playful prototypes",
    date: "Ongoing",
  },
];

export default function ExperienceView() {
  return (
    <div className="relative h-full min-h-[410px] pl-7 text-[#2a251f] md:min-h-0 md:pl-8">
      <div className="absolute bottom-8 left-[7px] top-2 border-l-2 border-dashed border-[#2f2a23]/55 md:left-[8px]" />

      <div className="space-y-5 md:space-y-9">
        {EXPERIENCE.map((item) => (
          <div key={item.company} className="relative">
            <div className="absolute -left-[28px] top-2 z-[1] h-4 w-4 rounded-full border-2 border-[#2f2a23]/70 bg-[#4c9a47] md:-left-[31px]" />
            <div className="rounded-[14px] border-2 border-dashed border-[#2f2a23]/60 bg-[#fff8e8]/36 p-4 shadow-[3px_4px_0_rgba(39,32,24,0.08)] md:p-5">
              <h3 className="m-0 text-[clamp(17px,5vw,22px)] font-black leading-tight md:text-[clamp(18px,1.25vw,24px)]">
                {item.company}
              </h3>
              <p className="mb-1 mt-2 text-[clamp(13px,3.9vw,16px)] font-bold leading-[1.45] md:text-[clamp(14px,1vw,18px)]">
                {item.role}
              </p>
              <p className="m-0 text-[clamp(12px,3.5vw,15px)] font-black text-[#4c9a47] md:text-[clamp(13px,0.9vw,16px)]">
                {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
