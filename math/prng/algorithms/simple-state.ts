
type Algorithm = {
  /** Init the algorithm with a seed (optional). */
  init: (seed?: number) => number
  /** Get the next pseudo random number (unclamped). */
  next: (state: number) => number
  /** Map the returned numbers to the [0-1] range. */
  map: (state: number) => number
}

const algorithms = {

  /**
   * Used here, from the beginning, taken somewhere from [David Bau](https://github.com/davidbau/seedrandom).
   */
  'parkmiller-v1': (() => {
    const next = (n: number) => (n * 16807) % 0x7fffffff
    const init = (seed: number = 123456) => {
      seed %= 0x7fffffff
      seed += seed < 0 ? 0x7fffffff : 0
      seed = seed === 0 ? 1 : seed
      return next(seed)
    }
    const map = (n: number) => (n - 1) / 0x7ffffffe
    return { next, init, map } as Algorithm
  })(),

  /**
   * Park-Miller version iso compatible with the C equivalent:
   * ```c
   * uint32_t lcg_parkmiller(uint32_t *state) {
   *   return *state = (*state * 48271) & 0x7fffffff;
   * }
   * ```
   * This is possible because it uses `Math.imul` internally.
   * 
   * Tested over 1e9 first values.
   */
  'parkmiller-c-iso': (() => {
    const next = (state: number) => {
      state = Math.imul(state, 48271)
      state &= 0x7fffffff
      return state
    }
    const init = (seed: number = 123456) => {
      if (seed > 1 && seed < 0x7fffffff) {
        return seed & 0x7fffffff;
      }
      return 123456
    }
    const map = (n: number) => (n - 1) / 0x7ffffffe
    return { next, init, map } as Algorithm
  })(),

  /**
   * Quite good solution with a long period of 2_147_483_646 (7ffffffe).
   * 
   * The "next" method involves a division (modulo).
   */
  'parkmiller-v2': (() => {
    // const next = (n: number) => {
    //   // https://en.wikipedia.org/wiki/Lehme r_random_number_generator
    //   // No division, but instead an approximation 50% faster.
    //   n = Math.imul(n, 48271)
    //   n = (n & 0x7fffffff) + (n >> 31)
    //   return n
    // }
    const next = (n: number) => (n * 48271) % 0x7fffffff
    const init = (n: number = 123456) => {
      n %= 0x7fffffff
      if (n <= 0) {
        n += 0x7ffffffe
      }
      return next(next(n))
    }
    const inv = 1 / 0x7fffffff
    const map = (n: number) => n * inv
    return { next, init, map } as Algorithm
  })(),

  /**
   * From [Pierre Lecuyer](http://www.iro.umontreal.ca/~lecuyer/), found [here](https://gist.github.com/blixt/f17b47c62508be59987b?permalink_comment_id=2682175#gistcomment-2682175)
   * Quite short period of 2^24 (16_777_216, 0x1000000).
   */
  'lecuyer-24': (() => {
    const next = (n: number) => (n = Math.imul(741103597, n)) >>> 0
    const init = (n: number) => {
      n %= 0x100000000
      if (n <= 0) {
        n += 0x100000000 - 1
      }
      if (n < 1) {
        n *= 0x100000000
      }
    }
    const map = (n: number) => n / 0x100000000
    return { next, init, map } as Algorithm
  })(),

}

export type SimpleStateAlgorithmName = keyof typeof algorithms

export type SimpleStateAlgorithm = Algorithm

export const simpleStateAlgorithms: Record<SimpleStateAlgorithmName, SimpleStateAlgorithm> = algorithms

// import('./simple-state-test')


