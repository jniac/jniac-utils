
export const clamp01 = (x: number) => x < 0 ? 0 : x > 1 ? 1 : x

export const clamp = (x: number, min = 0, max = 1) => x < min ? min : x > max ? max : x

export const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t)

export const lerpUnclamped = (a: number, b: number, t: number) => a + (b - a) * t

export const inverseLerp = (a: number, b: number, t: number) => clamp01((t - a) / (b - a))

export const inverseLerpUnclamped = (a: number, b: number, t: number) => (t - a) / (b - a)

export const remap = (inMin: number, inMax: number, outMin: number, outMax: number, x: number) => 
  lerp(outMin, outMax, inverseLerp(inMin, inMax, x))

export const remapUnclamped = (inMin: number, inMax: number, outMin: number, outMax: number, x: number) => 
  lerpUnclamped(outMin, outMax, inverseLerpUnclamped(inMin, inMax, x))

export const floor = (x: number, base = 1) => Math.floor(x / base) * base

export const ceil = (x: number, base = 1) => Math.ceil(x / base) * base

export const round = (x: number, base = 1) => Math.round(x / base) * base

/**
 * Return an always-positive-modulo, eg:
 * ```
 * positiveModulo(-10, 360) // -> 350
 * positiveModulo(370, 360) // -> 10 // of course
 * ```
 */
export const positiveModulo = (x: number, modulo: number) => {
  x %= modulo
  return x < 0 ? x + modulo : x
}

/**
 * Return an half-positive-half-negative-modulo, eg:
 * ```
 * middleModulo(190, 360) // -> -170
 * middleModulo(-190, 360) // -> 170
 * middleModulo(370, 360) // -> 10
 * ```
 */
 export const middleModulo = (x: number, modulo: number) => {
  x %= modulo
  return x < -modulo / 2 ? x + modulo : x > modulo / 2 ? x - modulo : x
}

export const clampModulo = (x: number, min: number, max: number) => {
  const delta = max - min
  return min + positiveModulo(x - min, delta)
}

