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
    <div className="relative h-full min-h-[410px] overflow-hidden text-[#2a251f] md:min-h-0">
      <div className="space-y-8 pt-1 md:space-y-10">
        {EXPERIENCE.map((item, index) => (
          <article
            key={item.company}
            className="grid grid-cols-[18px_minmax(0,1fr)] gap-x-6 md:gap-x-7"
          >
            <div className="relative">
              {index < EXPERIENCE.length - 1 ? (
                <div className="absolute left-1/2 top-2 h-[calc(100%+2rem)] -translate-x-1/2 border-l-2 border-dashed border-[#2f2a23]/55 md:h-[calc(100%+2.5rem)]" />
              ) : null}
              <div className="absolute left-1/2 top-0 z-[1] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#2f2a23]/70 bg-[#4c9a47]" />
            </div>

            <div className="flex items-start gap-4 md:gap-5">
              <div className="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-[10px] md:h-[59px] md:w-[59px]">
                <Image
                  className={`h-full w-full ${item.imageClassName}`}
                  src={item.image}
                  alt={`${item.company} logo`}
                  width={132}
                  height={132}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="m-0 text-[clamp(18px,5vw,24px)] font-black leading-tight text-[#221f1a] md:text-[clamp(20px,1.45vw,28px)]">
                      {item.company}
                    </h3>
                    <p className="mb-0 mt-1 whitespace-nowrap text-[clamp(12px,3.4vw,16px)] font-black leading-tight text-[#4c9a47] md:text-[clamp(14px,0.95vw,17px)]">
                      {item.role}
                    </p>
                  </div>

                  <span className="shrink-0 pt-1 text-[clamp(11px,3vw,13px)] font-black text-[#4c9a47] md:text-[clamp(12px,0.8vw,14px)]">
                    {item.date}
                  </span>
                </div>

                <p className="mb-0 mt-3 text-[clamp(12px,3.5vw,15px)] font-bold leading-[1.35] text-[#3b362e] md:text-[clamp(13px,0.9vw,16px)]">
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
