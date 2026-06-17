const COLOR_OPTIONS = {
  currentDarkBrown: "#20110d",
  espresso: "#2a1710",
  barkBrown: "#3b2416",
  mossGreen: "#24331f",
  forestGreen: "#163522",
  charcoalOlive: "#25271b",
  burntUmber: "#5a2d16",
  mutedGold: "#9b6b16",
  realGold: "#d4af37",
};

export default function LoadingPreviewPage() {
  const loaderColor = COLOR_OPTIONS.forestGreen;
  const textColor = COLOR_OPTIONS.forestGreen;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black" style={{ color: textColor }}>
      <div className="pointer-events-none absolute inset-[-28px] scale-105 bg-[#d9c49f] bg-[url('/bgggg.webp')] bg-cover bg-center opacity-95 blur-[4px]" />

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="relative px-14 py-8 text-center before:absolute before:inset-[-64px] before:-z-10 before:rounded-full before:bg-[radial-gradient(ellipse_at_center,rgba(248,223,180,0.82)_0%,rgba(248,223,180,0.56)_32%,rgba(248,223,180,0.26)_62%,transparent_100%)] before:blur-[30px] before:content-[''] after:absolute after:inset-[-36px] after:-z-10 after:rounded-full after:bg-[radial-gradient(ellipse_at_center,rgba(255,241,210,0.38)_0%,rgba(255,241,210,0.14)_55%,transparent_100%)] after:blur-[14px] after:content-['']">
          <div className="h-[6px] w-[180px] rounded-full bg-white/40">
            <div
              className="h-full w-[61.29%] rounded-full"
              style={{ backgroundColor: loaderColor }}
            />
          </div>
          <div className="mt-[6px] text-[0.9em] font-black tabular-nums">
            61.29%
          </div>
        </div>
      </div>
    </main>
  );
}
