
const _arraysAreEquivalent = (a: any[], b: any[]) => {
  if (a.length !== b.length) {
    return false
  }
  for (let index = 0, max = a.length; index < max; index++) {
    const va = a[index]
    const vb = b[index]
    const ta = typeof va
    const tb = typeof vb
    if (ta !== tb) {
      return false
    }
    if (ta === 'object') {
      if (areEquivalent(va, vb) === false) {
        return false
      }
    } else {
      if (va !== vb) {
        return false
      }
    }
  }
  return true
}

const _objectsAreEquivalent = (a: object, b: object) => {
  if (a === b) {
    return true
  }
  if (a === undefined || a === null || b === undefined || b === null) {
    return false
  }
  const aKeys = Object.getOwnPropertyNames(a)
  for (const key of aKeys) {
    if (key in b === false) {
      return false
    }
    const va = (a as any)[key]
    const vb = (b as any)[key]
    const ta = typeof va
    const tb = typeof vb
    if (ta !== tb) {
      return false
    }
    if (ta === 'object') {
      if (areEquivalent(va, vb) === false) {
        return false
      }
    } else {
      if (va !== vb) {
        return false
      }
    }
  }
  const bKeys = Object.getOwnPropertyNames(b)
  if (bKeys.length !== aKeys.length) {
    return false
  }
  for (const key in bKeys) {
    if (key in a === false) {
      return false
    }
  }
  return true
}

/**
 * Deep compare the two objects entries to determine if the objects are equivalent.
 * 
 * Two objects are considered equivalent when: 
 * - They share the same constructor.
 * - They have the same value for the same keys.
 */
export const areEquivalent = (a: any, b: any) => {
  if (a.constructor !== b.constructor) {
    return false
  }
  if (Array.isArray(a)) {
    return _arraysAreEquivalent(a, b)
  }
  else {
    return _objectsAreEquivalent(a, b)
  }
}

// Backward compatibility:
export {
  /** 
   * @deprecated
   * @obsolete
   * Deprecated, use 'areEquivalent' instead.
   */
  areEquivalent as arraysAreEquivalent,
  /** 
   * @deprecated
   * @obsolete
   * Deprecated, use 'areEquivalent' instead.
   */
  areEquivalent as objectsAreEquivalent,
}
