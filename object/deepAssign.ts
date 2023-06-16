import { isObject } from './isObject'

const _deepAssign = (destination: any, source: any) => {
  for (const key in source) {
    const sourceValue = source[key]
    if (isObject(sourceValue) === false) {
      destination[key] = sourceValue
    } else {
      if (key in destination === false || isObject(destination[key]) === false) {
        destination[key] = {}
      }
      _deepAssign(destination[key], sourceValue)
    }
  }
}

/**
 * "Deep" assigns (recursively) the properties of the tree sources to the destination tree.
 * 
 * Usage:
 * ```
 * const a = { name: 'src', foo: 1, bar: { x: 1 }, baz: 1 }
 * const b = { foo: 2, bar: { x: 2 }, baz: { x: 3 } }
 * const c = { bar: { x: 'lol' } }
 * 
 * deepAssign(a, b, c)
 * 
 * a.foo    // 2
 * a.bar.x  // "lol"
 * a.baz.x  // 3
 * ```
 */
export const deepAssign = (destination: any, ...sources: any[]) => {
  for (const source of sources) {
    if (isObject(source)) {
      _deepAssign(destination, source)
    }
  }
  return destination
}
