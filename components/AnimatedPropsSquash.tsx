"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface PropConfig {
  amplitude: number;
  speed: number;
  axis: "x" | "y" | "z";
  anchor?: "floor" | "ceiling";
  originFixed?: boolean;
  swayAngle?: number;
  /**
   * Which local axis to rotate around for the swayAngle pendulum.
   * Defaults to "x" (current vine behaviour) if omitted.
   * If the swing looks wrong after moving the pivot, run the axis-report
   * script on the object and try "z" instead.
   */
  swayAxis?: "x" | "z";
  oscillateAngle?: number;
  soarRadius?: number;
  /**
   * Lissajous sky wander — X/Y only, zero Z movement.
   * The bird traces a slow never-repeating path across the sky plane.
   * xRadius / yRadius: max displacement in scene units.
   * freqX / freqY:     independent oscillation frequencies (irrational ratio
   *                    = path never exactly repeats).
   * All birds also get a random phase offset so they never start in sync.
   */
  lissajous?: {
    xRadius: number;
    yRadius: number;
    freqX: number;
    freqY: number;
  };
  /**
   * Rocking boat — combines a rotation (side-to-side) with an optional Y bob.
   *
   * rockAxis:      named local axis fallback ("x" | "y" | "z").
   * rockWorldAxis: optional world-space unit vector [x, y, z] to rotate around.
   *                When present, this takes priority over rockAxis.
   *                Use the vector output from the Blender axis-report script
   *                for objects whose local axes don't align with Three.js axes.
   *
   * rockAngle:  max rotation in radians.
   * bobAmount:  max Y displacement in scene units (0 = no bob).
   */
  rock?: {
    rockAngle: number;
    bobAmount: number;
    rockAxis: "x" | "y" | "z";
    /**
     * World-space unit vector to rotate around.
     * Derived from Blender's axis-report script output.
     * When set, rockAxis is ignored for the rotation itself.
     */
    rockWorldAxis?: [number, number, number];
    /**
     * Elastic/snappy waveform instead of smooth sine.
     * Slow ease-in on the upswing, fast exponential snap back
     * with a small overshoot bounce — like a whip or a spring release.
     */
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
  /** Second random phase, used as the Y-channel offset in lissajous. */
  phaseY: number;
};

// ─────────────────────────────────────────────
// PROP CONFIGS
// ─────────────────────────────────────────────

const PROP_CONFIGS: Record<string, PropConfig> = {
  // ── SHIRE BIRD — full mesh, left-right position sway ─────────────────
  Shire_bird: {
    amplitude: 0,
    speed: 3,
    axis: "y",
    rock: { rockAngle: 0.25, bobAmount: 0, rockAxis: "z" },
  },

  // ── ARGONATH BIRDS — V-shaped cutouts, Lissajous sky wander ──────────
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

  // ── FLOWERS ───────────────────────────────────────────────────────────
  Shire_flower_red: { amplitude: 0.08, speed: 3.0, axis: "y" },
  Shire_flower_red001: { amplitude: 0.08, speed: 3.0, axis: "y" },
  Shire_flower_white: { amplitude: 0.08, speed: 3.0, axis: "y" },
  Shire_flower_white001: { amplitude: 0.08, speed: 3.0, axis: "y" },
  Shire_flower_yellow: { amplitude: 0.08, speed: 3.0, axis: "y" },

  // ── MUSHROOMS — sway like reeds/tentacles, originFixed: true ────────
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

  // ── SMOKE ─────────────────────────────────────────────────────────────
  Shire_smoke: { amplitude: 0.05, speed: 5, axis: "y" },

  // ── BOATS ─────────────────────────────────────────────────────────────
  boat: {
    amplitude: 0,
    speed: 3,
    axis: "y",
    rock: { rockAngle: 0.05, bobAmount: 0, rockAxis: "y" },
  },

  // ── RIGHT HAND ────────────────────────────────────────────────────────
  // All three Blender axes are fractional in Three.js space (unapplied
  // rotations in Blender), so we use rockWorldAxis with the exact vector
  // from the axis-report script. Pick the one that looks right and swap.
  //
  //   Blender X → rockWorldAxis: [-0.5385, -0.4009,  0.7412]
  //   Blender Y → rockWorldAxis: [-0.2356,  0.9161,  0.3243]
  //   Blender Z → rockWorldAxis: [-0.8090, -0.0000, -0.5878]
  //
  right_hand: {
    amplitude: 0,
    speed: 3,
    axis: "y",
    rock: {
      rockAngle: 1,
      bobAmount: 0,
      rockAxis: "y",                             // fallback, unused when rockWorldAxis is set
      rockWorldAxis: [-0.8090, -0.0000, -0.5878], // ← Blender Z (swap to X or Y above to test)
      elastic: true,   // slow whip-up, fast snappy return with bounce
    },
  },

  boat001: { amplitude: 0.03, speed: 0.6, axis: "y" },

  // ── NAV SIGNS — ceiling-hung pendulum swing ───────────────────────────
  // Pivot moved to top edge in Blender (pivot_report script).
  // All four signs are rotated differently in the scene so every axis is
  // fractional in Three.js — rockWorldAxis required for each.
  //
  // Swing axis = Blender local X for all (horizontal, perpendicular to the
  // sign face). Blender Y maps to pure Three.js +Y (vertical = spinning
  // like a top), so that's intentionally skipped.
  //
  // Speeds staggered so signs drift out of phase over time.
  // Tune rockAngle (radians) for more/less swing — 0.12 ≈ 7°.
  //
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

  // ── REEDS — origin fixed ──────────────────────────────────────────────
  reeds: { amplitude: 0.4, speed: 2, axis: "x", originFixed: true },
  reeds001: { amplitude: 0.4, speed: 2, axis: "x", originFixed: true },
  reeds003: { amplitude: 0.4, speed: 2, axis: "x", originFixed: true },

  // ── TENTACLES — origin fixed ──────────────────────────────────────────
  tentacle_one: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_one001: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_one002: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_one003: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_one004: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_one005: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_two: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },
  tentacle_two001: { amplitude: 0.15, speed: 3, axis: "z", originFixed: true },

  // ── VINES — ceiling anchored, origin fixed, gentle sway ───────────────
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

// ─────────────────────────────────────────────
// ELASTIC WAVEFORM
// ─────────────────────────────────────────────
//
// Replaces Math.sin(t) for the "elastic" rock mode.
// Returns a value in roughly [-0.15, 1] per cycle:
//
//   0 → upFrac  : cubic ease-in  (slow deliberate upswing, 0 → 1)
//   upFrac → 1  : exp-decay cosine (fast snap back with one small overshoot)
//
// Tuning knobs (all 0-1 normalised to the cycle):
//   upFrac   — fraction of the cycle spent rising        (0.65 = 65%)
//   decay    — how quickly the bounce dies               (higher = snappier)
//   bounces  — how many oscillations in the snap-back    (1.25 = one bounce + tail)
//   overshoot— peak negative excursion past zero         (0.15 = 15% of rockAngle)
//
function whipWave(t: number): number {
  const TWO_PI  = Math.PI * 2;
  const upFrac  = 0.65;   // slow rise occupies 65% of each cycle
  const decay   = 6;      // exponential decay rate of the snap-back bounce
  const bounces = 1.25;   // oscillation count in the snap-back phase

  // Normalise t to [0, 1) within one cycle
  const p = ((t % TWO_PI) + TWO_PI) % TWO_PI / TWO_PI;

  if (p < upFrac) {
    // ── Slow ease-in rise (0 → 1) ───────────────────────────────────
    const u = p / upFrac;           // 0..1
    return u * u * u;               // cubic ease-in: starts very slow, accelerates
  } else {
    // ── Fast elastic snap back (1 → 0 with overshoot) ───────────────
    const u = (p - upFrac) / (1 - upFrac);  // 0..1 through the snap-back window
    // exp decay kills the oscillation quickly; cos provides the bounce
    return Math.exp(-decay * u) * Math.cos(u * Math.PI * 2 * bounces);
    // at u=0 → exp(0)*cos(0) = 1          (peak, no gap with the rise phase)
    // at u=0.4 → small negative blip      (the satisfying overshoot)
    // at u≥0.7 → near zero               (settled)
  }
}

// ─────────────────────────────────────────────
// REUSABLE SCRATCH OBJECTS
// Allocated once outside the render loop to avoid per-frame GC pressure.
// ─────────────────────────────────────────────

const _worldAxis = new THREE.Vector3();
const _deltaQ    = new THREE.Quaternion();
const _baseQ     = new THREE.Quaternion();

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function AnimatedPropsSquash() {
  const get = useThree((s) => s.get);
  const objectsRef = useRef<AnimEntry[]>([]);

  // ─────────────────────────────────────────────
  // SETUP
  // ─────────────────────────────────────────────

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
        // Store the base quaternion so world-axis rock never drifts
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

  // ─────────────────────────────────────────────
  // ANIMATION
  // ─────────────────────────────────────────────
  //
  // Modes checked in order:
  //
  // 0a. rock (world-axis) — quaternion rotation around an arbitrary world-space
  //     unit vector. Used when a mesh has unapplied Blender rotations whose
  //     local axes don't align with Three.js X/Y/Z.
  //     The Blender axis-report script provides the exact vector.
  //     Rotation is applied as:  Q_final = Q_delta * Q_base
  //     so that the base orientation is always the pivot — no drift.
  //
  // 0b. rock (named axis) — simple Euler rotation on a local axis.
  //     Kept for objects whose axes are clean after GLTF export.
  //
  // 1.  lissajous — X/Y position wander, Z locked. V-birds.
  // 2.  soar      — legacy elliptical. Kept for future use.
  // 3.  oscillate — pure X sway. Shire bird.
  // 4.  sway      — pure X rotation. Vines.
  // 5.  stretch   — scale on tall axis with pivot compensation.
  //
  // ─────────────────────────────────────────────

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

      // Reset to base each frame — never accumulate drift
      obj.position.copy(basePosition);
      obj.scale.copy(baseScale);
      obj.rotation.copy(baseRotation);

      const t = elapsed * config.speed + phase;

      // ── Mode 0a: Rock — world-space axis (fractional Blender axes) ───
      // Uses a quaternion derived from the exact world vector the Blender
      // axis-report script outputs. Premultiplied onto the base quaternion
      // so the pivot is always the rest pose, not accumulated Euler angles.
      if (config.rock?.rockWorldAxis) {
        const { rockAngle, bobAmount, rockWorldAxis, elastic } = config.rock;
        const wave  = elastic ? whipWave(t) : Math.sin(t);
        const angle = wave * rockAngle;

        _worldAxis.set(...rockWorldAxis).normalize();
        _deltaQ.setFromAxisAngle(_worldAxis, angle);
        _baseQ.copy(baseQuaternion);
        obj.quaternion.copy(_deltaQ.multiply(_baseQ));

        obj.position.y = basePosition.y + Math.abs(wave) * bobAmount;
        continue;
      }

      // ── Mode 0b: Rock — named local axis ────────────────────────────
      if (config.rock) {
        const { rockAngle, bobAmount, rockAxis, elastic } = config.rock;
        const wave  = elastic ? whipWave(t) : Math.sin(t);
        const angle = wave * rockAngle;
        if (rockAxis === "x") obj.rotation.x = baseRotation.x + angle;
        if (rockAxis === "y") obj.rotation.y = baseRotation.y + angle;
        if (rockAxis === "z") obj.rotation.z = baseRotation.z + angle;
        obj.position.y = basePosition.y + Math.abs(wave) * bobAmount;
        continue;
      }

      // ── Mode 1: Lissajous sky wander (Argonath V-birds) ──────────────
      if (config.lissajous) {
        const { xRadius, yRadius, freqX, freqY } = config.lissajous;
        obj.position.x =
          basePosition.x +
          Math.sin(elapsed * config.speed * freqX + phase) * xRadius;
        obj.position.y =
          basePosition.y +
          Math.sin(elapsed * config.speed * freqY + phaseY) * yRadius;
        continue;
      }

      // ── Mode 2: Soar — legacy elliptical ─────────────────────────────
      if (config.soarRadius) {
        obj.position.x = basePosition.x + Math.sin(t) * config.soarRadius;
        obj.position.y = basePosition.y + Math.cos(t) * config.soarRadius * 0.4;
        continue;
      }

      // ── Mode 3: Oscillate (Shire bird) ───────────────────────────────
      if (config.oscillateAngle) {
        obj.position.x = basePosition.x + Math.sin(t) * config.oscillateAngle;
        continue;
      }

      // ── Mode 4: Sway / pendulum (vines, hanging signs) ──────────────
      // swayAxis defaults to "x" so existing vine configs need no change.
      if (config.swayAngle) {
        const swayAxis = config.swayAxis ?? "x";
        const swayDelta = Math.sin(t) * config.swayAngle;
        if (swayAxis === "x") obj.rotation.x = baseRotation.x + swayDelta;
        if (swayAxis === "z") obj.rotation.z = baseRotation.z + swayDelta;
        continue;
      }

      // ── Mode 5: Stretch / squash on tall axis ─────────────────────────
      const stretch = 1 + Math.sin(t) * config.amplitude;

      if (config.axis === "y") obj.scale.y = baseScale.y * stretch;
      if (config.axis === "x") obj.scale.x = baseScale.x * stretch;
      if (config.axis === "z") obj.scale.z = baseScale.z * stretch;

      if (!config.originFixed) {
        const offset = (stretch - 1) * halfHeight;
        const anchorDir = config.anchor ?? "floor";
        const sign = anchorDir === "ceiling" ? -1 : 1;

        if (config.axis === "y")
          obj.position.y = basePosition.y + sign * offset;
        if (config.axis === "x")
          obj.position.x = basePosition.x + sign * offset;
        if (config.axis === "z")
          obj.position.z = basePosition.z + sign * offset;
      }
    }
  });

  return null;
}