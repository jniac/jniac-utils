
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
  
  static random() {
    return new PRNG(PRNG.seedMax * Math.random())
  }
  
  next() {
    this.#seed = next(this.#seed)
    return map(this.#seed)
  }
  
  reset(seed = this.#initialSeed) {
    this.#initialSeed = seed
    this.#seed = init(seed)
  }

  static reset(seed = PRNG.seedDefault) {
    PRNG.#staticSeed = next(seed)
  }

  float() {
    return this.next()
  }

  static float({ seed = PRNG.#staticSeed } = {}) {
    PRNG.#staticSeed = next(seed)
    return map(PRNG.#staticSeed)
  }

  range(min = 0, max = 1, { power = 1 } = {}) {
    if (power === 1) {
      return min + (max - min) * this.next()
    }
    return min + (max - min) * (this.next() ** power)
  }
  
  static range(min = 0, max = 1, { seed = PRNG.seedDefault, power = 1 } = {}) {
    if (power === 1) {
      return min + (max - min) * PRNG.float({ seed })
    }
    return min + (max - min) * (PRNG.float({ seed }) ** power)
  }

  integer(min = 0, max = 100) {
    return Math.floor(min + (max - min) * this.next())
  }

  chance(p = 0.5) {
    return this.next() <= p
  }

  around({ from = 0, deviation = 1, power = 2 } = {}) {
    const value = this.next()
    return from + (value ** power) * deviation * (value * 100 % 2 > 1 ? 1 : -1) 
  }

  among<T = any>(array: T[]) {
    const index = this.integer(0, array.length)
    return array[index]
  }
}
