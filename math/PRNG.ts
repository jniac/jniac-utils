
const next = (seed: number) => seed * 16807 % 2147483647

const map = (seed: number) => (seed - 1) / 2147483646

const init = (initialSeed: number) => {
  initialSeed %= 2147483647
  initialSeed += initialSeed < 0 ? 2147483647 : 0
  initialSeed = initialSeed === 0 ? 1 : initialSeed
  return next(initialSeed)
}

const stringToSeed = (str: string) => {
  let seed = init(PRNG.seedDefault)
  for (let i = 0, max = str.length; i < max; i++) {
    seed = seed * str.charCodeAt(i) % 2147483647
  }
  return seed
}

type ShuffeOptions = Partial<{
  /** Should the array be duplicated? Default is false. */
  duplicate: boolean
}>

export class PRNG {
  static seedMax = 2147483647
  static seedDefault = 123456
  static #staticSeed: number = PRNG.seedDefault

  static get seed() { return this.#staticSeed }

  #initialSeed: number
  #seed: number

  constructor(seed = PRNG.seedDefault) {
    this.#initialSeed = seed
    this.#seed = init(seed)
  }

  static resetByInt(seed = PRNG.seedDefault) {
    PRNG.#staticSeed = init(seed)
    return PRNG
  }

  resetByInt(seed = this.#initialSeed) {
    this.#initialSeed = seed
    this.#seed = init(seed)
    return this
  }

  static resetByFloat(seed = .5) {
    return PRNG.resetByInt(2147483647 * Math.abs(seed % 1))
  }

  resetByFloat(seed = .5) {
    return this.resetByInt(2147483647 * Math.abs(seed % 1))
  }

  static resetByString(str: string) {
    return PRNG.resetByInt(stringToSeed(str))
  }

  resetByString(str: string) {
    return this.resetByInt(stringToSeed(str))
  }

  /**
   * @deprecated resetByString() should be preferred.
   */
  static stringReset(str: string) {
    return PRNG.resetByString(str)
  }

  /**
   * @deprecated resetByString() should be preferred.
   */
  stringReset(str: string) {
    return this.resetByString(str)
  }

  static randomReset() {
    return PRNG.resetByInt(2147483647 * Math.random())
  }

  randomReset() {
    return this.resetByInt(2147483647 * Math.random())
  }

  /**
   * Resets the current seed according to the provided argument. Internally this 
   * will call "resetByInt", "resetByFloat" or "resetByString" depending on the 
   * argument. 
   */
  static reset(seed: number | string) {
    if (typeof seed === 'string') {
      return PRNG.resetByString(seed)
    } else {
      if (seed < 1) {
        return PRNG.resetByFloat(seed)
      } else {        
        return PRNG.resetByInt(seed)
      }
    }
  }

  /**
   * Resets the current seed according to the provided argument. Internally this 
   * will call "resetByInt", "resetByFloat" or "resetByString" depending on the 
   * argument. 
   */
  reset(seed: number | string) {
    if (typeof seed === 'string') {
      return this.resetByString(seed)
    } else {
      if (seed < 1) {
        return this.resetByFloat(seed)
      } else {        
        return this.resetByInt(seed)
      }
    }
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

  /**
   * Returns a integer between min (inclusive) & max (exclusive) 
   */
  static integer(min = 0, max = 100) {
    return Math.floor(min + (max - min) * PRNG.float())
  }

  /**
   * Returns a integer between min (inclusive) & max (exclusive) 
   */
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

  /**
   * Shuffles the array.
   * 
   * Note: By default, the given array is modified. Use the "duplicate" option 
   * to keep the array untouched.
   */
  static shuffle<T = any>(array: T[], { duplicate = false }: ShuffeOptions = {}) {
    const result = duplicate ? [...array] : array
    for (let i = 0, max = array.length; i < max; i++) {
      const index = Math.floor(PRNG.float() * max)
      const tmp = result[index]
      result[index] = result[i]
      result[i] = tmp
    }
    return result
  }

  /**
   * Shuffles the array.
   * 
   * Note: By default, the given array is modified. Use the "duplicate" option 
   * to keep the array untouched.
   */
   shuffle<T = any>(array: T[], { duplicate = false }: ShuffeOptions = {}) {
    const result = duplicate ? [...array] : array
    for (let i = 0, max = array.length; i < max; i++) {
      const index = Math.floor(this.float() * max)
      const tmp = result[index]
      result[index] = result[i]
      result[i] = tmp
    }
    return result
  }

  static item<T>(items: ArrayLike<T>) {
    const index = PRNG.integer(0, items.length)
    return items[index]
  }

  item<T>(items: ArrayLike<T>) {
    const index = this.integer(0, items.length)
    return items[index]
  }

  /**
   * Returns an random item according to its weight.
   * 
   * The "weight" information is retrieved via a delegate. 
   * 
   * By default the delegate will extract any existing "weight" property or use "1":
   * ```
   * (obj: any) => obj.weight ?? 1
   * ```
   */
  static itemWithWeight<T>(items: ArrayLike<T>, weightDelegate: (item: T) => number = (obj: any) => obj.weight ?? 1) {
    const { length } = items
    let cumulWeight = 0
    const cumulWeights = new Array(length)
    for (let i = 0; i < length; i++) {
      cumulWeight += weightDelegate(items[i])
      cumulWeights[i] = cumulWeight
    }
    const random = PRNG.float() * cumulWeight
    for (let i = 0; i < length; i++) {
      if (cumulWeights[i] >= random) {
        return items[i]
      }
    }
    throw new Error(`This can't be.`)
  }

  static hash(length = 16, alphabet = '0123456789abcedf') {
    return Array.from({ length }).map(() => PRNG.item(alphabet)).join('')
  }

  hash(length = 16, alphabet = '0123456789abcedf') {
    return Array.from({ length }).map(() => this.item(alphabet)).join('')
  }

  static encode(array: string, option?: { seed: number }): string
  static encode<T = any>(array: T[], option?: { seed: number }): T[]
  static encode(array: any, { seed = PRNG.seedDefault } = {}) {
    if (typeof array === 'string') {
      return PRNG.encode([...array], { seed }).join('')
    }

    const previous = PRNG.#staticSeed

    PRNG.resetByInt(seed)
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
    PRNG.#staticSeed = previous

    return result
  }

  static decode(array: string, option?: { seed: number }): string
  static decode<T = any>(array: T[], option?: { seed: number }): T[]
  static decode(array: any, { seed = PRNG.seedDefault } = {}) {
    if (typeof array === 'string') {
      return PRNG.decode([...array], { seed }).join('')
    }

    const previous = PRNG.#staticSeed
    PRNG.resetByInt(seed)
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

    return result
  }
}
