"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const BASE_RADIUS = 6.42;
const BASE_HEIGHT = 4.21;

const INITIAL_ANGLE = Math.atan2(-5.005, 4.025);

const SCROLL_SPEED = 0.0008;
const CAMERA_SMOOTHING = 0.06;

// Forward/back controls camera distance from the room center independently.
// Positive radius wave = farther back, negative radius wave = farther forward.
const BACKWARD_AMPLITUDE = 1;
const FORWARD_AMPLITUDE = 3;
const FORWARD_BACK_FREQUENCY = 1.9;

// Up/down controls camera height independently.
// Positive height wave = up, negative height wave = down.
const UP_AMPLITUDE = 0.5;
const DOWN_AMPLITUDE = 2.0;
const UP_DOWN_FREQUENCY = 2.3;

// Adds a smaller secondary vertical wobble. Set to 0 to disable.
const SECONDARY_UP_DOWN_AMOUNT = 0.3;
const SECONDARY_UP_DOWN_FREQUENCY_MULTIPLIER = 2.5;

// Camera look target: instead of staring at the world origin, look at the
// vertical middle of the opposite room wall/section. The GLB section wall
// centers are at roughly (+/-6.594, +/-6.594), so this radius puts the target
// on the visual wall center as the camera orbits.
const ROOM_SECTION_CENTER_XZ = 6.594;
const WALL_LOOK_AT_RADIUS = Math.sqrt(
  ROOM_SECTION_CENTER_XZ ** 2 + ROOM_SECTION_CENTER_XZ ** 2,
);
const WALL_LOOK_AT_HEIGHT = 2.5;

const MOUSE_LOOK_SENSITIVITY = 1.7;
const MOUSE_SMOOTHING = 0.1;

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

const CHARACTER_START_ANGLE = Math.atan2(START_Z, START_X);

const CHAR_Y = 3.5;

const WALK_Y_MOVING = CHAR_Y + 0.5;
const WALK_Y_STOPPED = CHAR_Y - 1.8;
const IDLE_Y_MOVING = CHAR_Y - 2;
const IDLE_Y_STOPPED = CHAR_Y + 0.7;

const SWAP_SMOOTHING = 0.12;

const FLOAT_AMPLITUDE = 0.15;
const FLOAT_SPEED = 1.5;

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

// Angular distance behind Frodo on the shared circle path.
// Positive = trails behind in the direction of travel.
const GOLLUM_FOLLOW_OFFSET = 0.35;

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

const BOAT_BOB_AMOUNT = 0.3;
const BOAT_SURGE_AMOUNT = 0.1;
const BOAT_PITCH_AMOUNT = 0.04;
const BOAT_ROLL_AMOUNT = 0.025;
const BOAT_WAVE_SPEED = 5;

const GOLLUM_WALK_CYCLE_SPEED = 80;

const GOLLUM_LEFT_ARM_SWING = 0.7;
const GOLLUM_RIGHT_ARM_SWING = 0.7;
const GOLLUM_LEFT_LEG_SWING = 0.7;
const GOLLUM_RIGHT_LEG_SWING = 0.7;

const NAZGUL_FOLLOW_OFFSET = GOLLUM_FOLLOW_OFFSET;
const NAZGUL_Y = CHAR_Y + 1.0;
const NAZGUL_Y_HIDDEN = IDLE_Y_MOVING;
const NAZGUL_GALLOP_SPEED = 7.5;
const NAZGUL_GALLOP_BOB = 0.09;
const NAZGUL_GALLOP_SURGE = 0.05;
const NAZGUL_GALLOP_PITCH = 0.045;
const NAZGUL_GALLOP_ROLL = 0.018;

const LOCAL_Y = new THREE.Vector3(0, 1, 0);
const TWO_PI = Math.PI * 2;
const _pathForward = new THREE.Vector3();
const _pathSide = new THREE.Vector3();

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

export default function CameraRig({
  disabled = false,
  zoom = 0,
}: {
  disabled?: boolean;
  zoom?: number;
}) {
  const get = useThree((s) => s.get);

  const currentAngle = useRef(INITIAL_ANGLE);
  const targetAngle = useRef(INITIAL_ANGLE);
  const smoothZoom = useRef(zoom);

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

  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const smoothMouseX = useRef(0);
  const smoothMouseY = useRef(0);

  const smoothedSpeed = useRef(0);

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

  useEffect(() => {
    if (disabled) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetAngle.current -= e.deltaY * SCROLL_SPEED;
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [disabled]);

  useEffect(() => {
    if (disabled) {
      mouseX.current = 0;
      mouseY.current = 0;
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX.current = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [disabled]);

  useFrame((state, delta) => {
    const { camera, scene } = get();
    const elapsed = state.clock.elapsedTime;

    currentAngle.current +=
      (targetAngle.current - currentAngle.current) * CAMERA_SMOOTHING;

    smoothZoom.current += (zoom - smoothZoom.current) * 0.08;

    const radiusWave = Math.sin(currentAngle.current * FORWARD_BACK_FREQUENCY);
    const radiusOffset =
      Math.max(radiusWave, 0) * BACKWARD_AMPLITUDE -
      Math.max(-radiusWave, 0) * FORWARD_AMPLITUDE;
    const dynamicRadius =
      (BASE_RADIUS + radiusOffset) * (1 - smoothZoom.current * 0.84);

    const heightWave = Math.sin(currentAngle.current * UP_DOWN_FREQUENCY);
    const secondaryHeightWave = Math.cos(
      currentAngle.current *
        UP_DOWN_FREQUENCY *
        SECONDARY_UP_DOWN_FREQUENCY_MULTIPLIER,
    );
    const heightOffset =
      Math.max(heightWave, 0) * UP_AMPLITUDE -
      Math.max(-heightWave, 0) * DOWN_AMPLITUDE +
      secondaryHeightWave * SECONDARY_UP_DOWN_AMOUNT;
    const dynamicHeight = BASE_HEIGHT + heightOffset;

    const basePos = new THREE.Vector3(
      Math.sin(currentAngle.current) * dynamicRadius,
      dynamicHeight,
      Math.cos(currentAngle.current) * dynamicRadius,
    );

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

    const lookOffset = new THREE.Vector3()
      .addScaledVector(right, smoothMouseX.current * MOUSE_LOOK_SENSITIVITY)
      .addScaledVector(cameraUp, smoothMouseY.current * MOUSE_LOOK_SENSITIVITY);

    camera.position.copy(basePos);
    camera.lookAt(target.clone().add(lookOffset));

    const walkRoot = scene.getObjectByName("character_walk_root");
    const idleRoot = scene.getObjectByName("character_idle_root");

    if (!walkRoot || !idleRoot) return;

    const charAngle =
      CHARACTER_START_ANGLE - (currentAngle.current - INITIAL_ANGLE);
    const normalizedCharAngle = ((charAngle % TWO_PI) + TWO_PI) % TWO_PI;

    const x = Math.cos(charAngle) * FRODO_RADIUS;
    const z = Math.sin(charAngle) * FRODO_RADIUS;

    const movementSpeed = Math.abs(targetAngle.current - currentAngle.current);
    const isMoving = movementSpeed > 0.00001;

    const frodoInBoatIsVisible =
      normalizedCharAngle > ARGONATH_COME_UP_AT &&
      normalizedCharAngle < ARGONATH_GO_DOWN_AT;
    const walkCharacterIsVisible =
      normalizedCharAngle < GOLLUM_GO_DOWN_AT ||
      normalizedCharAngle > WALK_COME_UP_AT ||
      normalizedCharAngle > MELLON_COME_UP_AT;

    const sectionFrodoSceneIsVisible = frodoInBoatIsVisible;

    const targetWalkY =
      isMoving && walkCharacterIsVisible ? WALK_Y_MOVING : WALK_Y_STOPPED;
    const targetIdleY =
      isMoving || sectionFrodoSceneIsVisible ? IDLE_Y_MOVING : IDLE_Y_STOPPED;

    const sectionSwapSmoothing = SWAP_SMOOTHING;

    walkY.current += (targetWalkY - walkY.current) * sectionSwapSmoothing;
    idleY.current += (targetIdleY - idleY.current) * SWAP_SMOOTHING;

    floatTime.current += delta * FLOAT_SPEED;
    const floatOffset = Math.sin(floatTime.current) * FLOAT_AMPLITUDE;

    walkRoot.position.set(x, walkY.current, z);
    idleRoot.position.set(x, idleY.current + floatOffset, z);

    const rotationY = -charAngle + Math.PI * 0.7;

    walkRoot.rotation.y = rotationY;

    idleRoot.rotation.set(1.5, 0, 3);
    idleRoot.rotateOnWorldAxis(LOCAL_Y, rotationY - 0.8);

    if (isMoving) {
      smoothedSpeed.current +=
        (movementSpeed - smoothedSpeed.current) * SPEED_SMOOTHING;
    } else {
      smoothedSpeed.current = 0;
    }

    const applySwing = (name: string, amount: number) => {
      const obj = scene.getObjectByName(name);
      const rest = restPose.current[name];
      if (!obj || !rest) return;
      obj.quaternion.copy(rest);
      const q = new THREE.Quaternion().setFromAxisAngle(LOCAL_Y, amount);
      obj.quaternion.multiply(q);
    };

    const frodoInBoat = scene.getObjectByName("frodo_in_boat");
    if (frodoInBoat) {
      if (!sectionFrodoSceneBase.current.frodo_in_boat) {
        const authoredAngle = Math.atan2(frodoInBoat.position.z, frodoInBoat.position.x);
        sectionFrodoSceneBase.current.frodo_in_boat = {
          rotation: frodoInBoat.rotation.clone(),
          pathRotation: -authoredAngle + Math.PI * 0.5,
        };
        sectionFrodoSceneY.current.frodo_in_boat = GOLLUM_Y_HIDDEN;
      }

      const base = sectionFrodoSceneBase.current.frodo_in_boat;
      const targetY = frodoInBoatIsVisible ? GOLLUM_Y : GOLLUM_Y_HIDDEN;

      sectionFrodoSceneY.current.frodo_in_boat +=
        (targetY - sectionFrodoSceneY.current.frodo_in_boat) * sectionSwapSmoothing;

      const sceneX = Math.cos(charAngle) * BOAT_FRODO_RADIUS;
      const sceneZ = Math.sin(charAngle) * BOAT_FRODO_RADIUS;

      frodoInBoat.position.set(sceneX, sectionFrodoSceneY.current.frodo_in_boat, sceneZ);
      frodoInBoat.rotation.copy(base.rotation);
      frodoInBoat.rotateOnWorldAxis(LOCAL_Y, rotationY - base.pathRotation - 0.7);

      if (frodoInBoatIsVisible) {
        const waveT = elapsed * BOAT_WAVE_SPEED;
        const wave = Math.sin(waveT);
        const swell = (1 - Math.cos(waveT)) * 0.5;

        _pathForward
          .set(Math.sin(charAngle), 0, -Math.cos(charAngle))
          .normalize();
        _pathSide.set(Math.cos(charAngle), 0, Math.sin(charAngle)).normalize();

        frodoInBoat.position.y += swell * BOAT_BOB_AMOUNT;
        frodoInBoat.position.addScaledVector(_pathForward, wave * BOAT_SURGE_AMOUNT);
        frodoInBoat.rotateOnWorldAxis(_pathSide, wave * BOAT_PITCH_AMOUNT);
        frodoInBoat.rotateOnWorldAxis(
          _pathForward,
          Math.sin(waveT * 0.7) * BOAT_ROLL_AMOUNT,
        );
      }
    }

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

    const gollumRoot = scene.getObjectByName("gollum_body");
    if (!gollumRoot) return;

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
    gollumRoot.rotateOnWorldAxis(LOCAL_Y, -gollumAngle + Math.PI * 0.5 + 0.5);

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
