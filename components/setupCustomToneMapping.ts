import { ShaderChunk } from "three";

const DEFAULT_CUSTOM_TONE_MAPPING =
  "vec3 CustomToneMapping( vec3 color ) { return color; }";

const PORTFOLIO_CUSTOM_TONE_MAPPING = `
  vec3 CustomToneMapping( vec3 color ) {
    // Higher brightness = brighter image; 1.0 means no extra boost.
    float brightness = 4.5;
    color *= toneMappingExposure * brightness;

    // Lower = punchier highlights; higher = softer highlight rolloff.
    float toneMapStrength = 1.0;
    color = color / (color + vec3(toneMapStrength));

    // Higher saturation = stronger colors; lower = more muted colors.
    float saturation = 0.75;
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luma), color, saturation);

    // Lower = more contrast; higher = flatter image.
    float contrast = 2.0;
    color = pow(color, vec3(contrast));

    return color;
  }
`;

if (ShaderChunk.tonemapping_pars_fragment.includes(DEFAULT_CUSTOM_TONE_MAPPING)) {
  ShaderChunk.tonemapping_pars_fragment =
    ShaderChunk.tonemapping_pars_fragment.replace(
      DEFAULT_CUSTOM_TONE_MAPPING,
      PORTFOLIO_CUSTOM_TONE_MAPPING,
    );
}
