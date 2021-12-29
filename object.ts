const isObject = (x: any) => x !== null && typeof x === 'object'
// const isPlainObjectOrArray = (x: any) => isObject(x) && (x.constructor === Object || x.constructor === Array)

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
    if (isObject(destination) === false) {
      // source exists, but not destination!
      return false
    }
    if (source === destination) {
      // same reference, no need to loop over properties
      return true
    }
    // not the same reference, but may be the same properties values
    for (const key in source) {
      if (deepPartialEquals(source[key], destination[key]) === false) {
        return false
      }
    }
    return true
  }
  return source === destination
}

/**
 * `deepPartialCopy` assumes that source and destination have the same structure.
 * 
 * `deepPartialCopy` will silently skip over undefined value
 */
export const deepPartialCopy = (source: any, destination: any): boolean => {
  let hasChanged = false
  for (const key of Object.keys(source)) {
    const value = source[key]
    if (isObject(value)) {
      if (destination && deepPartialCopy(value, destination[key])) {
        hasChanged = true
      }
    }
    else {
      if (destination && Object.getOwnPropertyDescriptor(destination, key)?.writable === true) {
        destination[key] = value
        hasChanged = true
      }
    }
  }
  return hasChanged
}

export const deepClone = <T extends unknown>(source: T) => {
  if (isObject(source)) {
    try {
      // @ts-ignore
      const ctor = source.constructor
      const clone = new ctor()
      for (const key in source) {
        const value = source[key]
        clone[key] = deepClone(value)
      }
    } 
    catch (e: any) {
      // if object is not clonable return it
      if (e.message === 'Illegal constructor') {
        return source
      }
      // otherwise let raise an error
      throw e
    }
  }
  return source
}
