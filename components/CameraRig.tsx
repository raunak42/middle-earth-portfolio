"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// CAMERA
// ─────────────────────────────────────────────────────────────

const BASE_RADIUS = 6.42;
const BASE_HEIGHT = 4.21;

const INITIAL_ANGLE = Math.atan2(-5.005, 4.025);

const SCROLL_SPEED = 0.0008;
const CAMERA_SMOOTHING = 0.06;

// Roller coaster parameters
const RADIUS_AMPLITUDE = 2;
const RADIUS_FREQUENCY = 1.5;

const HEIGHT_AMPLITUDE = 1.5;
const HEIGHT_FREQUENCY = 2.3;

const HEIGHT_OFFSET = 2.5;

// ─────────────────────────────────────────────────────────────
// MOUSE FOLLOW — INERTIA TUNING
// ─────────────────────────────────────────────────────────────

const MOUSE_SENSITIVITY = 1;
const MOUSE_SMOOTHING = 0.03;

// ─────────────────────────────────────────────────────────────
// PATH
// ─────────────────────────────────────────────────────────────

const START_X = 6.5;
const START_Z = -7.5;

const CHAR_RADIUS = Math.sqrt(START_X ** 2 + START_Z ** 2);
const CHARACTER_START_ANGLE = Math.atan2(START_Z, START_X);

const CHAR_Y = 3.5;

// ─────────────────────────────────────────────────────────────
// SWAP ANIMATION (Frodo)
// ─────────────────────────────────────────────────────────────

const WALK_Y_MOVING = CHAR_Y + 0.5;
const WALK_Y_STOPPED = CHAR_Y - 1.8;
const IDLE_Y_MOVING = CHAR_Y - 2;
const IDLE_Y_STOPPED = CHAR_Y + 0.7;

const SWAP_SMOOTHING = 0.12;

// ─────────────────────────────────────────────────────────────
// IDLE FLOATING
// ─────────────────────────────────────────────────────────────

const FLOAT_AMPLITUDE = 0.15;
const FLOAT_SPEED = 1.5;

// ─────────────────────────────────────────────────────────────
// WALK ANIMATION (Frodo)
// ─────────────────────────────────────────────────────────────

const WALK_CYCLE_SPEED = 60;
const SPEED_SMOOTHING = 0.08;

const LEFT_HAND_SWING_RANGE = 1.1;
const RIGHT_HAND_SWING_RANGE = 1.1;
const LEFT_LEG_SWING_RANGE = 1.1;
const RIGHT_LEG_SWING_RANGE = 1.1;

const LEFT_HAND_OFFSET = 0.0;
const RIGHT_HAND_OFFSET = -1;
const LEFT_LEG_OFFSET = 0.5;
const RIGHT_LEG_OFFSET = 0.5;

// ─────────────────────────────────────────────────────────────
// GOLLUM
// ─────────────────────────────────────────────────────────────

// Angular distance behind Frodo on the shared circle path.
// Positive = trails behind in the direction of travel.
const GOLLUM_FOLLOW_OFFSET = 0.55;

// Gollum sits a little lower than Frodo (crouched posture).
const GOLLUM_Y = CHAR_Y +0.5;

// Slightly faster cadence than Frodo — scurrying, nervous energy.
const GOLLUM_WALK_CYCLE_SPEED = 80;

const GOLLUM_LEFT_ARM_SWING  = 0.7;
const GOLLUM_RIGHT_ARM_SWING = 0.7;
const GOLLUM_LEFT_LEG_SWING  = 0.7;
const GOLLUM_RIGHT_LEG_SWING = 0.7;

// ─────────────────────────────────────────────────────────────
// AXIS
// ─────────────────────────────────────────────────────────────

const LOCAL_Y = new THREE.Vector3(0, 1, 0);

// ─────────────────────────────────────────────────────────────
// BONE LISTS
// ─────────────────────────────────────────────────────────────

const FRODO_BONE_NAMES = [
  "frodo_left_hand",
  "frodo_right_hand",
  "frodo_leg",
  "frodo_leg001",
];

const GOLLUM_BONE_NAMES = [
  "gollum_left_arm",
  "gollum_right_arm",
  "gollum_leg",
  // Three/GLTFLoader normalizes Blender's "gollum_leg.001" to "gollum_leg001".
  "gollum_leg001",
];

const ALL_BONE_NAMES = [...FRODO_BONE_NAMES, ...GOLLUM_BONE_NAMES];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function CameraRig() {
  const get = useThree((s) => s.get);

  const currentAngle = useRef(INITIAL_ANGLE);
  const targetAngle  = useRef(INITIAL_ANGLE);

  const walkTime       = useRef(0);
  const gollumWalkTime = useRef(0);
  const floatTime      = useRef(0);

  const walkY = useRef(WALK_Y_STOPPED);
  const idleY = useRef(IDLE_Y_STOPPED);

  const restPose = useRef<Record<string, THREE.Quaternion>>({});
  const gollumBaseRotation = useRef<THREE.Euler | null>(null);

  // Mouse state
  const mouseX       = useRef(0);
  const mouseY       = useRef(0);
  const smoothMouseX = useRef(0);
  const smoothMouseY = useRef(0);

  // Shared smoothed speed — both characters react to the same scroll input.
  const smoothedSpeed = useRef(0);

  // ─────────────────────────────────────────────
  // REST POSE CAPTURE — Frodo + Gollum
  // ─────────────────────────────────────────────

  useEffect(() => {
    const tryCapture = () => {
      const { scene } = get();
      let ok = true;
      for (const name of ALL_BONE_NAMES) {
        if (restPose.current[name]) continue;
        const obj = scene.getObjectByName(name);
        if (!obj) { ok = false; continue; }
        restPose.current[name] = obj.quaternion.clone();
      }
      return ok;
    };
    if (!tryCapture()) {
      const id = setInterval(() => { if (tryCapture()) clearInterval(id); }, 100);
      return () => clearInterval(id);
    }
  }, [get]);

  // ─────────────────────────────────────────────
  // SCROLL
  // ─────────────────────────────────────────────

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetAngle.current -= e.deltaY * SCROLL_SPEED;
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // ─────────────────────────────────────────────
  // MOUSE LISTENER
  // ─────────────────────────────────────────────

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseX.current = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // ─────────────────────────────────────────────
  // FRAME LOOP
  // ─────────────────────────────────────────────

  useFrame((_state, delta) => {
    const { camera, scene } = get();

    // ─────────────────────────────────────────────
    // CAMERA (ROLLER COASTER STYLE)
    // ─────────────────────────────────────────────

    currentAngle.current +=
      (targetAngle.current - currentAngle.current) * CAMERA_SMOOTHING;

    const radiusWave   = Math.sin(currentAngle.current * RADIUS_FREQUENCY);
    const dynamicRadius = BASE_RADIUS + radiusWave * RADIUS_AMPLITUDE;

    const heightWave1  = Math.sin(currentAngle.current * HEIGHT_FREQUENCY);
    const heightWave2  = Math.cos(currentAngle.current * HEIGHT_FREQUENCY * HEIGHT_OFFSET);
    const dynamicHeight =
      BASE_HEIGHT +
      heightWave1 * HEIGHT_AMPLITUDE +
      heightWave2 * (HEIGHT_AMPLITUDE * 0.3);

    const basePos = new THREE.Vector3(
      Math.sin(currentAngle.current) * dynamicRadius,
      dynamicHeight,
      Math.cos(currentAngle.current) * dynamicRadius,
    );

    // ─────────────────────────────────────────────
    // MOUSE OFFSET (INERTIAL LAG)
    // ─────────────────────────────────────────────

    smoothMouseX.current += (mouseX.current - smoothMouseX.current) * MOUSE_SMOOTHING;
    smoothMouseY.current += (mouseY.current - smoothMouseY.current) * MOUSE_SMOOTHING;

    const target   = new THREE.Vector3(0, 3, 0);
    const forward  = new THREE.Vector3().subVectors(target, basePos).normalize();
    const up       = new THREE.Vector3(0, 1, 0);
    const right    = new THREE.Vector3().crossVectors(forward, up).normalize();
    const cameraUp = new THREE.Vector3().crossVectors(right, forward).normalize();

    const offset = new THREE.Vector3()
      .addScaledVector(right,    -smoothMouseX.current * MOUSE_SENSITIVITY)
      .addScaledVector(cameraUp, -smoothMouseY.current * MOUSE_SENSITIVITY);

    camera.position.copy(basePos).add(offset);
    camera.lookAt(target);

    // ─────────────────────────────────────────────
    // FRODO ROOTS
    // ─────────────────────────────────────────────

    const walkRoot = scene.getObjectByName("character_walk_root");
    const idleRoot = scene.getObjectByName("character_idle_root");

    if (!walkRoot || !idleRoot) return;

    const charAngle =
      CHARACTER_START_ANGLE - (currentAngle.current - INITIAL_ANGLE);

    const x = Math.cos(charAngle) * CHAR_RADIUS;
    const z = Math.sin(charAngle) * CHAR_RADIUS;

    // ─────────────────────────────────────────────
    // MOVEMENT SPEED
    // ─────────────────────────────────────────────

    const movementSpeed = Math.abs(targetAngle.current - currentAngle.current);
    const isMoving      = movementSpeed > 0.00001;

    // ─────────────────────────────────────────────
    // ANIMATED Y POSITIONS (Frodo swap)
    // ─────────────────────────────────────────────

    const targetWalkY = isMoving ? WALK_Y_MOVING : WALK_Y_STOPPED;
    const targetIdleY = isMoving ? IDLE_Y_MOVING : IDLE_Y_STOPPED;

    walkY.current += (targetWalkY - walkY.current) * SWAP_SMOOTHING;
    idleY.current += (targetIdleY - idleY.current) * SWAP_SMOOTHING;

    // ─────────────────────────────────────────────
    // IDLE FLOATING
    // ─────────────────────────────────────────────

    floatTime.current += delta * FLOAT_SPEED;
    const floatOffset = Math.sin(floatTime.current) * FLOAT_AMPLITUDE;

    walkRoot.position.set(x, walkY.current, z);
    idleRoot.position.set(x, idleY.current + floatOffset, z);

    const rotationY = -charAngle + Math.PI * 0.5;

    walkRoot.rotation.y = rotationY;

    idleRoot.rotation.set(1.5, 0, 3);
    idleRoot.rotateOnWorldAxis(LOCAL_Y, rotationY);

    // ─────────────────────────────────────────────
    // SHARED SMOOTHED SPEED
    // ─────────────────────────────────────────────

    if (isMoving) {
      smoothedSpeed.current +=
        (movementSpeed - smoothedSpeed.current) * SPEED_SMOOTHING;
    } else {
      smoothedSpeed.current = 0;
    }

    // ─────────────────────────────────────────────
    // SWING HELPER
    // ─────────────────────────────────────────────

    const applySwing = (name: string, amount: number) => {
      const obj  = scene.getObjectByName(name);
      const rest = restPose.current[name];
      if (!obj || !rest) return;
      obj.quaternion.copy(rest);
      const q = new THREE.Quaternion().setFromAxisAngle(LOCAL_Y, amount);
      obj.quaternion.multiply(q);
    };

    // ─────────────────────────────────────────────
    // FRODO WALK ANIMATION
    // ─────────────────────────────────────────────

    if (smoothedSpeed.current > 0.00001) {
      walkTime.current += delta * smoothedSpeed.current * WALK_CYCLE_SPEED;

      const base = Math.sin(walkTime.current);

      applySwing("frodo_left_hand",  LEFT_HAND_OFFSET  + base *  LEFT_HAND_SWING_RANGE);
      applySwing("frodo_right_hand", -(RIGHT_HAND_OFFSET + base * RIGHT_HAND_SWING_RANGE));
      applySwing("frodo_leg",        -(LEFT_LEG_OFFSET  + base *  LEFT_LEG_SWING_RANGE));
      applySwing("frodo_leg001",     RIGHT_LEG_OFFSET  + base *  RIGHT_LEG_SWING_RANGE);
    } else {
      for (const name of FRODO_BONE_NAMES) {
        const obj  = scene.getObjectByName(name);
        const rest = restPose.current[name];
        if (obj && rest) obj.quaternion.slerp(rest, 0.1);
      }
    }

    // ─────────────────────────────────────────────
    // GOLLUM POSITION
    // ─────────────────────────────────────────────

    const gollumRoot = scene.getObjectByName("gollum_body");
    if (!gollumRoot) return;

    // Trail behind Frodo by a fixed angular offset on the same circle.
    const gollumAngle = charAngle - GOLLUM_FOLLOW_OFFSET;
    const gx = Math.cos(gollumAngle) * CHAR_RADIUS;
    const gz = Math.sin(gollumAngle) * CHAR_RADIUS;

    if (!gollumBaseRotation.current) {
      gollumBaseRotation.current = gollumRoot.rotation.clone();
    }

    gollumRoot.position.set(gx, GOLLUM_Y, gz);

    // Same fix used for Frodo's angled idle root:
    // reset to the exported/base rotation first, then rotate around WORLD Y.
    // Directly assigning rotation.y makes Gollum spin around his tilted local axis.
    gollumRoot.rotation.copy(gollumBaseRotation.current);
    gollumRoot.rotateOnWorldAxis(LOCAL_Y, -gollumAngle + Math.PI * 0.5);

    // ─────────────────────────────────────────────
    // GOLLUM WALK ANIMATION
    // ─────────────────────────────────────────────

    if (smoothedSpeed.current > 0.00001) {
      gollumWalkTime.current +=
        delta * smoothedSpeed.current * GOLLUM_WALK_CYCLE_SPEED;

      const base = Math.sin(gollumWalkTime.current);

      applySwing("gollum_left_arm",  base  *  GOLLUM_LEFT_ARM_SWING);
      applySwing("gollum_right_arm", -base *  GOLLUM_RIGHT_ARM_SWING);
      applySwing("gollum_leg",       -base *  GOLLUM_LEFT_LEG_SWING);
      applySwing("gollum_leg001",     base *  GOLLUM_RIGHT_LEG_SWING);
    } else {
      for (const name of GOLLUM_BONE_NAMES) {
        const obj  = scene.getObjectByName(name);
        const rest = restPose.current[name];
        if (obj && rest) obj.quaternion.slerp(rest, 0.1);
      }
    }
  });

  return null;
}