
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
  return delta === 0 ? 0 : min + positiveModulo(x - min, delta)
}

/**
 * "Short" linear interpolation using modulo. Kind of weird. Authorize interpolation 
 * over limit of a range (rotation, hue, etc).
 *
 * Eg (with t from 0 to 1): 
 * - moduloShortLerp(350, 10, 360, t) -> [350, 352, 354, 356, 358, 0, 2, 4, 6, 8, 10] 
 * - moduloShortLerp(10, 350, 360, t) -> [10, 8, 6, 4, 2, 0, 358, 356, 354, 352, 350] 
 */
export const moduloShortLerp = (a: number, b: number, mod: number, alpha: number) => {
  let delta = b - a
  if (Math.abs(delta) > mod) {
    if (delta < 0) {
      b += mod
    } else {
      a += mod
    }
    delta = b - a
  }
  return positiveModulo(a + b * alpha, mod)
}
