import { colorKeywords } from './keywords'
import { Color, ColorToStringMode } from './Color'

/**
 * @public
 */
export type ParseOptions = Partial<{
  /** Are the hex triplet allowed? (eg: #fc0), in some use case hex triplet break are not desired. */
  allowHexTriplet: boolean
}>

type ParseResult = {
  ok: boolean
  mode: ColorToStringMode | null
  failReason?: string
}

export const parse = (
  str: string,
  color?: Color,
  {
    allowHexTriplet = true,
  }: ParseOptions = {},
): ParseResult => {
  str = str.trim()
  const ok = (mode: ColorToStringMode) => ({ ok: true, mode })
  const fail = (failReason: string) => ({ ok: false, mode: null, failReason })
  const nanSomewhere = (...values: number[]) => values.some(v => Number.isNaN(v))
  if (str in colorKeywords) {
    color?.fromHex(colorKeywords[str as keyof typeof colorKeywords])
    return ok('keywords')
  }
  const parseScalarComponent = (str: string) => {
    if (str.endsWith('%')) {
      return Number.parseFloat(str.slice(0, -1)) / 100
    } else {
      return Number.parseInt(str)
    }
  }
  const parseTripletComponent = (str: string) => {
    if (str.endsWith('%')) {
      return Number.parseFloat(str.slice(0, -1)) / 100
    } else if (str.endsWith('deg')) {
      return Number.parseFloat(str.slice(0, -1)) / 360
    } else {
      return Number.parseInt(str) / 0xff
    }
  }
  const parseCssTriplet = (str: string) => {
    // rgb(100% 10% 10%/.5)
    // rgb(255 25 25 / 75%)
    const [tripletStr, alphaStr = '1'] = str.split(/\s*\/\s*/)
    const [r, g, b] = tripletStr.split(/\s+/).map(parseTripletComponent)
    const a = parseScalarComponent(alphaStr)
    return [r, g, b, a]
  }
  if (str.startsWith('#')) {
    if (/^#[a-f0-9]+$/i.test(str) === false) {
      return fail('Invalid "hex" string (invalid characters)')
    }
    switch (str.length) {
      case 4:
      case 5: {
        if (allowHexTriplet === false) {
          return fail('Invalid "hex" string (hex triplet are not allowed)')
        }
        // https://en.wikipedia.org/wiki/Web_colors#Hex_triplet
        const [r, g, b, a] = [
          str.slice(1, 2),
          str.slice(2, 3),
          str.slice(3, 4),
          str.slice(4, 5) || 'f',
        ].map(x => Number.parseInt(`${x}${x}`, 16) / 0xff)
        color?.set(r, g, b, a)
        return ok('hex')
      }
      case 7:
      case 9: {
        const [r, g, b, a] = [
          str.slice(1, 3),
          str.slice(3, 5),
          str.slice(5, 7),
          str.slice(7, 9) || 'ff',
        ].map(x => Number.parseInt(x, 16) / 0xff)
        color?.set(r, g, b, a)
        return ok('hex')
      }
      default: {
        return fail('Invalid "hex" string (length mismatch)')
      }
    }
  }
  if (/^rgba?/.test(str)) {
    const [r, g, b, a] = parseCssTriplet(str.replace(/rgba?/, '').slice(1, -1))
    if (nanSomewhere(r, g, b, a)) {
      return fail('Invalid "rgb" string (NaN values)')
    } else {
      color?.set(r, g, b, a)
      return ok('glsl')
    }
  }
  if (/^hsla?/.test(str)) {
    const [h, s, l, a] = parseCssTriplet(str.replace(/hsla?/, '').slice(1, -1))
    if (nanSomewhere(h, s, l, a)) {
      return fail('Invalid "hsl" string (NaN values)')
    } else {
      color?.setHSL(h, s, l, a)
      return ok('glsl')
    }
  }
  if (str.startsWith('vec')) {
    const size = Number.parseInt(str.charAt(3))
    const rgba = str.slice(5, -1).split(/\s*,\s*/)
    if (rgba.length !== size) {
      return fail(`Invalid "glsl" string (size mismatch: "${str.slice(0, 4)}" vs ${rgba.length} elements)`)
    } else {
      const [r, g, b, a = 1] = rgba.map(v => Number.parseFloat(v))
      if (nanSomewhere(r, g, b, a)) {
        return fail('Invalid "glsl" string (NaN values)')
      } else {
        color?.set(r, g, b, a)
        return ok('glsl')
      }
    }
  }
  return {
    ok: false,
    mode: null,
    failReason: 'Invalid string',
  }
}
