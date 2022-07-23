
export const arraysAreEquivalent = (a: any[], b: any[]) => {
  if (a.length !== b.length) {
    return false
  }
  for (let index = 0, max = a.length; index < max; index++) {
    if (a[index] !== b[index]) {
      return false
    }
  }
  return true
}

export const objectsAreEquivalent = (a: object, b: object) => {
  if (a === b) {
    return true
  }
  if (a === undefined || a === null || b === undefined || b === null) {
    return false
  }
  for (const key in a) {
    if (key in b === false) {
      return false
    }
    if ((a as any)[key] !== (b as any)[key]) {
      return false
    }
  }
  for (const key in b) {
    if (key in a === false) {
      return false
    }
  }
  return true
}

export const areEquivalent = (a: any, b: any) => {
  if (a.constructor !== b.constructor) {
    return false
  }
  if (Array.isArray(a)) {
    return arraysAreEquivalent(a, b)
  }
  else {
    return objectsAreEquivalent(a, b)
  }
}

