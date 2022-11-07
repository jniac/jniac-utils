import { useEffect, useRef } from 'react'

export type Destroyable =
  | null
  | (() => void)
  | { destroy: () => void }
  | Iterable<Destroyable>

export const solveDestroyableIntoArray = (value: Destroyable, array: (() => void)[] = []) => {
  if (value) {
    switch (typeof value) {
      case 'function': {
        array.push(value)
        break
      }
      case 'object': {
        if ('destroy' in value) {
          array.push(value.destroy)
        } else if (Symbol.iterator in value) {
          const iterator = value[Symbol.iterator]() as Generator<Destroyable>
          for (const value of iterator) {
            solveDestroyableIntoArray(value, array)
          }
        }
        break
      }
    }
  }
  return array
}


type PublicState = { readonly mounted: boolean }
/**
 * `useEffects` is intended to allow the complex declaration of multiple, potentially async effects.
 * 
 * Usage:
 * ```tsx
 * const MyComp = () => {
 *   const ref = useEffects<HTMLDivElement>(async function* (div, state) {
 *     const value = await fetch(something)
 *     if (state.mounted === false) 
 *       return
 *     yield suscribeSomething(value)
 *     await waitSeconds(30)
 *     if (state.mounted === false)
 *       return
 *     dispatch('Are you still there?')
 *   })
 *   return (
 *     <div ref={ref} />
 *   )
 * }
 * ```
 * 
 * NOTE:
 * 
 * `useEffects` is an evolution of `useComplexEffects` & `useRefComplexEffects` 
 * and should be preferred over these two.
 */
export function useEffects<T = undefined>(
  effect: (value: T, state: PublicState) => void | Generator<Destroyable> | AsyncGenerator<Destroyable>, 
  deps: any[] | 'always-recalculate',
) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const state = {
      mounted: true,
      destroyCallbacks: [] as (() => void)[],
    }

    // Helping to fix careless mistakes?
    if (effect.length === 1 && ref.current === null) {
      console.log(`Hey, "useEffects" here.\nRef current value is null.\nYou probably forgot to link the ref.`)
      console.log(effect)
    }
    
    const publicState = { get mounted() { return state.mounted }}
    const iterator = effect(ref.current!, publicState)

    if (iterator) {
      const isAsync = Symbol.asyncIterator in iterator
      if (isAsync) {
        // Async:
        const asyncIterator = iterator as AsyncGenerator<Destroyable>
        const then = ({ value, done }: IteratorResult<Destroyable, any>): void => {
          if (done === false) {
            if (state.mounted) {
              // If mounted, then collect the callbacks for further usage.
              solveDestroyableIntoArray(value, state.destroyCallbacks)
              asyncIterator.next().then(then)
            } else {
              // If unmounted call immediately the current callbacks.
              const destroyCallbacks: (() => void)[] = []
              solveDestroyableIntoArray(value, destroyCallbacks)
              for (const callback of destroyCallbacks) {
                callback()
              }
            }
          }
        }
        asyncIterator.next().then(then)
      } else {
        // Sync:
        const syncIterator = iterator as Generator<Destroyable>
        while (true) {
          const { value, done } = syncIterator.next()
          if (done) {
            break
          }
          solveDestroyableIntoArray(value, state.destroyCallbacks)
        }
      }
    }
    
    return () => {
      state.mounted = false
      for(const callback of state.destroyCallbacks) {
        callback()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps === 'always-recalculate' ? undefined : deps)
  return ref
}


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
    withValue?.(value as unknown as T)
    solveDestroyableIntoArray(value, array)
    item = iterator.next()
  }
  return array
}

/**
 * Destroyable collector.
 * 
 * Usage: 
 * ```
 * const MyComponent = () => {
 *   const { destroy } = useMemo(() => {
 *     const destroyable = new DestroyableCollector()
 *     destroyable.into = () => console.log(`I'm dead!`)
 *     return destroyable
 *   }, [])
 *   useEffect(() => {
 *     return destroy
 *   })
 *   return (
 *     <></>
 *   )
 * }
 * ```
 */
export class DestroyableCollector {
  #destroyables: Destroyable[] = []
  /**
   * This is tricky. This is a pure setter that will, under the hood, push the 
   * given value. Why this weird design?
   * 
   * To allow concise declaration:
   * ```
   * destroyable.into = () => {
   *   // Here,
   *   // a very long function
   *   // that we don't need 
   *   // to wrap into parens anymore.
   * }
   * ```
   * If you don't like it, you can still use the following:
   * ```
   * destroyable.push(() => {
   *   // Here,
   *   // a very long function
   *   // that we prefer to wrap
   *   // into parens.
   * })
   * ```
   */
  set into(value: Destroyable) {
    this.push(value)
  }
  push(value: Destroyable) {
    this.#destroyables.push(value)
  }
  destroy = () => {
    for (const callback of collectDestroys(this.#destroyables)) {
      callback()
    }
  }
}
