
// https://en.wikipedia.org/wiki/Smoothstep
export const hermite01 = (x: number) => x * x * (3 - 2 * x)

// https://en.wikipedia.org/wiki/Smoothstep#Variations
export const hermiteSecond01 = (x: number) => x * x * x * (x * (x * 6 - 15) + 10)

export const pow2 = (x: number) => x * x
export const pow3 = (x: number) => x * x * x
export const pow4 = (x: number) => x * x * x * x
export const pow5 = (x: number) => x * x * x * x * x
export const pow6 = (x: number) => x * x * x * x * x * x

export {
  pow2 as in2,
  pow3 as in3,
  pow4 as in4,
  pow5 as in5,
  pow6 as in6,
}

export const out2 = (x: number) => 1 - (x = 1 - x) * x
export const out3 = (x: number) => 1 - (x = 1 - x) * x * x
export const out4 = (x: number) => 1 - (x = 1 - x) * x * x * x
export const out5 = (x: number) => 1 - (x = 1 - x) * x * x * x * x
export const out6 = (x: number) => 1 - (x = 1 - x) * x * x * x * x * x

// https://www.desmos.com/calculator/chosfesws4
export const inout = (x:number, p: number = 3, i: number = 0.5) => {
  return (x < 0 ? 0 : x > 1 ? 1 : x < i
    ? 1 / Math.pow(i, p - 1) * Math.pow(x, p)
    : 1 - 1 / Math.pow(1 - i, p - 1) * Math.pow(1 - x, p)
  )
}

export const inout2 = (x: number) => {
  return (x < 0 ? 0 : x > 1 ? 1 : x < 0.5
    ? 2 * x * x
    : 1 - 2 * (x = 1 - x) * x
  )
}

export const inout3 = (x: number) => {
  return (x < 0 ? 0 : x > 1 ? 1 : x < 0.5
    ? 4 * x * x * x
    : 1 - 4 * (x = 1 - x) * x * x
  )
}

export const inout4 = (x: number) => {
  return (x < 0 ? 0 : x > 1 ? 1 : x < 0.5
    ? 8 * x * x * x * x
    : 1 - 8 * (x = 1 - x) * x * x * x
  )
}

export const inout5 = (x: number) => {
  return (x < 0 ? 0 : x > 1 ? 1 : x < 0.5
    ? 16 * x * x * x * x * x
    : 1 - 16 * (x = 1 - x) * x * x * x * x
  )
}
