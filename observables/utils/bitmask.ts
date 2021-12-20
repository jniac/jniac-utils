
/**
 * Creates a mask with the given indexes set to 1.
 */
const mask = (...indexes: number[]) => {
  let x = 0
  for (const index of indexes) {
    x |= 1 << index
  }
  return (x << 16) | x
}



/**
 * Converts a mask to a string representation. 
 * 
 * Eg: 
 * ```
 * maskToString(mask(3) | invert(mask(2))) //
 * ```
 */
 const maskToString = (maskedFlags: number, chars = '-01') => {
  return Array.from({ length: 16 })
    .map((_, i) => {
      i = 16 - 1 - i
      const mask = (maskedFlags & (1 << (i + 16))) === 0
      const flag = (maskedFlags & (1 << i)) !== 0
      return mask ? chars[0] : flag ? chars[2] : chars[1]
    })
    .join('')
}



const stateToString = (state: number) => state.toString(2).slice(-16).padStart(16, '0')



/**
 * Inverts the flags (and not the mask) 
 */
const invert = (x: number) => {
  const m = (x & 0b11111111111111110000000000000000) >> 16
  return (x & 0b11111111111111110000000000000000) | (~x & m)
}



const compare = (x: number, state: number) => {
  const m = (x & 0b11111111111111110000000000000000) >> 16
  const f = x & 0b1111111111111111
  return (state & m) === (f & m)
}



const apply = (x: number, state: number) => {
  const m = (x & 0b11111111111111110000000000000000) >> 16
  const f = x & 0b1111111111111111
  return (state & ~m) | (f & m)
}



export const bitmask = {
  mask,
  maskToString,
  stateToString,
  invert,
  compare,
  apply,
}

export const createEnum = <T>(callback: (tools: (typeof bitmask)) => T) => callback(bitmask)
