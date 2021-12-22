const isObject = (x: any) => x !== null && typeof x === 'object'

/**
 * NOTE: The source may have less keys than the destination, the result still may
 * be true. This is the meaning of "Partial". Eg:
 * ```js
 * deepPartialEquals({ foo: 1 }, { foo: 1, bar: 2 }) // true
 * ```
 * So, the order is important here, and keep in mind that this could be true:
 * ```js 
 * deepPartialEquals(x, y) !== deepPartialEquals(y, x)
 * ```
 */
export const deepPartialEquals = (source: any, destination: any) => {
  if (isObject(source)) {
    for (const key in source) {
      if (deepPartialEquals(source[key], destination[key]) === false) {
        return false
      }
    }
    return true
  }
  return source === destination
}

export const deepPartialCopy = (source: any, destination: any) => {
  let hasChanged = false
  for (const key in source) {
    const value = source[key]
    if (isObject(value)) {
      deepPartialCopy(value, destination[key])
    }
    else {
      hasChanged = true
      destination[key] = value
    }
  }
  return hasChanged
}

export const deepClone = <T extends unknown>(source: T) => {
  if (isObject(source)) {
    // @ts-ignore
    const ctor = source.constructor
    const clone = new ctor()
    for (const key in source) {
      const value = source[key]
      clone[key] = deepClone(value)
    }
  }
  return source
}
