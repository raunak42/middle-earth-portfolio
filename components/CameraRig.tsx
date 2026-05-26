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
// SWAP ANIMATION
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
// WALK ANIMATION
// ─────────────────────────────────────────────────────────────

// Multiplier applied to smoothed movement speed to set cycle tempo.
// Higher = faster leg swing per unit of scroll speed.
const WALK_CYCLE_SPEED = 60;

// How quickly the smoothed speed catches up to actual movement speed.
// Lower = more inertia / smoother, higher = more responsive.
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
// AXIS
// ─────────────────────────────────────────────────────────────

const LOCAL_Y = new THREE.Vector3(0, 1, 0);

// ─────────────────────────────────────────────────────────────
// BONE LIST
// ─────────────────────────────────────────────────────────────

const BONE_NAMES = [
  "frodo_left_hand",
  "frodo_right_hand",
  "frodo_leg",
  "frodo_leg001",
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function CameraRig() {
  const get = useThree((s) => s.get);

  const currentAngle = useRef(INITIAL_ANGLE);
  const targetAngle = useRef(INITIAL_ANGLE);

  const walkTime = useRef(0);
  const floatTime = useRef(0);

  const walkY = useRef(WALK_Y_STOPPED);
  const idleY = useRef(IDLE_Y_STOPPED);

  const restPose = useRef<Record<string, THREE.Quaternion>>({});

  // Mouse state
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const smoothMouseX = useRef(0);
  const smoothMouseY = useRef(0);

  // Smoothed movement speed — lerped each frame to eliminate jitter
  // from raw movementSpeed being noisy at slow scroll inputs.
  const smoothedSpeed = useRef(0);

  // ─────────────────────────────────────────────
  // REST POSE CAPTURE
  // ─────────────────────────────────────────────

  useEffect(() => {
    const tryCapture = () => {
      const { scene } = get();
      let ok = true;
      for (const name of BONE_NAMES) {
        if (restPose.current[name]) continue;
        const obj = scene.getObjectByName(name);
        if (!obj) {
          ok = false;
          continue;
        }
        restPose.current[name] = obj.quaternion.clone();
      }
      return ok;
    };
    if (!tryCapture()) {
      const id = setInterval(() => {
        if (tryCapture()) clearInterval(id);
      }, 100);
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

    const radiusWave = Math.sin(currentAngle.current * RADIUS_FREQUENCY);
    const dynamicRadius = BASE_RADIUS + radiusWave * RADIUS_AMPLITUDE;

    const heightWave1 = Math.sin(currentAngle.current * HEIGHT_FREQUENCY);
    const heightWave2 = Math.cos(
      currentAngle.current * HEIGHT_FREQUENCY * HEIGHT_OFFSET,
    );
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

    smoothMouseX.current +=
      (mouseX.current - smoothMouseX.current) * MOUSE_SMOOTHING;
    smoothMouseY.current +=
      (mouseY.current - smoothMouseY.current) * MOUSE_SMOOTHING;

    const target = new THREE.Vector3(0, 3, 0);
    const forward = new THREE.Vector3()
      .subVectors(target, basePos)
      .normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3()
      .crossVectors(forward, up)
      .normalize();
    const cameraUp = new THREE.Vector3()
      .crossVectors(right, forward)
      .normalize();

    const offset = new THREE.Vector3()
      .addScaledVector(right, -smoothMouseX.current * MOUSE_SENSITIVITY)
      .addScaledVector(cameraUp, -smoothMouseY.current * MOUSE_SENSITIVITY);

    camera.position.copy(basePos).add(offset);
    camera.lookAt(target);

    // ─────────────────────────────────────────────
    // ROOTS
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

    const movementSpeed = Math.abs(
      targetAngle.current - currentAngle.current,
    );
    const isMoving = movementSpeed > 0.00001;

    // ─────────────────────────────────────────────
    // ANIMATED Y POSITIONS
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

    // ─────────────────────────────────────────────
    // WALK
    // ─────────────────────────────────────────────

    walkRoot.rotation.y = rotationY;

    // ─────────────────────────────────────────────
    // IDLE
    // ─────────────────────────────────────────────

    idleRoot.rotation.set(1.5, 0, 3);
    idleRoot.rotateOnWorldAxis(LOCAL_Y, rotationY);

    // ─────────────────────────────────────────────
    // WALK ANIMATION  ← the fixed section
    // ─────────────────────────────────────────────

    const applySwing = (name: string, amount: number) => {
      const obj = scene.getObjectByName(name);
      const rest = restPose.current[name];
      if (!obj || !rest) return;
      obj.quaternion.copy(rest);
      const q = new THREE.Quaternion().setFromAxisAngle(LOCAL_Y, amount);
      obj.quaternion.multiply(q);
    };

    // ── Smooth speed only while moving (removes jitter).
    //    Snap to 0 immediately when stopped so animation halts instantly.
    if (isMoving) {
      smoothedSpeed.current +=
        (movementSpeed - smoothedSpeed.current) * SPEED_SMOOTHING;
    } else {
      smoothedSpeed.current = 0;
    }

    if (smoothedSpeed.current > 0.00001) {
      // Cycle speed is proportional to smoothed scroll speed —
      // slow scroll = slow walk, fast scroll = fast walk, always full range.
      walkTime.current += delta * smoothedSpeed.current * WALK_CYCLE_SPEED;

      const base = Math.sin(walkTime.current);

      applySwing(
        "frodo_left_hand",
        LEFT_HAND_OFFSET + base * LEFT_HAND_SWING_RANGE,
      );
      applySwing(
        "frodo_right_hand",
        -(RIGHT_HAND_OFFSET + base * RIGHT_HAND_SWING_RANGE),
      );
      applySwing(
        "frodo_leg",
        -(LEFT_LEG_OFFSET + base * LEFT_LEG_SWING_RANGE),
      );
      applySwing(
        "frodo_leg001",
        RIGHT_LEG_OFFSET + base * RIGHT_LEG_SWING_RANGE,
      );
    } else {
      for (const name of BONE_NAMES) {
        const obj = scene.getObjectByName(name);
        const rest = restPose.current[name];
        if (obj && rest) {
          obj.quaternion.slerp(rest, 0.1);
        }
      }
    }
  });

  return null;
}