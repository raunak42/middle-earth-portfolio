"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA / SCENE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const RADIUS = 6.42;
const HEIGHT = 2.61;

const INITIAL_ANGLE = Math.atan2(-5.005, 4.025);

const SCROLL_SPEED = 0.0008;
const CAMERA_SMOOTHING = 0.06;

const START_X = 6.5;
const START_Z = -7.5;

const CHAR_RADIUS = Math.sqrt(
  START_X ** 2 + START_Z ** 2
);

const CHARACTER_START_ANGLE = Math.atan2(
  START_Z,
  START_X
);

const CHAR_Y = 3.5;

// ─────────────────────────────────────────────────────────────────────────────
// WALK ANIMATION CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

// Swing range (max angle in radians)

const LEFT_HAND_SWING_RANGE  = 1.1;
const RIGHT_HAND_SWING_RANGE = 1.1;

const LEFT_LEG_SWING_RANGE   = 1.1;
const RIGHT_LEG_SWING_RANGE  = 1.1;

// -----------------------------------------------------------------------------
// SWING OFFSETS
//
// Positive  -> shifts whole motion forward
// Negative  -> shifts whole motion backward
//
// Useful when:
//
//   a limb goes too far backward
//   OR
//   doesn't come enough forward
// -----------------------------------------------------------------------------

const LEFT_HAND_OFFSET  = 0.0;
const RIGHT_HAND_OFFSET = -1;

const LEFT_LEG_OFFSET   = 0.0;
const RIGHT_LEG_OFFSET  = 0.0;

// How quickly swing reaches max
const SWING_BUILDUP = 8;

// Walk cycle speed
const WALK_CYCLE_SPEED = 18;

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL OBJECT AXIS
// ─────────────────────────────────────────────────────────────────────────────

const LOCAL_Y = new THREE.Vector3(0, 1, 0);

const BONE_NAMES = [
  "frodo_left_hand",
  "frodo_right_hand",
  "frodo_leg",
  "frodo_leg001", // GLTFLoader strips dots
];

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE OBJECTS
// ─────────────────────────────────────────────────────────────────────────────

const _swingQuat = new THREE.Quaternion();

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function CameraRig() {

  const get = useThree((state) => state.get);

  const currentAngle = useRef(INITIAL_ANGLE);
  const targetAngle  = useRef(INITIAL_ANGLE);

  const walkTime = useRef(0);

  // Rest-pose local quaternions
  const restPose = useRef<
    Partial<Record<string, THREE.Quaternion>>
  >({});

  // ───────────────────────────────────────────────────────────────────────────
  // Capture rest pose
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {

    const tryCapture = () => {

      const { scene } = get();

      let allFound = true;

      for (const name of BONE_NAMES) {

        if (restPose.current[name]) continue;

        const obj =
          scene.getObjectByName(name);

        if (!obj) {

          allFound = false;
          continue;
        }

        restPose.current[name] =
          obj.quaternion.clone();
      }

      return allFound;
    };

    if (!tryCapture()) {

      const id = setInterval(() => {

        if (tryCapture()) {
          clearInterval(id);
        }

      }, 100);

      return () => clearInterval(id);
    }

  }, [get]);

  // ───────────────────────────────────────────────────────────────────────────
  // Scroll
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {

    const onWheel = (e: WheelEvent) => {

      e.preventDefault();

      targetAngle.current -=
        e.deltaY * SCROLL_SPEED;
    };

    window.addEventListener("wheel", onWheel, {
      passive: false,
    });

    return () => {

      window.removeEventListener(
        "wheel",
        onWheel
      );
    };

  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Frame loop
  // ───────────────────────────────────────────────────────────────────────────

  useFrame((_state, delta) => {

    const { camera, scene } = get();

    // ─────────────────────────────────────────────────────────────────────────
    // CAMERA
    // ─────────────────────────────────────────────────────────────────────────

    currentAngle.current +=
      (targetAngle.current -
        currentAngle.current) *
      CAMERA_SMOOTHING;

    camera.position.set(
      Math.sin(currentAngle.current) * RADIUS,
      HEIGHT,
      Math.cos(currentAngle.current) * RADIUS
    );

    camera.lookAt(0, 2, 0);

    // ─────────────────────────────────────────────────────────────────────────
    // CHARACTER ROOT
    // ─────────────────────────────────────────────────────────────────────────

    const character =
      scene.getObjectByName(
        "character_walk_root"
      );

    if (!character) return;

    const charAngle =
      CHARACTER_START_ANGLE -
      (currentAngle.current -
        INITIAL_ANGLE);

    character.position.set(
      Math.cos(charAngle) * CHAR_RADIUS,
      CHAR_Y,
      Math.sin(charAngle) * CHAR_RADIUS
    );

    character.rotation.y =
      -charAngle + Math.PI * 0.5;

    // ─────────────────────────────────────────────────────────────────────────
    // MOVEMENT SPEED
    // ─────────────────────────────────────────────────────────────────────────

    const movementSpeed = Math.abs(
      targetAngle.current -
        currentAngle.current
    );

    // ─────────────────────────────────────────────────────────────────────────
    // APPLY SWING
    // ─────────────────────────────────────────────────────────────────────────

    const applySwing = (
      name: string,
      amount: number
    ) => {

      const obj =
        scene.getObjectByName(name);

      const rest =
        restPose.current[name];

      if (!obj || !rest) return;

      // Reset to original pose
      obj.quaternion.copy(rest);

      // Local-space rotation
      _swingQuat.setFromAxisAngle(
        LOCAL_Y,
        amount
      );

      obj.quaternion.multiply(
        _swingQuat
      );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // WALK ANIMATION
    // ─────────────────────────────────────────────────────────────────────────

    if (movementSpeed > 0.00001) {

      // Advance walk cycle
      walkTime.current +=
        delta *
        movementSpeed *
        WALK_CYCLE_SPEED;

      // Base oscillation
      const baseSwing =
        Math.sin(walkTime.current);

      // ---------------------------------------------------------------------
      // Limb-specific swing calculations
      // ---------------------------------------------------------------------

      const leftHandSwing =

        LEFT_HAND_OFFSET +

        baseSwing *

        Math.min(
          movementSpeed * SWING_BUILDUP,
          LEFT_HAND_SWING_RANGE
        );

      const rightHandSwing =

        RIGHT_HAND_OFFSET +

        baseSwing *

        Math.min(
          movementSpeed * SWING_BUILDUP,
          RIGHT_HAND_SWING_RANGE
        );

      const leftLegSwing =

        LEFT_LEG_OFFSET +

        baseSwing *

        Math.min(
          movementSpeed * SWING_BUILDUP,
          LEFT_LEG_SWING_RANGE
        );

      const rightLegSwing =

        RIGHT_LEG_OFFSET +

        baseSwing *

        Math.min(
          movementSpeed * SWING_BUILDUP,
          RIGHT_LEG_SWING_RANGE
        );

      // ---------------------------------------------------------------------
      // APPLY
      // ---------------------------------------------------------------------

      // Arms opposite
      applySwing(
        "frodo_left_hand",
        leftHandSwing
      );

      applySwing(
        "frodo_right_hand",
        -rightHandSwing
      );

      // Legs opposite
      applySwing(
        "frodo_leg",
        -leftLegSwing
      );

      applySwing(
        "frodo_leg001",
        rightLegSwing
      );

    } else {

      // Smooth return to rest pose
      for (const name of BONE_NAMES) {

        const obj =
          scene.getObjectByName(name);

        const rest =
          restPose.current[name];

        if (obj && rest) {

          obj.quaternion.slerp(
            rest,
            0.1
          );
        }
      }
    }
  });

  return null;
}