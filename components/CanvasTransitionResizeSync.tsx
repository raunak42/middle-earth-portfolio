"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export default function CanvasTransitionResizeSync() {
  const { gl, setSize } = useThree();
  const lastSize = useRef({ height: 0, width: 0 });

  useFrame(() => {
    const parent = gl.domElement.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    if (
      width === lastSize.current.width &&
      height === lastSize.current.height
    ) {
      return;
    }

    lastSize.current = { height, width };
    setSize(width, height);
  });

  return null;
}
