import { clamp01, positiveModulo } from './utils'

const apply_cxm = (h: number, c: number, x: number, m: number, out = { r: 0, g: 0, b: 0 }) => {
  if (h < 1 / 6) {
    out.r = c
    out.g = x
    out.b = m
  } else if (h < 2 / 6) {
    out.r = x
    out.g = c
    out.b = m
  } else if (h < 3 / 6) {
    out.r = m
    out.g = c
    out.b = x
  } else if (h < 4 / 6) {
    out.r = m
    out.g = x
    out.b = c
  } else if (h < 5 / 6) {
    out.r = x
    out.g = m
    out.b = c
  } else {
    out.r = c
    out.g = m
    out.b = x
  }
}

export const hsl_to_rgb = (h: number, s: number, l: number, out = { r: 0, g: 0, b: 0 }) => {
  h = positiveModulo(h, 1)
  s = clamp01(s)
  l = clamp01(l)
  if (s === 0) {
    out.r = l
    out.g = l
    out.b = l
  } else {
    const _c = (1 - Math.abs(2 * l - 1)) * s
    const _x = _c * (1 - Math.abs((h * 6) % 2 - 1))
    const _m = l - _c / 2
    const c = clamp01(_c + _m)
    const x = clamp01(_x + _m)
    const m = clamp01(_m)
    apply_cxm(h, c, x, m, out)
  }
  return out
}

export const hsv_to_rgb = (h: number, s: number, v: number, out = { r: 0, g: 0, b: 0 }) => {
  h = positiveModulo(h, 1)
  s = clamp01(s)
  v = clamp01(v)
  const _c = v * s
  const _x = _c * (1 - Math.abs((h * 6) % 2 - 1))
  const _m = v - _c
  const c = clamp01(_c + _m)
  const x = clamp01(_x + _m)
  const m = clamp01(_m)
  apply_cxm(h, c, x, m, out)
  return out
}

export const rgb_to_hsl = (r: number, g: number, b: number, out = { h: 0, s: 0, l: 0 }) => {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let hue = 0
  let saturation = 0
  const lightness = (min + max) / 2.0
  if (min === max) {
    // Nothing! Let "hue" & "saturation" @ 0.
  } else {
    const delta = max - min
    saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min)
    switch (max) {
      case r: {
        hue = (g - b) / delta + (g < b ? 6 : 0)
        break
      }
      case g: {
        hue = (b - r) / delta + 2
        break
      }
      case b: {
        hue = (r - g) / delta + 4
        break
      }
    }
    hue /= 6
  }
  out.h = hue
  out.s = saturation
  out.l = lightness
  return out
}

export const rgb_to_hsv = (r: number, g: number, b: number, out = { h: 0, s: 0, v: 0 }) => {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let hue = 0
  let saturation = 0
  const value = max
  if (min === max) {
    // Nothing! Let "hue" & "saturation" @ 0.
  } else {
    const delta = max - min
    saturation = max === 0 ? 0 : delta / max
    switch (max) {
      case r: {
        hue = (g - b) / delta + (g < b ? 6 : 0)
        break
      }
      case g: {
        hue = (b - r) / delta + 2
        break
      }
      case b: {
        hue = (r - g) / delta + 4
        break
      }
    }
    hue /= 6
  }
  out.h = hue
  out.s = saturation
  out.v = value
  return out
}

export const rgb_to_grayscale = (r: number, g: number, b: number) => {
  return 0.21 * r + 0.72 * g + 0.07 * b
}
