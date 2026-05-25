"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const RADIUS           = 6.42;
const HEIGHT           = 2.61;
const INITIAL_ANGLE    = Math.atan2(-5.005, 4.025);
const SCROLL_SPEED     = 0.0008;
const CAMERA_SMOOTHING = 0.06;
const START_X          = 6.5;
const START_Z          = -7.5;
const CHAR_RADIUS      = Math.sqrt(START_X ** 2 + START_Z ** 2);
const CHARACTER_START_ANGLE = Math.atan2(START_Z, START_X);
const CHAR_Y           = 3.5;

const BONE_NAMES = [
  "frodo_left_hand",
  "frodo_right_hand",
  "frodo_leg",
  "frodo_leg001",
] as const;
type BoneName = (typeof BONE_NAMES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// DEBUG MODE
//
// Set DEBUG = true to:
//   1. Attach AxesHelper to each bone so you can SEE the local X/Y/Z axes.
//      Red = local X, Green = local Y, Blue = local Z.
//
//   2. Use keyboard keys 1–6 to test each axis live while scrolling:
//        1 = local  X  (1, 0, 0)
//        2 = local -X  (-1, 0, 0)
//        3 = local  Y  (0, 1, 0)   ← Three.js Y
//        4 = local -Y  (0,-1, 0)
//        5 = local  Z  (0, 0, 1)
//        6 = local -Z  (0, 0,-1)
//
//   3. The chosen axis is printed to console so you can copy it into
//      SWING_AXIS below once you find the right one.
//
// Once you've found the right axis, set DEBUG = false and fill in SWING_AXIS.
// ─────────────────────────────────────────────────────────────────────────────

const DEBUG = true; // ← flip to false for production

// Fill this in once you've confirmed the right axis from debug mode.
// Example: new THREE.Vector3(0, 0, -1)
const SWING_AXIS = new THREE.Vector3(0, 0, -1);

// ─────────────────────────────────────────────────────────────────────────────
// ALL 6 CANDIDATE AXES
// ─────────────────────────────────────────────────────────────────────────────

const CANDIDATE_AXES: THREE.Vector3[] = [
  new THREE.Vector3( 1,  0,  0), // key 1
  new THREE.Vector3(-1,  0,  0), // key 2
  new THREE.Vector3( 0,  1,  0), // key 3
  new THREE.Vector3( 0, -1,  0), // key 4
  new THREE.Vector3( 0,  0,  1), // key 5
  new THREE.Vector3( 0,  0, -1), // key 6
];
const AXIS_LABELS = [" X", "-X", " Y", "-Y", " Z", "-Z"];

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE OBJECTS (never allocate inside useFrame)
// ─────────────────────────────────────────────────────────────────────────────

const _swingQuat = new THREE.Quaternion();

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function CameraRig() {
  const get = useThree((state) => state.get);

  const currentAngle  = useRef(INITIAL_ANGLE);
  const targetAngle   = useRef(INITIAL_ANGLE);
  const walkTime      = useRef(0);
  const restPose      = useRef<Partial<Record<BoneName, THREE.Quaternion>>>({});

  // Which candidate axis is currently active in debug mode (default: axis 5 = local -Z)
  const debugAxisIndex = useRef(5);

  // ── Capture rest-pose quaternions ─────────────────────────────────────────

  useEffect(() => {
    const tryCapture = () => {
      const { scene } = get();
      let allFound = true;

      for (const name of BONE_NAMES) {
        if (restPose.current[name]) continue;
        const obj = scene.getObjectByName(name);
        if (!obj) { allFound = false; continue; }
        restPose.current[name] = obj.quaternion.clone();
      }
      return allFound;
    };

    if (!tryCapture()) {
      const id = setInterval(() => { if (tryCapture()) clearInterval(id); }, 100);
      return () => clearInterval(id);
    }
  }, [get]);

  // ── Attach AxesHelper to bones (debug only) ────────────────────────────────

  useEffect(() => {
    if (!DEBUG) return;

    const { scene } = get();
    const helpers: THREE.AxesHelper[] = [];

    const attach = () => {
      for (const name of BONE_NAMES) {
        const obj = scene.getObjectByName(name);
        if (!obj) continue;
        // Only add if not already attached
        if (obj.getObjectByName(`__axesHelper_${name}`)) continue;

        // Size 1 unit — you'll see three coloured arrows:
        //   Red   = local X
        //   Green = local Y  (this is what we're looking for matching Blender's Y)
        //   Blue  = local Z
        const helper = new THREE.AxesHelper(1);
        helper.name = `__axesHelper_${name}`;
        obj.add(helper);
        helpers.push(helper);
        console.log(`[DEBUG] AxesHelper attached to "${name}"`);
      }
      return helpers.length === BONE_NAMES.length;
    };

    if (!attach()) {
      const id = setInterval(() => { if (attach()) clearInterval(id); }, 100);
      return () => {
        clearInterval(id);
        helpers.forEach((h) => h.parent?.remove(h));
      };
    }

    return () => helpers.forEach((h) => h.parent?.remove(h));
  }, [get]);

  // ── Keyboard axis switcher (debug only) ───────────────────────────────────

  useEffect(() => {
    if (!DEBUG) return;

    const onKey = (e: KeyboardEvent) => {
      const idx = parseInt(e.key) - 1; // keys 1–6 → index 0–5
      if (idx >= 0 && idx < CANDIDATE_AXES.length) {
        debugAxisIndex.current = idx;
        console.log(
          `[DEBUG] Swing axis → key ${e.key} = local ${AXIS_LABELS[idx]}`,
          `(${CANDIDATE_AXES[idx].x}, ${CANDIDATE_AXES[idx].y}, ${CANDIDATE_AXES[idx].z})`,
          "\nCopy this into SWING_AXIS once it looks right:",
          `new THREE.Vector3(${CANDIDATE_AXES[idx].x}, ${CANDIDATE_AXES[idx].y}, ${CANDIDATE_AXES[idx].z})`
        );
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Scroll ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetAngle.current -= e.deltaY * SCROLL_SPEED;
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // ── Frame loop ─────────────────────────────────────────────────────────────

  useFrame((_state, delta) => {
    const { camera, scene } = get();

    // Camera
    currentAngle.current +=
      (targetAngle.current - currentAngle.current) * CAMERA_SMOOTHING;

    camera.position.set(
      Math.sin(currentAngle.current) * RADIUS,
      HEIGHT,
      Math.cos(currentAngle.current) * RADIUS,
    );
    camera.lookAt(0, 2, 0);

    // Character
    const character = scene.getObjectByName("character_walk_root");
    if (!character) return;

    const charAngle =
      CHARACTER_START_ANGLE - (currentAngle.current - INITIAL_ANGLE);

    character.position.set(
      Math.cos(charAngle) * CHAR_RADIUS,
      CHAR_Y,
      Math.sin(charAngle) * CHAR_RADIUS,
    );
    character.rotation.y = -charAngle + Math.PI * 0.5;

    // Movement speed
    const movementSpeed = Math.abs(targetAngle.current - currentAngle.current);

    // Pick axis: live key-switch in debug, hardcoded in production
    const axis = DEBUG ? CANDIDATE_AXES[debugAxisIndex.current] : SWING_AXIS;

    // Apply swing
    const applySwing = (name: BoneName, amount: number) => {
      const obj  = scene.getObjectByName(name);
      const rest = restPose.current[name];
      if (!obj || !rest) return;

      obj.quaternion.copy(rest);
      _swingQuat.setFromAxisAngle(axis, amount);
      obj.quaternion.multiply(_swingQuat); // multiply = local space
    };

    if (movementSpeed > 0.00001) {
      walkTime.current += delta * movementSpeed * 30;
      const swing =
        Math.sin(walkTime.current) *
        Math.min(movementSpeed * 120, 0.6);

      applySwing("frodo_left_hand",   swing);
      applySwing("frodo_right_hand", -swing);
      applySwing("frodo_leg",        -swing);
      applySwing("frodo_leg001",      swing);
    } else {
      for (const name of BONE_NAMES) {
        const obj  = scene.getObjectByName(name);
        const rest = restPose.current[name];
        if (obj && rest) obj.quaternion.slerp(rest, 0.1);
      }
    }
  });

  return null;
}