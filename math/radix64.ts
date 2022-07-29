const BASE = 64
const BASE_BITS = 6
const alphabet = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz' // sorted
const reverseAlphabet = new Map([...alphabet].map((c, i) => [c, i]))

export const encodeInt64 = (n: number, length?: number) => {
  if (length !== undefined) {
    const bounds = Math.pow(2, 6 * length)
    if (n >= bounds) {
      throw new Error(`Int (${n}) is greater than or equal to max bound (${bounds}) for encoded string length (${length})`)
    }
  }
  else {
    let log = Math.log2(n)
    if (Math.pow(2, Math.round(log)) === n) {
      log++
    }
    length = Math.max(1, Math.ceil(log / BASE_BITS))
  }

  const chars = new Array(length)
  let i = chars.length - 1
  while (n > 0) {
    chars[i--] = alphabet[n % BASE]
    n = Math.floor(n / BASE)
  }
  while (i >= 0) {
    chars[i--] = alphabet[0]
  }
  return chars.join('')
}

export const decode64ToInt = (string: string) => {
  let i = 0
  let n = 0
  do {
    n = n * BASE + reverseAlphabet.get(string[i])!
    i++
  } while (i < string.length)
  return n
}