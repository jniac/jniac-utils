import { rgb_to_hsl, rgb_to_hsv, hsl_to_rgb, hsv_to_rgb, rgb_to_grayscale } from './conversion'
import { hexToKeywords } from './keywords'
import { parse, ParseOptions } from './parse'
import { clamp01, isHexFullString, isHexString, isHexTripletString, lerpUnclamped, moduloShortLerp, positiveModulo, to0xff, toFF } from './utils'

export type { ParseOptions as ColorParseOptions }

export type ColorDeclaration =
  | string 
  | number 
  | { r: number; g: number; b: number; a?: number } 
  | { h: number; s: number; l: number; a?: number } 
  | { h: number; s: number; v: number; a?: number }

/**
 * @public
 */
export type ColorToStringMode = 'hex' | 'rgb' | 'hsl' | 'glsl' | 'keywords'

/**
 * @public
 * Should the string contain alpha information?
 * - `auto` : it depends from the alpha value (if different from 1.0)
 * - `never` : never
 * - `always` : always
 */
export type ColorToStringAlphaMode = 'auto' | 'never' | 'always'

/**
 * Utility class that represents a color (rgba + hsl / hsv).
 * `r, g, b, a` values are between 0 and 1.
 * @public
 */
export class Color {
  r = 1
  g = 1
  b = 1
  a = 1

  hsl = {
    h: 0,
    s: 1,
    l: 1,
  }

  hsv = {
    h: 0,
    s: 0,
    v: 1,
  }

  constructor(arg?: Parameters<Color['from']>[0]) {
    if (arg) {
      this.from(arg)
    }
  }

  isEquivalent(other: Color) {
    return (
      this.r === other.r
      && this.g === other.g
      && this.b === other.b
      && this.a === other.a
    )
  }

  copy(other: Color) {
    this.r = other.r
    this.g = other.g
    this.b = other.b
    this.a = other.a
    this.hsl.h = other.hsl.h
    this.hsl.s = other.hsl.s
    this.hsl.l = other.hsl.l
    this.hsv.h = other.hsv.h
    this.hsv.s = other.hsv.s
    this.hsv.v = other.hsv.v
    return this
  }

  clone() {
    return new Color().copy(this)
  }

  set(r: number, g: number, b: number, a = 1) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
    rgb_to_hsl(this.r, this.g, this.b, this.hsl)
    rgb_to_hsv(this.r, this.g, this.b, this.hsv)
    return this
  }

  /**
   * h,s,l ranges are [0.0, 1.0]
  */
  setHSL(h: number, s: number, l: number, a = 1) {
    h = positiveModulo(h, 1)
    s = clamp01(s)
    l = clamp01(l)
    this.hsl.h = h
    this.hsl.s = s
    this.hsl.l = l
    this.a = a
    hsl_to_rgb(h, s, l, this)
    rgb_to_hsv(this.r, this.g, this.b, this.hsv)
    return this
  }

  /**
   * h,s,l ranges are [0.0, 1.0]
  */
  setHSV(h: number, s: number, v: number, a = 1) {
    h = positiveModulo(h, 1)
    s = clamp01(s)
    v = clamp01(v)
    this.hsv.h = h
    this.hsv.s = s
    this.hsv.v = v
    this.a = a
    hsv_to_rgb(h, s, v, this)
    rgb_to_hsl(this.r, this.g, this.b, this.hsl)
    return this
  }

  fromHex(hex: number) {
    hex = Math.floor(hex)
    const r = ((hex >> 16) & 0xff) / 0xff
    const g = ((hex >> 8) & 0xff) / 0xff
    const b = (hex & 0xff) / 0xff
    return this.set(r, g, b)
  }

  fromCss(str: string) {
    str = str.trim().toLowerCase()
    if (isHexFullString(str)) {
      str = str.replace('#', '')
      const [r, g, b, a = 1] = [
        str.slice(0, 2),
        str.slice(2, 4),
        str.slice(4, 6),
        str.slice(6, 8) || 'ff',
      ].map(x => Number.parseInt(x, 16) / 0xff)
      return this.set(r, g, b, a)
    }
    // https://en.wikipedia.org/wiki/Web_colors#Hex_triplet
    if (isHexTripletString(str)) {
      const [r, g, b, a = 1] = str.replace('#', '').split('').map(x => Number.parseInt(`${x}${x}`, 16) / 0xff)
      return this.set(r, g, b, a)
    }
    if (str.startsWith('rgb(') && str.endsWith(')')) {
      str = str.slice(4, -1)
      const map = (x: string, index: number) => {
        let n = Number.parseFloat(x)
        if (x.endsWith('%')) {
          n /= 100
        } else {
          if (index < 3) {
            n /= 0xff
          }
        }
        return n
      }
      /* handling:
        rgb(31, 120, 50)
        rgb(30%, 20%, 50%)
        rgb(255, 122, 127, 80%)
        rgb(255, 122, 127, .8)
      */
      if (/\d+%?\s*,\s*\d+%?\s*,\s*\d+%?.*/.test(str)) {
        const [r, g, b, a = 1] = str.split(/\s*,\s*/).map(map)
        return this.set(r, g, b, a)
      }
      /* handling:
        rgb(255 122 127 / 20%)
        rgb(255 122 127 / .2)
      */
      if (/\d+%? \d+%? \d+%?.*/.test(str)) {
        const [r, g, b, a = 1] = str.split(/[\s/]+/).map(map)
        return this.set(r, g, b, a)
      }
      throw new Error(`Unsupported RGB string format: "${str}"`)
    }
    throw new Error(`Unsupported string format: "${str}"`)
  }

  parse(str: string, options?: ParseOptions) {
    const { ok, failReason } = parse(str, this, options)
    if (ok === false) {
      throw new Error(failReason)
    }
    return this
  }

  from(arg: ColorDeclaration) {
    switch (typeof arg) {
      case 'string': {
        return this.parse(arg)
      }
      case 'number': {
        return this.fromHex(arg)
      }
      case 'object': {
        if ('r' in arg) {
          return this.set(arg.r, arg.g, arg.b, arg.a)
        }
        if ('h' in arg) {
          if ('l' in arg) {
            return this.setHSL(arg.h, arg.s, arg.l, arg.a)
          } else {
            return this.setHSL(arg.h, arg.s, arg.v, arg.a)
          }
        }
      }
    }
    throw new Error(`Invalid argument: ${arg}`)
  }

  lerpColors(color1: Color, color2: Color, alpha: number, mode: 'rgb' | 'hsl' | 'hsv' = 'rgb') {
    switch (mode) {
      case 'rgb': {
        const r = lerpUnclamped(color1.r, color2.r, alpha)
        const g = lerpUnclamped(color1.g, color2.g, alpha)
        const b = lerpUnclamped(color1.b, color2.b, alpha)
        const a = lerpUnclamped(color1.a, color2.a, alpha)
        this.set(r, g, b, a)
        break
      }
      case 'hsl': {
        const h = moduloShortLerp(color1.hsl.h, color2.hsl.h, 1, alpha)
        const s = lerpUnclamped(color1.hsl.s, color2.hsl.s, alpha)
        const l = lerpUnclamped(color1.hsl.l, color2.hsl.l, alpha)
        const a = lerpUnclamped(color1.a, color2.a, alpha)
        this.setHSL(h, s, l, a)
        break
      }
      case 'hsv': {
        const h = moduloShortLerp(color1.hsv.h, color2.hsv.h, 1, alpha)
        const s = lerpUnclamped(color1.hsv.s, color2.hsv.s, alpha)
        const v = lerpUnclamped(color1.hsv.v, color2.hsv.v, alpha)
        const a = lerpUnclamped(color1.a, color2.a, alpha)
        this.setHSV(h, s, v, a)
        break
      }
      default: {
        throw new Error(`Invalid mode: "${mode}"`)
      }
    }
    return this
  }

  hueShift(delta: number) {
    const { h, s, l } = this.hsl
    return this.setHSL(positiveModulo(h + delta, 1), s, l)
  }

  setSaturation(value: number) {
    const { h, l } = this.hsl
    return this.setHSL(h, value, l)
  }

  negate(mode: 'rgb' | 'hsl' | 'hsv' = 'rgb') {
    switch (mode) {
      case 'rgb': {
        return this.set(1 - this.r, 1 - this.g, 1 - this.b)
      }
      case 'hsl': {
        const { h, s, l } = this.hsl
        return this.setHSL((h + .5) % 1, 1 - s, 1 - l)
      }
      case 'hsv': {
        const { h, s, v } = this.hsv
        return this.setHSV((h + .5) % 1, 1 - s, 1 - v)
      }
      default: {
        throw new Error(`Invalid mode: "${mode}"`)
      }
    }
  }

  opposite() {
    let { h, s, l } = this.hsl
    h = (h + .5) % 1
    l = l > .5 ? l - .5 : l + .5
    return this.setHSL(h, s, l)
  }

  toColor32(out = { r: 0, g: 0, b: 0, a: 1 }) {
    let { r, g, b, a } = this
    out.r = to0xff(r)
    out.g = to0xff(g)
    out.b = to0xff(b)
    out.a = to0xff(a)
    return out
  }

  toGrayscale() {
    return rgb_to_grayscale(this.r, this.g, this.b)
  }

  toGrayscaleCss() {
    const channel = to0xff(this.toGrayscale()).toString(16).padStart(2, '0')
    return `#${channel}${channel}${channel}`
  }

  toHex() {
    return (to0xff(this.r) << 16) + (to0xff(this.g) << 8) + to0xff(this.b)
  }

  toCss({ includeAlpha = 'auto' as ColorToStringAlphaMode } = {}) {
    return this.toHexString()
  }

  toGlslString({
    includeAlpha = 'auto' as ColorToStringAlphaMode,
    precision = 2,
  } = {}) {
    return includeAlpha === 'always' || (includeAlpha === 'auto' && this.a < 1)
      ? `vec4(${this.r.toFixed(precision)}, ${this.g.toFixed(precision)}, ${this.b.toFixed(precision)}, ${this.a.toFixed(precision)})`
      : `vec3(${this.r.toFixed(precision)}, ${this.g.toFixed(precision)}, ${this.b.toFixed(precision)})`
  }

  /**
   * Returns a string beginning with '#' (eg: #ff9900)
   */
  toHexString({
    includeAlpha = 'auto' as ColorToStringAlphaMode,
  } = {}) {
    return includeAlpha === 'always' || (includeAlpha === 'auto' && this.a < 1)
      ? `#${toFF(this.r)}${toFF(this.g)}${toFF(this.b)}${toFF(this.a)}`
      : `#${toFF(this.r)}${toFF(this.g)}${toFF(this.b)}`
  }

  toRgbString({
    includeAlpha = 'auto' as ColorToStringAlphaMode,
  } = {}) {
    const { r, g, b, a } = this
    return includeAlpha === 'always' || (includeAlpha === 'auto' && a < 1)
      ? `rgb(${to0xff(r)} ${to0xff(g)} ${to0xff(b)} / ${(a * 100).toFixed(0)}%)`
      : `rgb(${to0xff(r)} ${to0xff(g)} ${to0xff(b)})`
  }

  toHslString({
    includeAlpha = 'auto' as ColorToStringAlphaMode,
  } = {}) {
    const { a } = this
    const { h, s, l } = this.hsl
    return includeAlpha === 'always' || (includeAlpha === 'auto' && a < 1)
      ? `hsl(${(h * 360).toFixed(0)}deg ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}% / ${(a * 100).toFixed(0)}%)`
      : `hsl(${(h * 360).toFixed(0)}deg ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%)`
  }

  toString({
    mode = 'hex' as ColorToStringMode,
    includeAlpha = 'auto' as ColorToStringAlphaMode,
  } = {}) {
    switch (mode) {
      case 'hex': return this.toHexString({ includeAlpha })
      case 'glsl': return this.toGlslString({ includeAlpha })
      case 'rgb': return this.toRgbString({ includeAlpha })
      case 'hsl': return this.toHslString({ includeAlpha })
      case 'keywords': return hexToKeywords(this.toHex()) ?? this.toHexString({ includeAlpha: 'never' })
      default: {
        throw new Error(`toString invalid mode "${mode}"`)
      }
    }
  }

  // STATIC:
  static from(arg: ColorDeclaration, alphaOverride?: number): Color
  static from(r: number, g: number, b: number, a: number): Color
  static from(...args: any[]) {
    const color = new Color()
    if (args.length >= 3) {
      color.set.apply(color, args as any)
    } else {
      const [colorDeclaration, alphaOverride] = args
      color.from(colorDeclaration)
      if (alphaOverride !== undefined) {
        color.a = alphaOverride
      }
    }
    return color
  }

  static toHexString(color: ColorDeclaration): string {
    return isHexString(color) ? color as string : _color1.from(color).toHexString()
  }
  
  static lerp(color1: ColorDeclaration, color2: ColorDeclaration, alpha: number, out = new Color()): Color {
    return out.lerpColors(_color1.from(color1), _color2.from(color2), alpha)
  }
}

const _color1 = new Color()
const _color2 = new Color()
