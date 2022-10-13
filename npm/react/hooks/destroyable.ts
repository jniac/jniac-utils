
export type Destroyable =
  | null
  | (() => void)
  | { destroy: () => void }
  | Iterable<Destroyable>

/**
 * Returns an array of callbacks `(() => void)[]` extracted from the given 
 * destroyable. Since destroyables can be a lot of things (from null to iterables)
 * this method is helpful to collect the nested callbacks.
 */
export const collectDestroys = <T = any>(
  iterableOrIterator: Generator<Destroyable> | Iterable<Destroyable>,
  array: (() => void)[] = [],
  withValue?: (value: T) => void
): (() => void)[] => {
  const iterator = Symbol.iterator in iterableOrIterator
    ? iterableOrIterator[Symbol.iterator]()
    : iterableOrIterator as Generator<Destroyable>
  let item = iterator.next()
  while (item.done === false) {
    const { value } = item
    withValue?.(value as T)
    if (value) {
      switch (typeof value) {
        case 'function': {
          array.push(value)
          break
        }
        case 'object': {
          if ('destroy' in value) {
            array.push(value.destroy)
          }
          else if (Symbol.iterator in value) {
            const iterator = value[Symbol.iterator]() as Generator<Destroyable>
            collectDestroys(iterator, array)
          }
          break
        }
      }
    }
    item = iterator.next()
  }
  return array
}
