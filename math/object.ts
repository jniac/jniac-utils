/**
 * Make a "deep" (recursive) **unclamped** linear interpolation (lerp) of two objects.
 * 
 * NOTE 1: `from` & `to` objects does not need to have the same: 
 * Only the entries that are present on both objects will be interpolated.
 * 
 * NOTE 2: The `out` objects will have its entries overrided if they already exist
 * or created if not. 
 * 
 * ```
 * deepLerp({ x: 10, y: 2 }, { x: 30, z: 4 }, {}, .25) // {x: 15}
 * ```
 */
export const deepLerpUnclamped = (from: any, to: any, out: any, alpha: number): any => {
  for (const key in from) {
    // NOTE: Lerp only if the key is present on both objects.
    if (key in to) {
      const fromValue = from[key]
      switch (typeof fromValue) {
        case 'number': {
          out[key] = fromValue + (to[key] - fromValue) * alpha
          break
        }
        case 'object': {
          if (fromValue !== null) {
            out[key] = deepLerpUnclamped(fromValue, to[key], out[key], alpha)
          }
          break
        }
      }
    }
  }
  return out
}

/**
 * Make a "deep" (recursive) **clamped** linear interpolation (lerp) of two objects.
 * 
 * NOTE 1: `from` & `to` objects does not need to have the same: 
 * Only the entries that are present on both objects will be interpolated.
 * 
 * NOTE 2: The `out` objects will have its entries overrided if they already exist
 * or created if not. 
 * 
 * ```
 * deepLerp({ x: 10, y: 2 }, { x: 30, z: 4 }, {}, .25) // {x: 15}
 * ```
 */
export const deepLerp = (from: any, to: any, out: any, alpha: number): any => {
  alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha
  return deepLerpUnclamped(from, to, out, alpha)
}
