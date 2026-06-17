"use client";

import Image from "next/image";

const TECH_ICONS: Record<string, string> = {
  "Next.js": "/tech/nextjs.svg",
  React: "/tech/react.svg",
  TypeScript: "/tech/typescript.svg",
  Tailwind: "/tech/tailwindcss.svg",
  "Three.js": "/tech/threejs.svg",
  "React Three Fiber": "/tech/react-three-fiber.svg",
  GSAP: "/tech/gsap.svg",
  Motion: "/tech/motion.svg",
  MongoDB: "/tech/mongodb.svg",
  Mongoose: "/tech/mongoose.svg",
  Stripe: "/tech/stripe.svg",
  Prisma: "/tech/prisma.svg",
  Postgres: "/tech/postgres.svg",
  Vercel: "/tech/vercel.svg",
  AWS: "/tech/aws.svg",
};

function TechChip({ children }: { children: string }) {
  const icon = TECH_ICONS[children];

  return (
    <span className="mx-1 inline-flex translate-y-[-1px] items-center gap-1.5 rounded-[9px] border-2 border-dashed border-[#2f2a23]/55 bg-[#fff8e8]/45 px-2 py-0.5 text-[0.86em] font-bold leading-none text-[#24211d] shadow-[2px_2px_0_rgba(39,32,24,0.08)]">
      {icon ? (
        <Image
          className="h-[1em] w-[1em] object-contain"
          src={icon}
          alt=""
          width={18}
          height={18}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}

export default function AboutView() {
  return (
    <div className="text-left text-[#2a251f]">
      <div className="float-left mb-4 mr-5 h-[min(46vw,190px)] w-[min(46vw,190px)] overflow-hidden rounded-full border-[3px] border-dashed border-[#24211d] bg-[#fff8e8]/38 shadow-[4px_5px_0_rgba(39,32,24,0.08)] md:mb-5 md:mr-7 md:h-[clamp(130px,10vw,180px)] md:w-[clamp(130px,10vw,180px)] md:border-[4px]">
        <div className="h-full w-full bg-[url('/profile.jpg')] bg-cover bg-center" />
      </div>

      <p className="mb-3 mt-0 pt-1 text-[clamp(15px,4vw,19px)] font-black leading-none text-[#4c9a47] md:pt-0 md:text-[clamp(16px,1.15vw,22px)]">
        Hi, I am Raunak
      </p>
      <h1 className="m-0 text-[clamp(34px,9vw,52px)] font-black leading-[0.95] text-[#24211d] md:text-[clamp(38px,3.4vw,62px)]">
        Agentic Engineer
      </h1>

      <div className="clear-left mt-5 text-[clamp(13px,3.7vw,16px)] font-semibold leading-[1.55] text-[#3d3830] md:mt-7 md:text-[clamp(14px,0.95vw,18px)] [&>p+p]:mt-3 md:[&>p+p]:mt-4">
        <p className="m-0">
          I like crafting web experiences with a focus on detail, reliability,
          and polish. Most days, that means building with <TechChip>Next.js</TechChip>,
          <TechChip>React</TechChip>, <TechChip>TypeScript</TechChip>, and
          <TechChip>Tailwind</TechChip> to turn product ideas into polished,
          responsive interfaces.
        </p>

        <p className="m-0">
          For interactive work, I use <TechChip>Three.js</TechChip>,
          <TechChip>React Three Fiber</TechChip>, <TechChip>GSAP</TechChip>, and
          <TechChip>Motion</TechChip> to make 3D scenes, scroll stories, and
          playful web experiences.
        </p>

        <p className="m-0">
          I also build full-stack flows with
          <TechChip>MongoDB</TechChip>, <TechChip>Mongoose</TechChip>,
          <TechChip>Prisma</TechChip>, <TechChip>Postgres</TechChip>, and
          <TechChip>Stripe</TechChip>, then
          deploy and maintain projects on <TechChip>Vercel</TechChip> and
          <TechChip>AWS</TechChip>.
        </p>
      </div>
    </div>
  );
}
