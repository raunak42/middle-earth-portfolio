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

// Camera look target: instead of staring at the world origin, look at the
// vertical middle of the opposite room wall/section. The GLB section wall
// centers are at roughly (+/-6.594, +/-6.594), so this radius puts the target
// on the visual wall center as the camera orbits.
const ROOM_SECTION_CENTER_XZ = 6.594;
const WALL_LOOK_AT_RADIUS = Math.sqrt(
  ROOM_SECTION_CENTER_XZ ** 2 + ROOM_SECTION_CENTER_XZ ** 2,
);
const WALL_LOOK_AT_HEIGHT = 2.5;

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

const CHAR_RADIUS = Math.sqrt(START_X ** 2 + START_Z ** 2) + 0.1;

// Per-character path radii. Keep equal to CHAR_RADIUS by default.
// Increase/decrease individual values to move that character outward/inward
// relative to the circular walking path.
const FRODO_RADIUS = CHAR_RADIUS;
const GOLLUM_RADIUS = CHAR_RADIUS + 0.3;
const NAZGUL_RADIUS = CHAR_RADIUS;
const BOAT_FRODO_RADIUS = CHAR_RADIUS;
const TENTACLE_FRODO_RADIUS = CHAR_RADIUS;

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
const GOLLUM_FOLLOW_OFFSET = 0.35;

// Gollum sits a little lower than Frodo (crouched posture).
const GOLLUM_Y = CHAR_Y + 0.5;
const GOLLUM_Y_HIDDEN = IDLE_Y_MOVING;

// Balrog section visibility window, in radians.
// Increase GOLLUM_COME_UP_AT to make him come up later.
// Decrease GOLLUM_GO_DOWN_AT to make him go down earlier.
const GOLLUM_COME_UP_AT = 0.07;
const GOLLUM_GO_DOWN_AT = Math.PI * 0.5 - 0.15;

// Walk Frodo disappears at the same offset-before-edge as Gollum,
// then returns a little inside the Shire section instead of exactly on the border.
const WALK_COME_UP_AT = Math.PI * 1.5 + GOLLUM_COME_UP_AT;

// Section-only Frodo scene windows. They use the same away-from-border offsets
// as Gollum: come up a little after a section starts and go down a little early.
const SECTION_GO_DOWN_OFFSET = Math.PI * 0.5 - GOLLUM_GO_DOWN_AT;
const ARGONATH_COME_UP_AT = Math.PI * 0.5 + GOLLUM_COME_UP_AT;
const ARGONATH_GO_DOWN_AT = Math.PI - SECTION_GO_DOWN_OFFSET;
const MELLON_COME_UP_AT = Math.PI + GOLLUM_COME_UP_AT;
const MELLON_GO_DOWN_AT = Math.PI * 1.5 - SECTION_GO_DOWN_OFFSET;

const BOAT_BOB_AMOUNT = 0.08;
const BOAT_SURGE_AMOUNT = 0.1;
const BOAT_PITCH_AMOUNT = 0.04;
const BOAT_ROLL_AMOUNT = 0.025;
const BOAT_WAVE_SPEED = 5;

// Slightly faster cadence than Frodo — scurrying, nervous energy.
const GOLLUM_WALK_CYCLE_SPEED = 80;

const GOLLUM_LEFT_ARM_SWING = 0.7;
const GOLLUM_RIGHT_ARM_SWING = 0.7;
const GOLLUM_LEFT_LEG_SWING = 0.7;
const GOLLUM_RIGHT_LEG_SWING = 0.7;

// Nazgul chase in Mellon — same idea as Gollum in Balrog.
const NAZGUL_FOLLOW_OFFSET = GOLLUM_FOLLOW_OFFSET;
const NAZGUL_Y = CHAR_Y + 1.0;
const NAZGUL_Y_HIDDEN = IDLE_Y_MOVING;
const NAZGUL_GALLOP_SPEED = 7.5;
const NAZGUL_GALLOP_BOB = 0.09;
const NAZGUL_GALLOP_SURGE = 0.05;
const NAZGUL_GALLOP_PITCH = 0.045;
const NAZGUL_GALLOP_ROLL = 0.018;

// ─────────────────────────────────────────────────────────────
// AXIS
// ─────────────────────────────────────────────────────────────

const LOCAL_Y = new THREE.Vector3(0, 1, 0);
const TWO_PI = Math.PI * 2;
const _pathForward = new THREE.Vector3();
const _pathSide = new THREE.Vector3();

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

type SectionFrodoSceneBase = {
  rotation: THREE.Euler;
  pathRotation: number;
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function CameraRig() {
  const get = useThree((s) => s.get);

  const currentAngle = useRef(INITIAL_ANGLE);
  const targetAngle = useRef(INITIAL_ANGLE);

  const walkTime = useRef(0);
  const gollumWalkTime = useRef(0);
  const floatTime = useRef(0);

  const walkY = useRef(WALK_Y_STOPPED);
  const idleY = useRef(IDLE_Y_STOPPED);
  const gollumY = useRef(GOLLUM_Y_HIDDEN);
  const nazgulY = useRef(NAZGUL_Y_HIDDEN);

  const restPose = useRef<Record<string, THREE.Quaternion>>({});
  const gollumBaseRotation = useRef<THREE.Euler | null>(null);
  const nazgulBase = useRef<SectionFrodoSceneBase | null>(null);
  const sectionFrodoSceneBase = useRef<Record<string, SectionFrodoSceneBase>>(
    {},
  );
  const sectionFrodoSceneY = useRef<Record<string, number>>({});

  // Mouse state
  const mouseX = useRef(0);
  const mouseY = useRef(0);
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

  useFrame((state, delta) => {
    const { camera, scene } = get();
    const elapsed = state.clock.elapsedTime;

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

    const target = new THREE.Vector3(
      -Math.sin(currentAngle.current) * WALL_LOOK_AT_RADIUS,
      WALL_LOOK_AT_HEIGHT,
      -Math.cos(currentAngle.current) * WALL_LOOK_AT_RADIUS,
    );
    const forward = new THREE.Vector3().subVectors(target, basePos).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();
    const cameraUp = new THREE.Vector3()
      .crossVectors(right, forward)
      .normalize();

    const offset = new THREE.Vector3()
      .addScaledVector(right, -smoothMouseX.current * MOUSE_SENSITIVITY)
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
    const normalizedCharAngle = ((charAngle % TWO_PI) + TWO_PI) % TWO_PI;

    const x = Math.cos(charAngle) * FRODO_RADIUS;
    const z = Math.sin(charAngle) * FRODO_RADIUS;

    // ─────────────────────────────────────────────
    // MOVEMENT SPEED
    // ─────────────────────────────────────────────

    const movementSpeed = Math.abs(targetAngle.current - currentAngle.current);
    const isMoving = movementSpeed > 0.00001;

    // ─────────────────────────────────────────────
    // ANIMATED Y POSITIONS (Frodo swap)
    // ─────────────────────────────────────────────

    const frodoInBoatIsVisible =
      normalizedCharAngle > ARGONATH_COME_UP_AT &&
      normalizedCharAngle < ARGONATH_GO_DOWN_AT;
    const frodoInMellonSection =
      normalizedCharAngle > MELLON_COME_UP_AT &&
      normalizedCharAngle < MELLON_GO_DOWN_AT;

    const walkCharacterIsVisible =
      normalizedCharAngle < GOLLUM_GO_DOWN_AT ||
      normalizedCharAngle > WALK_COME_UP_AT ||
      frodoInMellonSection;

    // Replaced by the Nazgul chase in Mellon.
    const frodoTentacleIsVisible = false;
    const sectionFrodoSceneIsVisible = frodoInBoatIsVisible;

    const targetWalkY =
      isMoving && walkCharacterIsVisible ? WALK_Y_MOVING : WALK_Y_STOPPED;
    const targetIdleY =
      isMoving || sectionFrodoSceneIsVisible ? IDLE_Y_MOVING : IDLE_Y_STOPPED;

    const sectionSwapSmoothing = SWAP_SMOOTHING;

    walkY.current += (targetWalkY - walkY.current) * sectionSwapSmoothing;
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
      const obj = scene.getObjectByName(name);
      const rest = restPose.current[name];
      if (!obj || !rest) return;
      obj.quaternion.copy(rest);
      const q = new THREE.Quaternion().setFromAxisAngle(LOCAL_Y, amount);
      obj.quaternion.multiply(q);
    };

    // ─────────────────────────────────────────────
    // SECTION FRODO SCENES — boat / tentacle
    // ─────────────────────────────────────────────

    const updateSectionFrodoScene = (
      name: "frodo_in_boat" | "frodo_tentacle",
      visible: boolean,
      wavyBoat = false,
    ) => {
      const obj = scene.getObjectByName(name);
      if (!obj) return;

      if (!sectionFrodoSceneBase.current[name]) {
        const authoredAngle = Math.atan2(obj.position.z, obj.position.x);
        sectionFrodoSceneBase.current[name] = {
          rotation: obj.rotation.clone(),
          pathRotation: -authoredAngle + Math.PI * 0.5,
        };
        sectionFrodoSceneY.current[name] = GOLLUM_Y_HIDDEN;
      }

      const base = sectionFrodoSceneBase.current[name];
      const visibleY = name === "frodo_in_boat" ? GOLLUM_Y : CHAR_Y + 1.44;
      const targetY = visible ? visibleY : GOLLUM_Y_HIDDEN;

      sectionFrodoSceneY.current[name] +=
        (targetY - sectionFrodoSceneY.current[name]) * sectionSwapSmoothing;

      const sceneRadius =
        name === "frodo_in_boat" ? BOAT_FRODO_RADIUS : TENTACLE_FRODO_RADIUS;
      const sceneX = Math.cos(charAngle) * sceneRadius;
      const sceneZ = Math.sin(charAngle) * sceneRadius;

      obj.position.set(sceneX, sectionFrodoSceneY.current[name], sceneZ);

      // These meshes already have an authored orientation in their own sections.
      // Reset to that base, then rotate only by the path-facing delta, not the
      // absolute path rotation — otherwise they get over-rotated.
      obj.rotation.copy(base.rotation);
      obj.rotateOnWorldAxis(LOCAL_Y, rotationY - base.pathRotation);

      if (wavyBoat && visible) {
        const waveT = elapsed * BOAT_WAVE_SPEED;
        const wave = Math.sin(waveT);
        const swell = (1 - Math.cos(waveT)) * 0.5;

        _pathForward
          .set(Math.sin(charAngle), 0, -Math.cos(charAngle))
          .normalize();
        _pathSide.set(Math.cos(charAngle), 0, Math.sin(charAngle)).normalize();

        // Boat motion in the path's movement plane: bob vertically, drift a
        // little forward/back along the route, pitch over waves, and roll very
        // slightly side-to-side around its forward direction.
        obj.position.y += swell * BOAT_BOB_AMOUNT;
        obj.position.addScaledVector(_pathForward, wave * BOAT_SURGE_AMOUNT);
        obj.rotateOnWorldAxis(_pathSide, wave * BOAT_PITCH_AMOUNT);
        obj.rotateOnWorldAxis(
          _pathForward,
          Math.sin(waveT * 0.7) * BOAT_ROLL_AMOUNT,
        );
      }
    };

    updateSectionFrodoScene("frodo_in_boat", frodoInBoatIsVisible, true);
    updateSectionFrodoScene("frodo_tentacle", frodoTentacleIsVisible);

    // ─────────────────────────────────────────────
    // NAZGUL CHASE — Mellon
    // ─────────────────────────────────────────────

    const nazgulRoot = scene.getObjectByName("nazgul");
    if (nazgulRoot) {
      const nazgulAngle = charAngle - NAZGUL_FOLLOW_OFFSET;
      const nx = Math.cos(nazgulAngle) * NAZGUL_RADIUS;
      const nz = Math.sin(nazgulAngle) * NAZGUL_RADIUS;
      const normalizedNazgulAngle = ((nazgulAngle % TWO_PI) + TWO_PI) % TWO_PI;
      const nazgulInMellonWindow =
        normalizedNazgulAngle > MELLON_COME_UP_AT &&
        normalizedNazgulAngle < MELLON_GO_DOWN_AT;
      const targetNazgulY =
        nazgulInMellonWindow && isMoving ? NAZGUL_Y : NAZGUL_Y_HIDDEN;

      if (!nazgulBase.current) {
        const authoredAngle = Math.atan2(
          nazgulRoot.position.z,
          nazgulRoot.position.x,
        );
        nazgulBase.current = {
          rotation: nazgulRoot.rotation.clone(),
          pathRotation: -authoredAngle + Math.PI * 0.5,
        };
      }

      nazgulY.current +=
        (targetNazgulY - nazgulY.current) * sectionSwapSmoothing;
      nazgulRoot.position.set(nx, nazgulY.current, nz);

      // Same orientation fix as the section Frodo meshes: keep the GLB-authored
      // base orientation and apply only the path-facing delta.
      nazgulRoot.rotation.copy(nazgulBase.current.rotation);
      nazgulRoot.rotateOnWorldAxis(
        LOCAL_Y,
        -nazgulAngle + Math.PI * 0.5 - nazgulBase.current.pathRotation,
      );

      if (nazgulInMellonWindow && isMoving) {
        const gallopT = elapsed * NAZGUL_GALLOP_SPEED;
        const stride = Math.sin(gallopT);
        const hoofBeat = (1 - Math.cos(gallopT)) * 0.5;

        _pathForward
          .set(Math.sin(nazgulAngle), 0, -Math.cos(nazgulAngle))
          .normalize();
        _pathSide
          .set(Math.cos(nazgulAngle), 0, Math.sin(nazgulAngle))
          .normalize();

        // Single-mesh gallop illusion in the plane of motion: hoof-beat bounce,
        // tiny forward surge along the path, pitch around the path-side axis,
        // and a very small roll around the forward axis.
        nazgulRoot.position.y += hoofBeat * NAZGUL_GALLOP_BOB;
        nazgulRoot.position.addScaledVector(
          _pathForward,
          stride * NAZGUL_GALLOP_SURGE,
        );
        nazgulRoot.rotateOnWorldAxis(_pathSide, stride * NAZGUL_GALLOP_PITCH);
        nazgulRoot.rotateOnWorldAxis(
          _pathForward,
          Math.sin(gallopT * 0.5) * NAZGUL_GALLOP_ROLL,
        );
      }
    }

    // ─────────────────────────────────────────────
    // FRODO WALK ANIMATION
    // ─────────────────────────────────────────────

    if (smoothedSpeed.current > 0.00001) {
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
      applySwing("frodo_leg", -(LEFT_LEG_OFFSET + base * LEFT_LEG_SWING_RANGE));
      applySwing(
        "frodo_leg001",
        RIGHT_LEG_OFFSET + base * RIGHT_LEG_SWING_RANGE,
      );
    } else {
      for (const name of FRODO_BONE_NAMES) {
        const obj = scene.getObjectByName(name);
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
    const gx = Math.cos(gollumAngle) * GOLLUM_RADIUS;
    const gz = Math.sin(gollumAngle) * GOLLUM_RADIUS;

    if (!gollumBaseRotation.current) {
      gollumBaseRotation.current = gollumRoot.rotation.clone();
    }

    const normalizedGollumAngle = ((gollumAngle % TWO_PI) + TWO_PI) % TWO_PI;

    const gollumInBalrogWindow =
      normalizedGollumAngle > GOLLUM_COME_UP_AT &&
      normalizedGollumAngle < GOLLUM_GO_DOWN_AT;

    const targetGollumY =
      gollumInBalrogWindow && isMoving ? GOLLUM_Y : GOLLUM_Y_HIDDEN;
    gollumY.current += (targetGollumY - gollumY.current) * sectionSwapSmoothing;

    gollumRoot.position.set(gx, gollumY.current, gz);

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

      applySwing("gollum_left_arm", base * GOLLUM_LEFT_ARM_SWING);
      applySwing("gollum_right_arm", -base * GOLLUM_RIGHT_ARM_SWING);
      applySwing("gollum_leg", -base * GOLLUM_LEFT_LEG_SWING);
      applySwing("gollum_leg001", base * GOLLUM_RIGHT_LEG_SWING);
    } else {
      for (const name of GOLLUM_BONE_NAMES) {
        const obj = scene.getObjectByName(name);
        const rest = restPose.current[name];
        if (obj && rest) obj.quaternion.slerp(rest, 0.1);
      }
    }
  });

  return null;
}
