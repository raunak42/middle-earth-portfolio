"use client";

export default function ZoomControl({
  hidden,
  onZoomChange,
  zoom,
}: {
  hidden: boolean;
  onZoomChange: (zoom: number) => void;
  zoom: number;
}) {
  const setClampedZoom = (nextZoom: number) => {
    onZoomChange(Math.min(1, Math.max(0, nextZoom)));
  };

  return (
    <div
      className={`pointer-events-auto fixed bottom-10 left-1/2 z-20 grid -translate-x-1/2 grid-cols-[18px_205px_18px] items-center gap-2 text-white transition-opacity duration-300 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <button
        aria-label="Zoom out"
        className="relative h-[18px] w-[18px] cursor-pointer border-0 bg-transparent p-0 drop-shadow"
        onClick={() => setClampedZoom(zoom - 0.1)}
      >
        <span className="absolute left-1/2 top-1/2 h-[1.5px] w-[13px] -translate-x-1/2 -translate-y-1/2 bg-white" />
      </button>
      <input
        aria-label="Zoom"
        className="zoom-slider block w-[205px] cursor-pointer self-center"
        max={1}
        min={0}
        step={0.01}
        type="range"
        value={zoom}
        onChange={(event) => setClampedZoom(Number(event.target.value))}
      />
      <button
        aria-label="Zoom in"
        className="relative h-[18px] w-[18px] cursor-pointer border-0 bg-transparent p-0 drop-shadow"
        onClick={() => setClampedZoom(zoom + 0.1)}
      >
        <span className="absolute left-1/2 top-1/2 h-[1.5px] w-[15px] -translate-x-1/2 -translate-y-1/2 bg-white" />
        <span className="absolute left-1/2 top-1/2 h-[15px] w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-white" />
      </button>
    </div>
  );
}
