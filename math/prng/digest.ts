
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

const NULL_NUMBER = 34567849373
const UNDEFINED_NUMBER = 7743012743

const anyNext = (value: any) => {
  switch (typeof value) {
    case 'undefined': {
      next(UNDEFINED_NUMBER)
      break
    }
    case 'string': {
      for (let i = 0, max = value.length; i < max; i++) {
        next(value.charCodeAt(i))
      }
      break
    }
    case 'number': {
      next(value)
      break
    }
    case 'boolean': {
      next(value ? 0 : 1)
      break
    }
    case 'object': {
      if (value === null) {
        next(NULL_NUMBER)
      } else {
        const entries = Object.entries(value)
        entries.sort((a, b) => a[0] < b[0] ? -1 : 1)
        for (const [key, value2] of entries) {
          for (let i = 0, max = key.length; i < max; i++) {
            next(key.charCodeAt(i))
          }
          anyNext(value2)
        }
      }
      break
    }
  }
}

/**
 * Digest any value and return the result.
 * 
 * If the value is an object, the function will recursively iterate over any 
 * sub-entries and digest keys and values.
 * 
 * Key order does NOT affect the result (entries are sorted first).
 * 
 * Usage:
 * ```
 * digest.any(1, 2, 3) // 0.5850774045102298
 * digest.any({ x: { y: 3 }, foo: 'bar' }) // 0.27742494409903884
 * digest.any({ foo: 'bar', x: { y: 3 } }) // 0.27742494409903884
 * digest.any({ foo: 'bar', x: { y: 4 } }) // 0.27744742203503847
 * ```
 */
const any = (...args: any[]) => {
  init()
  const max = args.length
  for (let i = 0; i < max; i++) {
    const x = args[i]
    anyNext(x)
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
