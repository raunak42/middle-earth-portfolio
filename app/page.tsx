"use client";

import AnimatedPropsSquash from "@/components/AnimatedPropsSquash";
import CameraRig from "@/components/CameraRig";
import Cave from "@/components/Cave";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { ShaderChunk } from "three";

ShaderChunk.tonemapping_pars_fragment =
  ShaderChunk.tonemapping_pars_fragment.replace(
    "vec3 CustomToneMapping( vec3 color ) { return color; }",
    `
  vec3 CustomToneMapping( vec3 color ) {
    // ============================================
    // BRIGHTNESS CONTROL
    // ============================================
    // Increase this value to make the image brighter
    // Default: 1.0 (no change)
    // Try: 1.1 - 1.3 for brighter
    // Try: 0.8 - 0.9 for darker
    float brightness = 4.5;
    color *= toneMappingExposure * brightness;

    // ============================================
    // TONE MAPPING (affects highlight rolloff)
    // ============================================
    // Lower values = brighter highlights, more vibrant
    // Higher values = softer, more compressed highlights
    // Default: 1.0
    // Try: 0.7 - 0.9 for punchier highlights
    // Try: 1.1 - 1.3 for softer look
    float toneMapStrength = 1.0;
    color = color / (color + vec3(toneMapStrength));

    // ============================================
    // SATURATION CONTROL
    // ============================================
    // Increase this value to boost color saturation
    // Default: 1.0 (no change)
    // Try: 1.1 - 1.3 for more saturated colors
    // Try: 0.7 - 0.9 for desaturated/muted colors
    float saturation = 0.75;
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luma), color, saturation);

    // ============================================
    // CONTRAST CONTROL
    // ============================================
    // Lower values = more contrast (darker darks, brighter brights)
    // Higher values = less contrast (flatter image)
    // Default: 1.0 (no change)
    // Try: 0.9 - 0.95 for more contrast
    // Try: 1.05 - 1.1 for less contrast
    float contrast = 2.0;
    color = pow(color, vec3(contrast));

    // ============================================
    // SHADOW LIFT (optional)
    // ============================================
    // Uncomment the line below to lift shadows (makes darks brighter/grayer)
    // Increase the second value (0.04) to lift more
    // Try: 0.02 - 0.06 for subtle to strong lift
    // color = color * 0.93 + 0.04;

    // ============================================
    // VIBRANCE (optional - alternative to saturation)
    // ============================================
    // Uncomment to boost only less-saturated colors (more natural than saturation)
    // float maxColor = max(max(color.r, color.g), color.b);
    // float minColor = min(min(color.r, color.g), color.b);
    // float colorSat = maxColor - minColor;
    // float vibranceAmount = 0.3; // Try: 0.2 - 0.5
    // color = mix(vec3(luma), color, 1.0 + vibranceAmount * (1.0 - colorSat));

    return color;
  }
  `,
  );

export default function HomePage() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        shadows
        camera={{ position: [0, 0.15, 0.5], fov: 60, near: 0.001, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.CustomToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Cave />
        {/* <OrbitControls target={[0, 0.1, 0]} /> */}
        <CameraRig />
        <AnimatedPropsSquash />
        {/* <CameraDebug /> */}
      </Canvas>
    </div>
  );
}
