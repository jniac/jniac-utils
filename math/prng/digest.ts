
let state = 0

/**
 * Initialize the digest algorithm.
 */
const init = () => {
  state = 1073741823
  return digest
}

/**
 * Digest the new number.
 */
const next = (x: number) => {
  state += x
  state = Math.imul(state, 48271)
  state = (state & 0x7fffffff) + (state >> 31)
  return digest
}

/**
 * Returns the result of all previous digested numbers.
 */
const result = () => {
  return (state & 0x7fffffff) / 0x80000000
}

/**
 * Digests numbers and returns a unique, predictable number (hash).
 */
const numbers = (numbers: number[]) => {
  init()
  const max = numbers.length
  for (let i = 0; i < max; i++) {
    next(numbers[i])
  }
  return result()
}

/**
 * Digests a string and returns a unique, predictable number (hash).
 */
const string = (str: string) => {
  init()
  const max = str.length
  for (let i = 0; i < max; i++) {
    next(str.charCodeAt(i))
  }
  return result()
}

const any = (...args: any[]) => {
  init()
  const max = args.length
  for (let i = 0; i < max; i++) {
    const x = args[i]
    if (typeof x === 'number') {
      next(x)
    } else {
      const str = String(x)
      const strLength = str.length
      for (let j = 0; j < strLength; j++) {
        next(str.charCodeAt(j))
      }
    }
  }
  return result()
}

export const digest = {
  init,
  next,
  result,
  numbers,
  string,
  any,
}

import('./digest-test')
