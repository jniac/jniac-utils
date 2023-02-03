
type SimpleStatePRNGAlgorithm = {
  /** Init the algorithm with a seed (optional). */
  init: (seed?: number) => number
  /** Get the next pseudo random number (unclamped). */
  next: (state: number) => number
  /** Map the returned numbers to the [0-1] range. */
  map: (state: number) => number
}

export const algorithms = {

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
    return { next, init, map } as SimpleStatePRNGAlgorithm
  })(),

  /**
   * Quite good solution with a long period of 2_147_483_646 (7ffffffe).
   * 
   * The "next" method involves a division (modulo).
   */
  'parkmiller-v2': (() => {
    // const next = (n: number) => {
    //   // https://en.wikipedia.org/wiki/Lehmer_random_number_generator
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
    return { next, init, map } as SimpleStatePRNGAlgorithm
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
    return { next, init, map } as SimpleStatePRNGAlgorithm
  })(),

}

export type AlgorithmName = keyof typeof algorithms

// import('./simple-state-test')


