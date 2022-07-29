
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

export const inout6 = (x: number) => {
  return (x < 0 ? 0 : x > 1 ? 1 : x < 0.5
    ? 32 * x * x * x * x * x * x
    : 1 - 32 * (x = 1 - x) * x * x * x * x * x
  )
}





// Signed alternatives:

export const signedHermite01 = (x: number) => x < 0 ? -hermite01(-x) : hermite01(x)
export const signedHermiteSecond01 = (x: number) => x < 0 ? -hermiteSecond01(-x) : hermiteSecond01(x)

export const signedPow2 = (x: number) => x < 0 ? -pow2(-x) : pow2(x)
export const signedPow3 = (x: number) => x < 0 ? -pow3(-x) : pow3(x)
export const signedPow4 = (x: number) => x < 0 ? -pow4(-x) : pow4(x)
export const signedPow5 = (x: number) => x < 0 ? -pow5(-x) : pow5(x)
export const signedPow6 = (x: number) => x < 0 ? -pow6(-x) : pow6(x)

export {
  signedPow2 as signedIn2,
  signedPow3 as signedIn3,
  signedPow4 as signedIn4,
  signedPow5 as signedIn5,
  signedPow6 as signedIn6,  
}

export const signedOut2 = (x: number) => x < 0 ? -out2(-x) : out2(x)
export const signedOut3 = (x: number) => x < 0 ? -out3(-x) : out3(x)
export const signedOut4 = (x: number) => x < 0 ? -out4(-x) : out4(x)
export const signedOut5 = (x: number) => x < 0 ? -out5(-x) : out5(x)
export const signedOut6 = (x: number) => x < 0 ? -out6(-x) : out6(x)

export const signedInout = (x:number, p: number = 3, i: number = 0.5) => x < 0 ? -inout(-x, p, i) : inout(x, p, i)

export const signedInout2 = (x: number) => x < 0 ? -inout2(-x) : inout2(x)
export const signedInout3 = (x: number) => x < 0 ? -inout3(-x) : inout3(x)
export const signedInout4 = (x: number) => x < 0 ? -inout4(-x) : inout4(x)
export const signedInout5 = (x: number) => x < 0 ? -inout5(-x) : inout5(x)
export const signedInout6 = (x: number) => x < 0 ? -inout6(-x) : inout6(x)
