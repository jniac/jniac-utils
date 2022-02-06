
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
