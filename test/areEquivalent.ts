
const iterablePreview = (iterable: Iterable<any>, previewLength = 5) => {
  const values: string[] = []
  let index = 0
  for (const value of iterable) {
    if (index > previewLength) {
      return `(${values.join(', ')}, ...)`
    }
    values.push(String(value))
    index++
  }
  return `(${values.join(', ')})`
}

type AreEquivalentResult = [
  areEquivalent: boolean, 
  failReason: string
]

const ok = (): AreEquivalentResult => [true, '']
const fail = (failReason: string): AreEquivalentResult => [false, failReason]

const defaultOptions = {
  /** Compare iterable the same order. If "false" set will be used to compare the iterables. Defaults to false. */
  compareIterablesAsSets: false,
  /** Number of item's previews. Defaults to 5. */
  iterablePreviewLength: 5,
}

const arrayAreEquivalent = (
  aValues: any[],
  bValues: any[],
  preview: (iterable: Iterable<any>) => string,
): AreEquivalentResult => {
  if (aValues.length !== bValues.length) {
    return fail(
      `Lengths are different: ${aValues.length} <-> ${bValues.length}`
      + `\n> a: ${preview(aValues)}`
      + `\n> b: ${preview(bValues)}`)
  }
  for (let i = 0, max = aValues.length; i < max; i++) {
    const aValue = aValues[i]
    const bValue = bValues[i]
    if (aValue !== bValue) {
      return fail(
        `Sub-values are differents @ #${i}: ${aValue} <-> ${bValue}`
        + `\n> a: ${preview(aValues)}`
        + `\n> b: ${preview(bValues)}`)
    }
  }
  return ok()

}

const setsAreEquivalent = (
  aSet: Set<any>, 
  bSet: Set<any>, 
  preview: (iterable: Iterable<any>) => string,
): AreEquivalentResult => {
  const aCheckSet = new Set(aSet)
  const bCheckSet = new Set(bSet)
  for (const value of aSet) {
    if (bSet.has(value)) {
      aCheckSet.delete(value)
      bCheckSet.delete(value)
    }
  }
  if (aSet.size !== 0 || bSet.size !== 0) {
    return fail(
      `The two set does not contains the same values:`
      + `\n> a: "extra" values: ${preview(aCheckSet)} from ${preview(aSet)}.`
      + `\n> b: "extra" values: ${preview(bCheckSet)} from ${preview(bSet)}.`)
  }
  return ok()

}

/**
 * `areEquivalent` is intended to facilitate value comparison essentially for 
 * test purpose.
 * 
 * NOTE: For the time being, there is no deep check here. 
 */
export const areEquivalent = (
  a: any,
  b: any,
  options: Partial<typeof defaultOptions> = {},
): AreEquivalentResult => {

  const {
    compareIterablesAsSets,
    iterablePreviewLength,
  } = { ...defaultOptions, ...options }

  const aType = typeof a
  const bType = typeof b
  if (aType !== bType) {
    return fail(`Types are differents: ${aType} <-> ${bType}`)
  }

  switch (aType) {
    case 'boolean':
    case 'string':
    case 'number':
    case 'bigint': {
      if (a === b) {
        return ok()
      } else {
        return fail(`Primitives values are different: ${a} <-> ${b}`)
      }
    }
  }

  if (Symbol.iterator in a && Symbol.iterator in b) {
    const preview = (iterable: Iterable<any>) => iterablePreview(iterable, iterablePreviewLength)
    if (compareIterablesAsSets) {
      return setsAreEquivalent(new Set(a), new Set(b), preview)
    } else {
      return arrayAreEquivalent([...a], [...b], preview)
    }
  }

  return fail('Unhandled case.')
}
