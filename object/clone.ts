import { isObject, isPlainObjectOrArray } from './isObject'

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
 * "Writable" properties of array & "plain" object are copied ONLY. Objects with
 * constructor are copied via reference (allowing to copy "native" properties as 
 * HTMLElement, Event etc.): 
 * ```js
 * // 'foo.x' is copied (and not 'foo'), but 'target' is copied as is.
 * deepPartialCopy({ 
 *   foo: { x: 1 }, 
 *   target: document.body,
 * }, dest)
 * ```
 * 
 * `deepPartialCopy` will silently skip over undefined value
 */
export const deepPartialCopy = (source: any, destination: any): boolean => {
  let hasChanged = false
  for (const key of Object.keys(source)) {
    const value = source[key]
    if (isPlainObjectOrArray(value)) {
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

type DeepCloneOptions = Partial<{
  ignoredKeys: Set<String>
  ignoreEntry: (key: string, value: any) => boolean
  authorizedKeys: Set<String>
  authorizeEntry: (key: string, value: any) => boolean
}>
/**
 * Returns a "deep" (recursive) copy of an object.
 * 
 * NOTE: About "object" clones: 
 * - If the object provides a "clone()" method, the method will be used to produce the value.
 * - If not, the constructor will be used, if possible, without providing any arguments (new source.constructor()).
 */
export const deepClone = <T extends unknown>(source: T, options: DeepCloneOptions = {}): T => {
  const {
    ignoredKeys,
    authorizedKeys,
    ignoreEntry,
    authorizeEntry,
  } = options
  if (isObject(source)) {
    if ('clone' in (source as any) && typeof (source as any).clone === 'function') {
      return (source as any).clone()
    }
    try {
      const ctor = (source as any).constructor
      const clone = new ctor()
      for (const key in source) {
        if (ignoredKeys && ignoredKeys.has(key)) {
          continue
        }
        if (authorizedKeys && authorizedKeys.has(key) === false) {
          continue
        }
        const value = source[key]
        if (ignoreEntry && ignoreEntry(key, value)) {
          continue
        }
        if (authorizeEntry && authorizeEntry(key, value) === false) {
          continue
        }
        clone[key] = deepClone(value, options)
      }
      return clone
    } 
    catch (e: any) {
      // if object is not clonable return it
      if (/Illegal constructor/i.test(e.message)) {
        console.warn('Could not be cloned:', source)
        return source
      }
      // otherwise let raise an error
      throw e
    }
  }
  return source
}

export const deepGet = (source: any, path: string | (string | symbol | number)[]) => {
  const keys = Array.isArray(path) ? path : path.split('.')
  let scope = source
  for (let i = 0, max = keys.length; i < max; i++) {
    if (isObject(scope) === false) {
      return undefined
    }
    const key = keys[i]
    if (key in scope) {
      scope = scope[key]
    }
    else {
      return undefined
    }
  }
  return scope
}