
// export const distance = (x: number, y: number) => Math.sqrt(x * x + y * y)

export const sin01 = (x: number) => Math.sin(x * Math.PI * 2)

export const radian = (degree: number) => degree * Math.PI / 180
export const degree = (radian: number) => radian / Math.PI * 180

export const signed = (fn: (x: number) => number, x: number) => x < 0 ? -fn(-x) : fn(x)

// https://www.desmos.com/calculator/zq9kbt3xww?lang=fr
export const limitE = (x: number, max: number) => {
  x /= max
  const e = Math.exp(2 * x)
  return max * (2 * e / (e + 1) - 1)
}

// https://www.desmos.com/calculator/jrkunm5kdn?lang=fr
export const lateCosinus = (x: number, t = 0.5) => Math.cos(((1 + t) * x - t) * Math.PI / 2)

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

