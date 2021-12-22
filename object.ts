const isObject = (x: any) => x !== null && typeof x === 'object'
export const deepEquals = (source: any, destination: any) => {
  if (isObject(source)) {
    for (const key in source) {
      if (deepEquals(source[key], destination[key]) === false) {
        return false
      }
    }
    return true
  }
  return source === destination
}
export const deepCopy = (source: any, destination: any) => {
  let hasChanged = false
  for (const key in source) {
    const value = source[key]
    if (isObject(value)) {
      deepCopy(value, destination[key])
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
