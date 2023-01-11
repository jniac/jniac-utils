import { waitNextFrame } from '../../../misc'
import { createBooleanStore } from '../test/test-utils'
import { AlgorithmName, algorithms } from './simple-state'

class TestCheck {
  AVERAGE_STEP = 1e6;
  average = 0;
  averageCount = 0;
  averageSum = 0;
  averageStepCount = 0;
  count = BigInt(0);
  tables: Uint32Array[]
  constructor(size = [10, 100, 1000]) {
    this.tables = size.map(s => new Uint32Array(s))
  }
  record(n: number) {
    for (const table of this.tables) {
      const i = Math.floor(table.length * n)
      table[i]++
    }
    this.count++

    // average
    this.averageStepCount++
    this.averageSum += n
    if (this.averageStepCount === this.AVERAGE_STEP) {
      this.averageCount++
      const step = this.averageSum / this.AVERAGE_STEP
      const ac = this.averageCount
      this.average = this.average * (ac - 1) / ac + step / ac
      this.averageStepCount = 0
      this.averageSum = 0
    }
  }
}

/**
 * no collision over 2_147_000_000! 419ms (907.3s)
 * algorithms.ts:88 collision @2147483646: 1664377282
 */
const test = async (name: AlgorithmName, maxInt = 2 ** 32) => {

  const store = createBooleanStore(maxInt)

  const { next, map } = algorithms[name]
  let n = 123456
  let i = BigInt(0)
  const step = BigInt(1e6)
  let max = BigInt(0)
  let totalMs = 0
  const check = new TestCheck()
  Object.assign(window, { check })
  while (true) {
    await waitNextFrame()
    max += step
    const now = Date.now()
    let stepCollisionCount = 0
    for (i; i < max; i++) {
      n = next(n)
      if (n === 2292331840) {
        console.log(i)
      }
      if (store.get(n)) {
        console.log(`collision @${i}: ${n}`)
        stepCollisionCount++
        if (stepCollisionCount > 100) {
          return
        }
      } else {
        store.set(n, true)
      }
      check.record(map(n))
    }

    const ms = Date.now() - now
    totalMs += ms
    if (stepCollisionCount === 0) {
      console.log(`no collision over ${i.toLocaleString().split(/\s/).join('_')}! ${ms}ms (${(totalMs / 1000).toFixed(1)}s) av: ${check.average}`)
    }
  }
}

test('parkmiller-v2')
