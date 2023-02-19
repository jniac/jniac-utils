export const clamp01 = (x: number) => x < 0 ? 0 : x > 1 ? 1 : x
export const positiveModulo = (x: number, m: number) => (x %= m) > 0 ? x : x + m
export const to0xff = (x: number) => Math.max(0, Math.min(Math.floor(x * 0x100), 0xff))
export const toFF = (x: number) => to0xff(x).toString(16).padStart(2, '0')
export const lerpUnclamped = (a: number, b: number, alpha: number) => a + (b - a) * alpha

export const isHexFullString = (arg: any) => {
  if (typeof arg === 'string' && arg.startsWith('#')) {
    if (/^[a-f0-9]$/i.test(arg.slice(1))) {
      if (arg.length === 7
        || arg.length === 9) {
        return true
      }
    }
  }
  return false
}

export const isHexTripletString = (arg: any) => {
  if (typeof arg === 'string' && arg.startsWith('#')) {
    if (/^[a-f0-9]$/i.test(arg.slice(1))) {
      if (arg.length === 3
        || arg.length === 4) {
        return true
      }
    }
  }
  return false
}

export const isHexString = (arg: any) => {
  if (typeof arg === 'string' && arg.startsWith('#')) {
    if (/^[a-f0-9]$/i.test(arg.slice(1))) {
      if (arg.length === 4
        || arg.length === 5
        || arg.length === 7
        || arg.length === 9) {
        return true
      }
    }
  }
  return false
}

/**
 * "Short" linear interpolation using modulo. Kind of weird. Authorize interpolation 
 * over limit of a range (rotation, hue, etc).
 * 
 * Eg: 
 * - moduloShortLerp(350, 10, 360, t), for t from 0 to 1 will returns [350, 352, 354, 356, 358, 0, 2, 4, 6, 8, 10] 
 * - moduloShortLerp(10, 350, 360, t), for t from 0 to 1 will returns [10, 8, 6, 4, 2, 0, 358, 356, 354, 352, 350] 
 */
export const moduloShortLerp = (a: number, b: number, mod: number, alpha: number) => {
  let delta = b - a
  if (Math.abs(delta) > mod / 2) {
    if (delta < 0) {
      b += mod
    } else {
      a += mod
    }
    delta = b - a
  }
  return positiveModulo(a + delta * alpha, mod)
}

export const inout = (x: number, p: number = 3, i: number = 0.5) => {
  return (x < 0 ? 0 : x > 1 ? 1 : x < i
    ? 1 / Math.pow(i, p - 1) * Math.pow(x, p)
    : 1 - 1 / Math.pow(1 - i, p - 1) * Math.pow(1 - x, p)
  )
}
