
export const clamp01 = (x: number) => x < 0 ? 0 : x > 1 ? 1 : x

export const clamp = (x: number, min = 0, max = 1) => x < min ? min : x > max ? max : x

export const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t)

export const inverseLerp = (a: number, b: number, t: number) => clamp01((t - a) / (b - a))

export const floor = (x: number, base = 1) => Math.floor(x / base) * base

export const ceil = (x: number, base = 1) => Math.ceil(x / base) * base

export const round = (x: number, base = 1) => Math.round(x / base) * base

export const distance = (x: number, y: number) => Math.sqrt(x * x + y * y)

export const sin01 = (x: number) => Math.sin(x * Math.PI * 2)

// https://en.wikipedia.org/wiki/Smoothstep
export const hermite01 = (x: number) => x * x * (3 - 2 * x)
// https://en.wikipedia.org/wiki/Smoothstep#Variations
export const hermiteSecond01 = (x: number) => x * x * x * (x * (x * 6 - 15) + 10)

export const pow2 = (x: number) => x * x
export const pow3 = (x: number) => x * x * x
export const pow4 = (x: number) => x * x * x * x
export const pow5 = (x: number) => x * x * x * x * x
export const pow6 = (x: number) => x * x * x * x * x * x

// https://www.desmos.com/calculator/chosfesws4
export const inout = (x:number, p: number = 3, i: number = 0.5) => {
  if (x < 0) return 0
  if (x > 1) return 1
  return (x < i
    ? 1 / Math.pow(i, p - 1) * Math.pow(x, p)
    : 1 - 1 / Math.pow(1 - i, p - 1) * Math.pow(1 - x, p)
  )
}

export const inout2 = (x: number) => {
  if (x < 0) return 0
  if (x > 1) return 1
  return (x < 0.5
    ? 2 * x * x
    : 1 - 2 * (x = 1 - x) * x
  )
}

export const inout3 = (x: number) => {
  if (x < 0) return 0
  if (x > 1) return 1
  return (x < 0.5
    ? 4 * x * x * x
    : 1 - 4 * (x = 1 - x) * x * x
  )
}

export const inout4 = (x: number) => {
  if (x < 0) return 0
  if (x > 1) return 1
  return (x < 0.5
    ? 8 * x * x * x * x
    : 1 - 8 * (x = 1 - x) * x * x * x
  )
}

export const inout5 = (x: number) => {
  if (x < 0) return 0
  if (x > 1) return 1
  return (x < 0.5
    ? 16 * x * x * x * x * x
    : 1 - 16 * (x = 1 - x) * x * x * x * x
  )
}

export const radian = (degree: number) => degree * Math.PI / 180
export const degree = (radian: number) => radian / Math.PI * 180

export const positiveModulo = (x: number, modulo: number) => {
  x %= modulo
  return x < 0 ? x + modulo : x
}

export const clampModulo = (x: number, min: number, max: number) => {
  const delta = max - min
  return min + positiveModulo(x - min, delta)
}

// https://github.com/mrdoob/three.js/blob/master/src/math/MathUtils.js#L133-L144
export const seededRandomMax = 2147483647
export const seededRandomDefaultSeed = 123456
export const seededRandomGenerator = (seed = seededRandomDefaultSeed) => {
  if (seed <= 0 || seed >= seededRandomMax) {
    throw new Error(`random seed must be between 1 & ${seededRandomMax - 1}`)
  }
  return () => {
    seed = seed * 16807 % seededRandomMax
    return (seed - 1) / (seededRandomMax - 1)
  }
}
