
// export const distance = (x: number, y: number) => Math.sqrt(x * x + y * y)

export const sin01 = (x: number) => Math.sin(x * Math.PI * 2)

export const radian = (degree: number) => degree * Math.PI / 180
export const degree = (radian: number) => radian / Math.PI * 180

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

