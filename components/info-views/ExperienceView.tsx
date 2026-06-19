"use client";

import Image from "next/image";

const EXPERIENCE = [
  {
    company: "DarDoc, Dubai",
    role: "Frontend Developer · Full-time",
    date: "Dec 2024 — Jan 2026",
    image: "/experience/dardoc-og.png",
    imageClassName: "bg-[#f8f5ed] object-cover",
    summary:
      "Owned the public-facing website, shipping/maintaining conversion-focused web experiences across 12+ healthcare verticals, plus internal dashboards, working closely with design and marketing/SEO.",
  },
  {
    company: "Pandabase, Florida",
    role: "Frontend Developer · Contract",
    date: "Nov 2024 — Dec 2024",
    image: "/experience/pandabase-icon.png",
    imageClassName: "bg-black p-1.5 object-contain",
    summary:
      "Integrated React UI flows with backend APIs for an entrepreneur-focused ecommerce/payments platform, handling data fetching, error states, and frontend integration logic.",
  },
];

export default function ExperienceView() {
  return (
    <div className="relative h-auto min-h-0 overflow-visible text-[#2a251f] md:h-full md:overflow-hidden md:min-h-0">
      <div className="space-y-9 pt-1 md:space-y-10">
        {EXPERIENCE.map((item, index) => (
          <article
            key={item.company}
            className="grid grid-cols-[18px_minmax(0,1fr)] gap-x-4 md:gap-x-7"
          >
            <div className="relative">
              {index < EXPERIENCE.length - 1 ? (
                <div className="absolute left-1/2 top-2 h-[calc(100%+2rem)] -translate-x-1/2 border-l-2 border-dashed border-[#2f2a23]/55 md:h-[calc(100%+2.5rem)]" />
              ) : null}
              <div className="absolute left-1/2 top-0 z-[1] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#2f2a23]/70 bg-[#4c9a47]" />
            </div>

            <div className="flex items-start gap-3 md:gap-5">
              <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[10px] md:h-[59px] md:w-[59px]">
                <Image
                  className={`h-full w-full ${item.imageClassName}`}
                  src={item.image}
                  alt={`${item.company} logo`}
                  width={132}
                  height={132}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col items-start gap-1 md:flex-row md:justify-between md:gap-3">
                  <div className="min-w-0">
                    <h3 className="m-0 text-[clamp(19px,5.4vw,25px)] font-black leading-[1.04] text-[#221f1a] md:text-[clamp(20px,1.45vw,28px)]">
                      {item.company}
                    </h3>
                    <span className="mt-1 inline-block text-[clamp(11px,3.05vw,13px)] font-black leading-tight text-[#8a5a2b] md:hidden">
                      {item.date}
                    </span>
                    <p className="mb-0 mt-1 text-[clamp(12px,3.4vw,16px)] font-black leading-tight text-[#4c9a47] md:whitespace-nowrap md:text-[clamp(14px,0.95vw,17px)]">
                      {item.role}
                    </p>
                  </div>

                  <span className="hidden shrink-0 pt-1 text-[clamp(11px,3vw,13px)] font-black text-[#4c9a47] md:block md:text-[clamp(12px,0.8vw,14px)]">
                    {item.date}
                  </span>
                </div>

                <p className="mb-0 mt-3 text-[clamp(12px,3.45vw,15px)] font-bold leading-[1.34] text-[#3b362e] md:text-[clamp(13px,0.9vw,16px)]">
                  {item.summary}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
