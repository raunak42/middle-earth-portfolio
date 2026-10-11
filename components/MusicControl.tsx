"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Disc3, Volume2, VolumeX } from "lucide-react";

const TRACKS = [
  { lines: ["Prologue"], title: "Prologue", src: "/music/prologue.mp3" },
  { lines: ["The", "Shire"], title: "The Shire", src: "/music/the-shire.mp3" },
  { lines: ["Rivendell"], title: "Rivendell", src: "/music/rivendell.mp3" },
  {
    lines: ["Pelennor", "Fields"],
    title: "Pelennor Fields",
    src: "/music/pelennor-fields.mp3",
  },
  { lines: ["May It", "Be"], title: "May It Be", src: "/music/may-it-be.mp3" },
];

const DEFAULT_TRACK = 1;
const MUSIC_VOLUME = 0.45;

// Disk geometry in SVG units (viewBox is 200 x 200, centred on 0,0).
const SLICE_DEG = 360 / TRACKS.length;
const SLICE_GAP_DEG = 2.4;
const INNER_RADIUS = 30;
const OUTER_RADIUS = 90;
const LABEL_RADIUS = 60;
const SELECTED_POP = 5;

function polar(radius: number, angleDeg: number) {
  const radians = (angleDeg * Math.PI) / 180;
  return [radius * Math.cos(radians), radius * Math.sin(radians)];
}

// Slice i is centred on angle -90 + i * SLICE_DEG, so the first track sits at
// the top and the rest follow clockwise.
function getSliceAngle(index: number) {
  return -90 + index * SLICE_DEG;
}

function getSlicePath(index: number) {
  const center = getSliceAngle(index);
  const start = center - SLICE_DEG / 2 + SLICE_GAP_DEG / 2;
  const end = center + SLICE_DEG / 2 - SLICE_GAP_DEG / 2;
  const [ox1, oy1] = polar(OUTER_RADIUS, start);
  const [ox2, oy2] = polar(OUTER_RADIUS, end);
  const [ix2, iy2] = polar(INNER_RADIUS, end);
  const [ix1, iy1] = polar(INNER_RADIUS, start);

  return [
    `M ${ox1} ${oy1}`,
    `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${ix1} ${iy1}`,
    "Z",
  ].join(" ");
}

export default function MusicControl({ hidden }: { hidden: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliceRefs = useRef<(SVGGElement | null)[]>([]);
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(DEFAULT_TRACK);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "none";
      audio.volume = MUSIC_VOLUME;
      audioRef.current = audio;
    }

    return audioRef.current;
  }, []);

  const playTrack = useCallback(
    (index: number) => {
      const audio = getAudio();
      const track = TRACKS[index];

      if (!audio.src.endsWith(track.src)) audio.src = track.src;
      audio.play().catch(() => setPlaying(false));
    },
    [getAudio],
  );

  // Advance through the playlist when a track finishes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playing) return;

    const handleEnded = () => {
      setTrackIndex((index) => (index + 1) % TRACKS.length);
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playing]);

  useEffect(() => {
    if (playing) playTrack(trackIndex);
  }, [playTrack, playing, trackIndex]);

  // Pause while the tab is in the background and resume on return.
  useEffect(() => {
    if (!playing) return;

    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.visibilityState === "visible") {
        audio.play().catch(() => setPlaying(false));
      } else {
        audio.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [playing]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlaying = () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    // Start playback inside the click handler so browsers allow it.
    playTrack(trackIndex);
    setPlaying(true);
  };

  const selectTrack = (index: number) => {
    const nextIndex = (index + TRACKS.length) % TRACKS.length;
    setTrackIndex(nextIndex);
    sliceRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      className={`fixed left-3 top-3 z-20 flex flex-col items-start text-white transition-opacity duration-300 md:left-4 md:top-4 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <button
        type="button"
        aria-label={playing ? "Mute music" : "Play music"}
        aria-pressed={playing}
        className="flex cursor-pointer items-center justify-center border-0 bg-transparent px-3 py-1.5 text-white drop-shadow"
        onClick={togglePlaying}
      >
        {playing ? (
          <Volume2 className="h-[18px] w-[18px]" strokeWidth={2.5} />
        ) : (
          <VolumeX className="h-[18px] w-[18px]" strokeWidth={2.5} />
        )}
      </button>

      <div
        aria-hidden={!playing}
        className={`relative ml-1 mt-1 h-[164px] w-[164px] origin-top-left transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:h-[184px] md:w-[184px] ${
          playing
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-75 opacity-0"
        }`}
      >
        <svg
          aria-label="Soundtrack"
          className="h-full w-full overflow-visible drop-shadow"
          role="radiogroup"
          viewBox="-100 -100 200 200"
        >
          {TRACKS.map((track, index) => {
            const selected = index === trackIndex;
            const [popX, popY] = polar(
              selected ? SELECTED_POP : 0,
              getSliceAngle(index),
            );
            const [labelX, labelY] = polar(LABEL_RADIUS, getSliceAngle(index));

            return (
              <g
                key={track.src}
                ref={(element) => {
                  sliceRefs.current[index] = element;
                }}
                aria-checked={selected}
                aria-label={track.title}
                className="group cursor-pointer outline-none"
                role="radio"
                style={{
                  transform: `translate(${popX}px, ${popY}px)`,
                  transition: "transform 300ms cubic-bezier(0.22,1,0.36,1)",
                }}
                tabIndex={playing && selected ? 0 : -1}
                onClick={() => setTrackIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    selectTrack(trackIndex + 1);
                  } else if (
                    event.key === "ArrowLeft" ||
                    event.key === "ArrowUp"
                  ) {
                    selectTrack(trackIndex - 1);
                  } else {
                    return;
                  }
                  event.preventDefault();
                }}
              >
                <path
                  d={getSlicePath(index)}
                  className={`stroke-white transition-[fill,stroke-width] duration-200 group-focus-visible:stroke-[2.5] ${
                    selected
                      ? "fill-white"
                      : "fill-[rgba(18,14,10,0.42)] group-hover:fill-[rgba(255,255,255,0.18)]"
                  }`}
                  strokeOpacity={selected ? 1 : 0.75}
                  strokeWidth={1.25}
                />
                <text
                  className={`pointer-events-none text-[9.5px] font-black uppercase tracking-[0.06em] transition-[fill] duration-200 ${
                    selected ? "fill-[#24211d]" : "fill-white"
                  }`}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  x={labelX}
                  y={labelY}
                >
                  {track.lines.map((line, lineIndex) => (
                    <tspan
                      key={line}
                      dy={
                        lineIndex === 0
                          ? `${-0.55 * (track.lines.length - 1)}em`
                          : "1.1em"
                      }
                      x={labelX}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>

        <Disc3
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 animate-[spin_3s_linear_infinite] text-white drop-shadow motion-reduce:animate-none"
          strokeWidth={2}
        />
      </div>
    </div>
  );
}
