
const next = (seed: number) => seed * 16807 % 2147483647

const map = (seed: number) => (seed - 1) / 2147483646

const init = (initialSeed: number) => {
  initialSeed %= 2147483647
  initialSeed += initialSeed < 0 ? 2147483647 : 0
  initialSeed = initialSeed === 0 ? 1 : initialSeed
  return next(initialSeed)
} 

export class PRNG {
  static seedMax = 2147483647
  static seedDefault = 123456
  static #staticSeed: number = PRNG.seedDefault

  #initialSeed: number
  #seed: number

  constructor(seed = PRNG.seedDefault) {
    this.#initialSeed = seed
    this.#seed = init(seed)
  }
  
  static reset(seed = PRNG.seedDefault) {
    PRNG.#staticSeed = init(seed)
    return PRNG
  }

  reset(seed = this.#initialSeed) {
    this.#initialSeed = seed
    this.#seed = init(seed)
    return this
  }

  static randomReset() {
    return PRNG.reset(2147483647 * Math.random())
  }

  randomReset() {
    return this.reset(2147483647 * Math.random())
  }

  static float() {
    PRNG.#staticSeed = next(PRNG.#staticSeed)
    return map(PRNG.#staticSeed)
  }

  float() {
    this.#seed = next(this.#seed)
    return map(this.#seed)
  }

  static range(min = 0, max = 1, { power = 1 } = {}) {
    if (power === 1) {
      return min + (max - min) * PRNG.float()
    }
    return min + (max - min) * (PRNG.float() ** power)
  }

  range(min = 0, max = 1, { power = 1 } = {}) {
    if (power === 1) {
      return min + (max - min) * this.float()
    }
    return min + (max - min) * (this.float() ** power)
  }

  static integer(min = 0, max = 100) {
    return Math.floor(min + (max - min) * PRNG.float())
  }
  
  integer(min = 0, max = 100) {
    return Math.floor(min + (max - min) * this.float())
  }

  static chance(p = 0.5) {
    return PRNG.float() <= p
  }

  chance(p = 0.5) {
    return this.float() <= p
  }

  static around({ from = 0, deviation = 1, power = 2 } = {}) {
    const value = PRNG.float()
    return from + (value ** power) * deviation * (value * 100 % 2 > 1 ? 1 : -1) 
  }

  around({ from = 0, deviation = 1, power = 2 } = {}) {
    const value = this.float()
    return from + (value ** power) * deviation * (value * 100 % 2 > 1 ? 1 : -1) 
  }

  static shuffle<T = any>(array: T[], { duplicate = false } = {}) {
    const result = duplicate ? [...array] : array
    for (let i = 0, max = array.length; i < max; i++) {
      const index = Math.floor(PRNG.float() * max)
      const tmp = result[index]
      result[index] = result[i]
      result[i] = tmp 
    }
    return result
  }

  shuffle<T = any>(array: T[], { duplicate = false } = {}) {
    const result = duplicate ? [...array] : array
    for (let i = 0, max = array.length; i < max; i++) {
      const index = Math.floor(this.float() * max)
      const tmp = result[index]
      result[index] = result[i]
      result[i] = tmp 
    }
    return result
  }

  static item<T = any>(array: T[]) {
    const index = PRNG.integer(0, array.length)
    return array[index]
  }

  item<T = any>(array: T[]) {
    const index = this.integer(0, array.length)
    return array[index]
  }

  

  static encode(array: string, option?: { seed: number }): string
  static encode<T = any>(array: T[], option?: { seed: number }): T[]
  static encode(array: any, { seed = PRNG.seedDefault } = {}) {
    const previous = PRNG.#staticSeed
    PRNG.reset(seed)
    
    if (typeof array === 'string') {
      return PRNG.encode([...array]).join('')
    }
    const COUNT = Math.min(array.length, 20)
    const random = Array.from({ length: COUNT }).map(() => PRNG.float())
    const result = [...array]
    for (let i = 0, max = array.length; i < max; i++) {
      const index = Math.floor(random[i % COUNT] * max)
      const tmp = result[index]
      result[index] = result[i]
      result[i] = tmp
    }

    // Restore previous seed
    PRNG.reset(previous)

    return result
  }

  static decode(array: string, option?: { seed: number }): string
  static decode<T = any>(array: T[], option?: { seed: number }): T[]
  static decode(array: any, { seed = PRNG.seedDefault } = {}) {
    const previous = PRNG.#staticSeed
    PRNG.reset(seed)
    
    if (typeof array === 'string') {
      return PRNG.decode([...array]).join('')
    }
    const COUNT = Math.min(array.length, 20)
    const random = Array.from({ length: COUNT }).map(() => PRNG.float())
    const result = [...array]
    for (let max = array.length, i = max - 1; i >= 0; i--) {
      const index = Math.floor(random[i % COUNT] * max)
      const tmp = result[index]
      result[index] = result[i]
      result[i] = tmp
    }

    // Restore previous seed
    PRNG.#staticSeed = previous
    PRNG.reset(previous)

    return result
  }
}
