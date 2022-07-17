
const _isObjectPredicate = (value: any) => {
  return !!value && typeof value === 'object' && value.constructor === Object
}

type DeepIterateOptions = Partial<{
  /**
   * What should be considered as an object (dictionary)?  
   * By default, any values that are not `null`, have `"object"` as type and `Object` as constructor.  
   * ```js
   * value => !!value && typeof value === 'object' && value.constructor === Object
   * ```
   */
  isObjectPredicate: (target: any) => boolean
  /**
   * What is the current path?  
   * Empty string "" by default.  
   * The value is used in inner recursive calls.
   */
  currentPath: string
  /** 
   * Which separator to represent the path to the nested value?  
   * "." by default.
   * */
  separator: string
}>

type DeepEntry = {
  path: string
  value: any
}

/**
 * Deep iterate over any "value" properties. What is "value" property? 
 * Anything that is not an "object" property (a delegate may be provided through options).
 * 
 * NOTE: deep path are represented via a string, and not an array of keys.
 */
export const deepEntries = function* (target: any, options: DeepIterateOptions = {}): Generator<DeepEntry, void, void> {
  const {
    isObjectPredicate = _isObjectPredicate,
    currentPath = '',
    separator = '.',
  } = options
  for (const key in target) {
    const value = target[key]
    const path = currentPath ? `${currentPath}${separator}${key}` : key
    if (isObjectPredicate(value)) {
      yield* deepEntries(value, { isObjectPredicate, currentPath: path, separator })
    } else {
      yield { path, value }
    }
  }
}

export const flatObject = (target: any, options: DeepIterateOptions = {}) => {
  const result = {} as Record<string, any>
  for (const { path, value } of deepEntries(target, options)) {
    result[path] = value
  }
  return result
}
