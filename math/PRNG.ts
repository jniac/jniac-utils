
const next = (seed: number) => seed * 16807 % 2147483647

const map = (seed: number) => (seed - 1) / 2147483646

const init = (initialSeed: number) => {
  initialSeed %= 2147483647
  initialSeed += initialSeed < 0 ? 2147483647 : 0
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
    PRNG.#staticSeed = next(seed)
    return PRNG
  }

  reset(seed = this.#initialSeed) {
    this.#initialSeed = seed
    this.#seed = init(seed)
    return this
  }

  static float({ seed = PRNG.#staticSeed } = {}) {
    PRNG.#staticSeed = next(seed)
    return map(PRNG.#staticSeed)
  }

  float() {
    this.#seed = next(this.#seed)
    return map(this.#seed)
  }

  static range(min = 0, max = 1, { seed = PRNG.seedDefault, power = 1 } = {}) {
    if (power === 1) {
      return min + (max - min) * PRNG.float({ seed })
    }
    return min + (max - min) * (PRNG.float({ seed }) ** power)
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

  static item<T = any>(array: T[]) {
    const index = PRNG.integer(0, array.length)
    return array[index]
  }

  item<T = any>(array: T[]) {
    const index = this.integer(0, array.length)
    return array[index]
  }
}
