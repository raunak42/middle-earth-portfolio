"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface PropConfig {
  amplitude: number;
  speed: number;
  axis: "x" | "y" | "z";
  anchor?: "floor" | "ceiling";
  originFixed?: boolean;
  swayAngle?: number;
  swayAxis?: "x" | "z";
  oscillateAngle?: number;
  soarRadius?: number;
  lissajous?: {
    xRadius: number;
    yRadius: number;
    freqX: number;
    freqY: number;
  };
  rock?: {
    rockAngle?: number;
    rockUpAngle?: number;
    rockDownAngle?: number;
    rockUpSpeed?: number;
    rockDownSpeed?: number;
    rockElasticity?: number;
    bobAmount: number;
    rockAxis: "x" | "y" | "z";
    // Blender axis-report vectors for objects whose local axes are not aligned with Three.js axes.
    rockWorldAxis?: [number, number, number];
    elastic?: boolean;
  };
}

type AnimEntry = {
  obj: THREE.Object3D;
  config: PropConfig;
  baseScale: THREE.Vector3;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  baseQuaternion: THREE.Quaternion;
  halfHeight: number;
  phase: number;
  phaseY: number;
};

const PROP_CONFIGS: Record<string, PropConfig> = {
  Shire_bird: {
    amplitude: 0,
    speed: 3,
    axis: "y",
    rock: { rockAngle: 0.25, bobAmount: 0, rockAxis: "z" },
  },

  bird_1: {
    amplitude: 0,
    speed: 1.0,
    axis: "x",
    lissajous: { xRadius: 0.2, yRadius: 0.4, freqX: 0.7, freqY: 1.1 },
  },
  bird_1001: {
    amplitude: 0,
    speed: 1.2,
    axis: "x",
    lissajous: { xRadius: 0, yRadius: 0.3, freqX: 1.3, freqY: 0.8 },
  },
  bird_1002: {
    amplitude: 0,
    speed: 1.1,
    axis: "x",
    lissajous: { xRadius: 0.2, yRadius: 0.08, freqX: 0.9, freqY: 1.5 },
  },
  bird_2: {
    amplitude: 0,
    speed: 1.3,
    axis: "x",
    lissajous: { xRadius: 0.28, yRadius: 0.11, freqX: 1.1, freqY: 0.6 },
  },
  bird_2001: {
    amplitude: 0,
    speed: 1.4,
    axis: "x",
    lissajous: { xRadius: 0.22, yRadius: 0.09, freqX: 0.5, freqY: 1.2 },
  },

  Shire_flower_red: { amplitude: 0.08, speed: 3.0, axis: "y" },
  Shire_flower_red001: { amplitude: 0.08, speed: 3.0, axis: "y" },
  Shire_flower_white: { amplitude: 0.08, speed: 3.0, axis: "y" },
  Shire_flower_white001: { amplitude: 0.08, speed: 3.0, axis: "y" },
  Shire_flower_yellow: { amplitude: 0.08, speed: 3.0, axis: "y" },

  Shire_mush_red: { amplitude: 0.12, speed: 2.0, axis: "z", originFixed: true },
  Shire_mush_yellow: {
    amplitude: 0.12,
    speed: 2.0,
    axis: "z",
    originFixed: true,
  },
  dark_mush: { amplitude: 0.12, speed: 2.2, axis: "z", originFixed: true },
  dark_mush001: { amplitude: 0.1, speed: 1.8, axis: "z", originFixed: true },
  mush_bush: { amplitude: 0.1, speed: 2.2, axis: "z", originFixed: true },

  Shire_smoke: { amplitude: 0.05, speed: 5, axis: "y" },

  boat: {
    amplitude: 0,
    speed: 3,
    axis: "y",
    rock: { rockAngle: 0.05, bobAmount: 0, rockAxis: "y" },
  },

  // All three Blender axes are fractional in Three.js space (unapplied
  // rotations in Blender), so we use rockWorldAxis with the exact vector
  // from the axis-report script. Pick the one that looks right and swap.
  //   Blender X → rockWorldAxis: [-0.5385, -0.4009,  0.7412]
  //   Blender Y → rockWorldAxis: [-0.2356,  0.9161,  0.3243]
  //   Blender Z → rockWorldAxis: [-0.8090, -0.0000, -0.5878]
  right_hand: {
    amplitude: 0,
    speed: 4.5,
    axis: "y",
    rock: {
      rockUpAngle: 0.65,
      rockDownAngle: 0.3,
      rockUpSpeed: 0.2,
      rockDownSpeed: 1.4,
      rockElasticity: 2,
      bobAmount: 0,
      rockAxis: "y",                             // fallback, unused when rockWorldAxis is set
      rockWorldAxis: [-0.8090, -0.0000, -0.5878], // ← Blender Z (swap to X or Y above to test)
    },
  },

  boat001: { amplitude: 0.03, speed: 0.6, axis: "y" },

  // Pivot moved to top edge in Blender (pivot_report script).
  // All four signs are rotated differently in the scene so every axis is
  // fractional in Three.js — rockWorldAxis required for each.
  // Swing axis = Blender local X for all (horizontal, perpendicular to the
  // sign face). Blender Y maps to pure Three.js +Y (vertical = spinning
  // like a top), so that's intentionally skipped.
  // Speeds staggered so signs drift out of phase over time.
  // Tune rockAngle (radians) for more/less swing — 0.12 ≈ 7°.
  //   Blender X → rockWorldAxis: [+0.8290, +0.0000, +0.5592]
  //   Blender Y → rockWorldAxis: [-0.0000, +1.0000, +0.0000]  ← vertical (spins like a top), don't use
  //   Blender Z → rockWorldAxis: [-0.5592, -0.0000, +0.8290]
  CLICK_About: {
    amplitude: 0,
    speed: 1.5,
    axis: "y",
    rock: {
      rockAngle: 0.1,
      bobAmount: 0,
      rockAxis: "x",                              // fallback, unused
      rockWorldAxis: [-0.5592, -0.0000, +0.8290], // Blender X
    },
  },

  //   Blender X → rockWorldAxis: [+0.3420, +0.0000, +0.9397]
  //   Blender Y → rockWorldAxis: [-0.0000, +1.0000, +0.0000]  ← vertical (spins like a top), don't use
  //   Blender Z → rockWorldAxis: [-0.9397, -0.0000, +0.3420]
  CLICK_Projects: {
    amplitude: 0,
    speed: 1.5,
    axis: "y",
    rock: {
      rockAngle: 0.1,
      bobAmount: 0,
      rockAxis: "x",
      rockWorldAxis: [-0.9397, -0.0000, +0.3420], // Blender X
    },
  },

  //   Blender X → rockWorldAxis: [-0.4540, +0.0000, +0.8910]
  //   Blender Y → rockWorldAxis: [-0.0000, +1.0000, -0.0000]  ← vertical (spins like a top), don't use
  //   Blender Z → rockWorldAxis: [-0.8910, -0.0000, -0.4540]
  CLICK_Experience: {
    amplitude: 0,
    speed: 1.5,
    axis: "y",
    rock: {
      rockAngle: 0.1,
      bobAmount: 0,
      rockAxis: "x",
      rockWorldAxis: [-0.8910, -0.0000, -0.4540], // Blender X
    },
  },

  //   Blender X → rockWorldAxis: [-0.9610, +0.0000, +0.2760]
  //   Blender Y → rockWorldAxis: [-0.0000, +1.0000, -0.0000]  ← vertical (spins like a top), don't use
  //   Blender Z → rockWorldAxis: [-0.2760, -0.0000, -0.9610]
  CLICK_Contact: {
    amplitude: 0,
    speed: 1.5,
    axis: "y",
    rock: {
      rockAngle: 0.1,
      bobAmount: 0,
      rockAxis: "x",
      rockWorldAxis: [-0.2760, -0.0000, -0.9610], // Blender X
    },
  },

  reeds: { amplitude: 0.4, speed: 2, axis: "x", originFixed: true },
  reeds001: { amplitude: 0.4, speed: 2, axis: "x", originFixed: true },
  reeds003: { amplitude: 0.4, speed: 2, axis: "x", originFixed: true },

  tentacle_one: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_one001: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_one002: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_one003: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_one004: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_one005: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_two: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_two001: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },

  vine: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine001: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine002: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine003: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine004: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine005: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine006: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine007: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine008: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine009: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine010: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine011: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine012: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine013: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine014: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine015: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine016: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine017: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine018: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine019: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine020: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine021: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
  vine022: {
    amplitude: 0,
    speed: 1.5,
    axis: "z",
    anchor: "ceiling",
    originFixed: true,
    swayAngle: 0.1,
  },
};

function whipWave(t: number): number {
  const TWO_PI = Math.PI * 2;
  const upFrac = 0.65; // Higher = slower whip rise.
  const decay = 6; // Higher = snappier bounce decay.
  const bounces = 1.25; // Higher = more bounce oscillations.

  const p = ((t % TWO_PI) + TWO_PI) % TWO_PI / TWO_PI;

  if (p < upFrac) {
    const u = p / upFrac;
    return u * u * u;
  } else {
    const u = (p - upFrac) / (1 - upFrac);
    return Math.exp(-decay * u) * Math.cos(u * Math.PI * 2 * bounces);
  }
}

function directionalRockWave(
  t: number,
  rock: NonNullable<PropConfig["rock"]>,
): number {
  const upSpeed = Math.max(0.001, rock.rockUpSpeed ?? 1);
  const downSpeed = Math.max(0.001, rock.rockDownSpeed ?? 1);
  const upDuration = 2 / upSpeed;
  const downDuration = 2 / downSpeed;
  const cycleDuration = upDuration + downDuration;
  const cycleT = ((t % cycleDuration) + cycleDuration) % cycleDuration;
  const smoothStep = (u: number) => u * u * (3 - 2 * u);

  if (cycleT < upDuration) {
    return -1 + smoothStep(cycleT / upDuration) * 2;
  }

  const downU = (cycleT - upDuration) / downDuration;
  const elasticity = rock.rockElasticity ?? 0;

  if (elasticity <= 0) {
    return 1 - smoothStep(downU) * 2;
  }

  const backAmount = 1.70158 * elasticity;
  const backEase =
    1 +
    (backAmount + 1) * (downU - 1) ** 3 +
    backAmount * (downU - 1) ** 2;

  return 1 - backEase * 2;
}

function rockWaveForTime(t: number, rock: NonNullable<PropConfig["rock"]>) {
  if (rock.rockUpSpeed !== undefined || rock.rockDownSpeed !== undefined) {
    return directionalRockWave(t, rock);
  }

  return rock.elastic ? whipWave(t) : Math.sin(t);
}

function rockAngleForWave(wave: number, rock: NonNullable<PropConfig["rock"]>) {
  const fallbackAngle = rock.rockAngle ?? 0;
  const range = wave >= 0
    ? rock.rockUpAngle ?? fallbackAngle
    : rock.rockDownAngle ?? fallbackAngle;

  return wave * range;
}

const _worldAxis = new THREE.Vector3();
const _deltaQ    = new THREE.Quaternion();
const _baseQ     = new THREE.Quaternion();


export default function AnimatedPropsSquash() {
  const get = useThree((s) => s.get);
  const objectsRef = useRef<AnimEntry[]>([]);


  useEffect(() => {
    const { scene } = get();
    const found: AnimEntry[] = [];

    const bboxReport: Record<
      string,
      {
        size: number[];
        tallAxis: string;
        configuredAxis: string;
        match: boolean;
        halfHeight: number;
        anchor: string;
        mode: string;
      }
    > = {};

    scene.traverse((child) => {
      const config = PROP_CONFIGS[child.name];
      if (!config) return;

      const anchor = config.anchor ?? "floor";
      let halfHeight = 0;

      const measureMesh = (node: THREE.Object3D) => {
        if (node instanceof THREE.Mesh) {
          if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
          const bb = node.geometry.boundingBox;
          if (bb) {
            const size = new THREE.Vector3();
            bb.getSize(size);

            const tallAxis =
              size.x > size.y && size.x > size.z
                ? "x"
                : size.z > size.y
                  ? "z"
                  : "y";

            const halfExtent =
              config.axis === "x"
                ? size.x / 2
                : config.axis === "z"
                  ? size.z / 2
                  : size.y / 2;

            halfHeight = halfExtent;

            const mode = config.rock
              ? config.rock.rockWorldAxis
                ? "rock-world-axis"
                : "rock"
              : config.lissajous
                ? "lissajous"
                : config.oscillateAngle
                  ? "oscillate"
                  : config.swayAngle
                    ? "sway"
                    : config.soarRadius
                      ? "soar"
                      : "stretch";

            bboxReport[child.name] = {
              size: size.toArray().map((v) => parseFloat(v.toFixed(3))),
              tallAxis,
              configuredAxis: config.axis,
              match: tallAxis === config.axis,
              halfHeight: parseFloat(halfExtent.toFixed(4)),
              anchor,
              mode,
            };
          }
        }
      };

      if (child instanceof THREE.Mesh) {
        measureMesh(child);
      } else {
        child.traverse(measureMesh);
      }

      found.push({
        obj: child,
        config,
        baseScale: child.scale.clone(),
        basePosition: child.position.clone(),
        baseRotation: child.rotation.clone(),
        baseQuaternion: child.quaternion.clone(),
        halfHeight,
        phase: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
      });
    });

    console.log(
      "[BBOX REPORT] mode = animation path taken | match:false = wrong axis config",
      bboxReport,
    );

    objectsRef.current = found;
  }, [get]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    for (const item of objectsRef.current) {
      const {
        obj,
        config,
        baseScale,
        basePosition,
        baseRotation,
        baseQuaternion,
        halfHeight,
        phase,
        phaseY,
      } = item;

      obj.position.copy(basePosition);
      obj.scale.copy(baseScale);
      obj.rotation.copy(baseRotation);

      const t = elapsed * config.speed + phase;

      // Blender axis-report vector + base quaternion prevents drift on rotated GLB meshes.
      if (config.rock?.rockWorldAxis) {
        const { bobAmount, rockWorldAxis } = config.rock;
        const wave = rockWaveForTime(t, config.rock);
        const angle = rockAngleForWave(wave, config.rock);

        _worldAxis.set(...rockWorldAxis).normalize();
        _deltaQ.setFromAxisAngle(_worldAxis, angle);
        _baseQ.copy(baseQuaternion);
        obj.quaternion.copy(_deltaQ.multiply(_baseQ));

        obj.position.setY(basePosition.y + Math.abs(wave) * bobAmount);
        continue;
      }

      if (config.rock) {
        const { bobAmount, rockAxis } = config.rock;
        const wave = rockWaveForTime(t, config.rock);
        const angle = rockAngleForWave(wave, config.rock);
        obj.rotation.set(
          rockAxis === "x" ? baseRotation.x + angle : baseRotation.x,
          rockAxis === "y" ? baseRotation.y + angle : baseRotation.y,
          rockAxis === "z" ? baseRotation.z + angle : baseRotation.z,
          baseRotation.order,
        );
        obj.position.setY(basePosition.y + Math.abs(wave) * bobAmount);
        continue;
      }

      if (config.lissajous) {
        const { xRadius, yRadius, freqX, freqY } = config.lissajous;
        obj.position.setX(
          basePosition.x +
            Math.sin(elapsed * config.speed * freqX + phase) * xRadius,
        );
        obj.position.setY(
          basePosition.y +
            Math.sin(elapsed * config.speed * freqY + phaseY) * yRadius,
        );
        continue;
      }

      if (config.soarRadius) {
        obj.position.setX(basePosition.x + Math.sin(t) * config.soarRadius);
        obj.position.setY(
          basePosition.y + Math.cos(t) * config.soarRadius * 0.4,
        );
        continue;
      }

      if (config.oscillateAngle) {
        obj.position.setX(
          basePosition.x + Math.sin(t) * config.oscillateAngle,
        );
        continue;
      }

      if (config.swayAngle) {
        const swayAxis = config.swayAxis ?? "x";
        const swayDelta = Math.sin(t) * config.swayAngle;
        obj.rotation.set(
          swayAxis === "x" ? baseRotation.x + swayDelta : baseRotation.x,
          baseRotation.y,
          swayAxis === "z" ? baseRotation.z + swayDelta : baseRotation.z,
          baseRotation.order,
        );
        continue;
      }

      const stretch = 1 + Math.sin(t) * config.amplitude;

      if (config.axis === "y") obj.scale.setY(baseScale.y * stretch);
      if (config.axis === "x") obj.scale.setX(baseScale.x * stretch);
      if (config.axis === "z") obj.scale.setZ(baseScale.z * stretch);

      if (!config.originFixed) {
        const offset = (stretch - 1) * halfHeight;
        const anchorDir = config.anchor ?? "floor";
        const sign = anchorDir === "ceiling" ? -1 : 1;

        if (config.axis === "y")
          obj.position.setY(basePosition.y + sign * offset);
        if (config.axis === "x")
          obj.position.setX(basePosition.x + sign * offset);
        if (config.axis === "z")
          obj.position.setZ(basePosition.z + sign * offset);
      }
    }
  });

  return null;
}
