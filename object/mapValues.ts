import { deepClone } from './clone'
import { isObject } from './isObject'

export const mapRecord = <V1, V2, K extends string>(
  source: Record<K, V1>, 
  map: (value: V1, key: string) => V2,
) => {
  return Object.fromEntries(
    Object.entries(source)
      .map(([key, value]) => [key, map(value as V1, key)])
  ) as Record<K, V2>
}

type DeepMapValuesMap = (value: any, key: string, path: string) => any
type DeepMapValuesMapper = {
  string?: DeepMapValuesMap
  number?: DeepMapValuesMap
}
type DeepMapValuesOptions = Partial<{
  /** should */
  clone: boolean
  path: string
}>

/**
 * Map the value of an object. Be aware: The object IS NOT cloned unless options.clone === true!
 * @param target The object to clone.
 * @param map The map delegate, or object mapper "delegate".
 * @param options Some options, as "clone".
 * @param options.clone Should the target be (deep) cloned?.
 * @returns The object mapped.
 */
export const deepMapValues = <T = any>(
  target: T, 
  map: DeepMapValuesMap | DeepMapValuesMapper,
  {
    clone = false,
    path = '',
  }: DeepMapValuesOptions = {},
): T => {

  if (clone === true) {
    target = deepClone(target)
  }
    
  const toMap = (mapper: DeepMapValuesMapper) => {
    const { string, number } = mapper
    return (value: any, key: string, path: string) => {
      const type = typeof value
      if (type === 'string') {
        return string ? string(value, key, path) : value
      }
      if (type === 'number') {
        return number ? number(value, key, path) : value
      }
      return value
    }
  }

  const _map = typeof map === 'function' ? map : toMap(map)
  
  for (const key in target) {
    const value = target[key]
    const childPath = path.length > 0 ? `${path}.${key}` : key
    if (isObject(value)) {
      target[key] = deepMapValues(value, map, { clone: false, path: childPath })
    }
    else {
      target[key] = _map(value, key, childPath)
    }
  }

  return target
}
