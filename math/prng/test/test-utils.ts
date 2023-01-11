/**
 * Create a store that can store up to 2^32 booleans by storing the values into big int.
 */
export const createBooleanStore = (count = 2 ** 32) => {
  const len = count / 64
  const array = new BigInt64Array(len)
  const set = (index: number, value: boolean) => {
    if (index < 0 || index >= count) {
      throw new Error(`Invalid index: "${index}"`)
    }
    const i = Math.floor(index / 64)
    const f = index - i * 64
    const n = array[i]
    array[i] = value
      ? n | (BigInt(1) << BigInt(f))
      : n & ~(BigInt(1) << BigInt(f))
  }
  const get = (index: number) => {
    if (index < 0 || index >= count) {
      throw new Error(`Invalid index: "${index}"`)
    }
    const i = Math.floor(index / 64)
    const f = index - i * 64
    const n = array[i]
    return (n & (BigInt(1) << BigInt(f))) > BigInt(0)
  }
  return { get, set }
}
