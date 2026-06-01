"use client";

export default function AboutView() {
  return (
    <div className="text-[#2a251f]">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-7">
        <div className="mx-auto h-[min(46vw,190px)] w-[min(46vw,190px)] shrink-0 overflow-hidden rounded-full border-[3px] border-dashed border-[#24211d] bg-[#fff8e8]/38 shadow-[4px_5px_0_rgba(39,32,24,0.08)] md:mx-0 md:h-[clamp(130px,10vw,180px)] md:w-[clamp(130px,10vw,180px)] md:border-[4px]">
          <div className="h-full w-full bg-[url('/profile.jpg')] bg-cover bg-center" />
        </div>

        <div className="min-w-0 text-left">
          <p className="mb-3 mt-0 text-[clamp(15px,4vw,19px)] font-black leading-none text-[#4c9a47] md:text-[clamp(16px,1.15vw,22px)]">
            Hi, I am Raunak
          </p>
          <h1 className="m-0 text-[clamp(34px,9vw,52px)] font-black leading-[0.95] text-[#24211d] md:text-[clamp(38px,3.4vw,62px)]">
            Agentic Engineer
          </h1>
          <p className="mt-5 max-w-[560px] text-[clamp(16px,4.5vw,21px)] font-bold leading-[1.45] text-[#3d3830] md:mt-7 md:text-[clamp(18px,1.35vw,25px)]">
            I build playful, interactive, and detail-heavy web experiences with
            code, motion, and 3D scenes. I enjoy turning small ideas into
            polished products that feel fast, memorable, and a little magical.
          </p>
        </div>
      </div>
    </div>
  );
}
