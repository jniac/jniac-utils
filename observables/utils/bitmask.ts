
const SIZE = 16

/**
 * Creates a mask with the given indexes set to 1.
 * The mask is a combination of flags (0 or 1) associated with a global mask
 * (only the flags covered by one should be considered). As the bitwise operation
 * in javascript are limited to size of an int, the max number of flags is 16
 * (16 bits for the flags, 16 for the mask)
 */
const mask = (...indexes: number[]) => {
  let x = 0
  for (const index of indexes) {
    x |= 1 << index
  }
  return (x << SIZE) | x
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
  return Array.from({ length: SIZE })
    .map((_, i) => {
      i = SIZE - 1 - i
      const mask = (maskedFlags & (1 << (i + SIZE))) === 0
      const flag = (maskedFlags & (1 << i)) !== 0
      return mask ? chars[0] : flag ? chars[2] : chars[1]
    })
    .join('')
}



const stateToString = (state: number) => state.toString(2).slice(-SIZE).padStart(SIZE, '0')



/**
 * Inverts the flags (and not the mask) 
 */
const invert = (x: number) => {
  const m = (x & 0b11111111111111110000000000000000) >> SIZE
  return (x & 0b11111111111111110000000000000000) | (~x & m)
}



const compare = (x: number, state: number) => {
  const m = (x & 0b11111111111111110000000000000000) >> SIZE
  const f = x & 0b1111111111111111
  return (state & m) === (f & m)
}



const apply = (x: number, state: number) => {
  const m = (x & 0b11111111111111110000000000000000) >> SIZE
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
