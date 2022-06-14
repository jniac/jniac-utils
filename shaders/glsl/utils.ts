export const glsl_utils = /* glsl */`

  float clamp01(float x) {
    return x < 0.0 ? 0.0 : x > 1.0 ? 1.0 : x;
  }
  
  float inverseLerp(float a, float b, float x) {
    return (x - a) / (b - a);
  }

`