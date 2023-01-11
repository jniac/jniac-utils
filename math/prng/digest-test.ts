import { waitNextFrame } from '../../misc'
import { digest } from './digest'
import { createBooleanStore } from './test/test-utils'

const createFloatStore = (count = 2 ** 32) => {
  const len = count / 64
  const buffer = new ArrayBuffer(8)
  const float64 = new Float64Array(buffer)
  const uint64 = new BigUint64Array(buffer)
  const array = new BigInt64Array(len)
  const bi0 = BigInt(0)
  const bi1 = BigInt(1)
  const bi64 = BigInt(64)
  let index = 0
  let offset = BigInt(0)
  const computeIndexAndOffset = (value: number) => {
    float64[0
    ] = value
    const bigIndex = uint64[0]
    const i = bigIndex / bi64
    index = Number(i)
    offset = bigIndex - i * bi64
  }
  const get = (key: number) => {
    computeIndexAndOffset(key)
    const n = array[index]
    return (n & (bi1 << offset)) > bi0
  }
  const add = (key: number) => {
    computeIndexAndOffset(key)
    const n = array[index]
    console.log(index, typeof n, typeof offset)
    array[index] = n | (bi1 << offset)
  }
  const remove = (key: number) => {
    computeIndexAndOffset(key)
    const n = array[index]
    array[index] = n & ~(bi1 << offset)
  }
  const set = (key: number, value: number) => {
    return value ? add(key) : remove(key)
  }
  return { get, set, add, remove }
}

Object.assign(window, { floatStore: createFloatStore() })


const testGrid2D = function* () {
  const size = 0x1_000
  const max = 0x1_000_000
  const store = createBooleanStore(max)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = digest.init().next(x).next(y).result()
      if (store.get(n)) {

      }
    }
    yield y / size
  }
}

/**
 * Can't remember what's going on here. It's about test about digest with 2D 
 * numbers. But it's not finished. Commit / pushed as is.
 * 
 * Just a note since I can still remember that:
 * The difficulty is about storing huge amout of test, very huuuuuge (about 
 * 4 billions / 2^32 ?). So a boolean store baked through bitwise operation in 
 * bigint stored in BigInt64Array is used here... or somewhere else! 
 */
const test = async () => {
  let loopCount = 0
  while (true) {
    await waitNextFrame()
    testGrid2D()
    console.log('loop', loopCount)
    loopCount++
    break
  }
}

test()

