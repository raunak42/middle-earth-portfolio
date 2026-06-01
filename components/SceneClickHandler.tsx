"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { type InfoViewName } from "@/components/InfoView";

const SIGN_VIEW_BY_OBJECT = {
  CLICK_About: "about",
  CLICK_Projects: "projects",
  CLICK_Experience: "experience",
  CLICK_Contact: "contact",
} as const satisfies Record<string, InfoViewName>;

export default function SceneClickHandler({
  disabled,
  onViewClick,
}: {
  disabled: boolean;
  onViewClick: (view: InfoViewName) => void;
}) {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);

  useEffect(() => {
    if (disabled) return;

    const findClickableSign = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(scene.children, true);

      for (const hit of hits) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          if (obj.name in SIGN_VIEW_BY_OBJECT) {
            return SIGN_VIEW_BY_OBJECT[
              obj.name as keyof typeof SIGN_VIEW_BY_OBJECT
            ];
          }
          obj = obj.parent;
        }
      }

      return null;
    };

    const onPointerMove = (event: PointerEvent) => {
      gl.domElement.classList.toggle(
        "cursor-pointer",
        Boolean(findClickableSign(event)),
      );
    };

    const onPointerLeave = () => {
      gl.domElement.classList.remove("cursor-pointer");
    };

    const onPointerDown = (event: PointerEvent) => {
      const view = findClickableSign(event);
      if (view) onViewClick(view);
    };

    gl.domElement.addEventListener("pointermove", onPointerMove);
    gl.domElement.addEventListener("pointerleave", onPointerLeave);
    gl.domElement.addEventListener("pointerdown", onPointerDown);
    return () => {
      gl.domElement.removeEventListener("pointermove", onPointerMove);
      gl.domElement.removeEventListener("pointerleave", onPointerLeave);
      gl.domElement.removeEventListener("pointerdown", onPointerDown);
      gl.domElement.classList.remove("cursor-pointer");
    };
  }, [camera, disabled, gl, onViewClick, pointer, raycaster, scene]);

  return null;
}
