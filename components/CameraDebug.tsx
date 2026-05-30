"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export default function CameraDebug() {
  const { camera } = useThree();
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = document.createElement("div");
    div.style.cssText = `
      position: fixed;
      top: 16px;
      left: 16px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      font-family: monospace;
      font-size: 13px;
      padding: 12px;
      border-radius: 8px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(div);
    divRef.current = div;

    return () => div.remove();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!divRef.current) return;
      const p = camera.position;
      const r = camera.rotation;
      divRef.current.innerHTML = `
        <b>position</b><br/>
        x: ${p.x.toFixed(3)}<br/>
        y: ${p.y.toFixed(3)}<br/>
        z: ${p.z.toFixed(3)}<br/>
        <br/>
        <b>rotation (rad)</b><br/>
        x: ${r.x.toFixed(3)}<br/>
        y: ${r.y.toFixed(3)}<br/>
        z: ${r.z.toFixed(3)}<br/>
      `;
    }, 100);

    return () => clearInterval(interval);
  }, [camera]);

  return null;
}
