export const glsl_utils = /* glsl */`

  float inverseLerp(float a, float b, float x) {
    return (x - a) / (b - a);
  }

`