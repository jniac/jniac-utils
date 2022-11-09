import { RefObject, useEffect as reactUseEffect, useLayoutEffect as reactUseLayoutEffect, useMemo as reactUseMemo } from 'react'
import { Destroyable, solveDestroyableIntoArray } from './destroyable'

// "mount check" is for checking that the component is still mounted in an async effect. 
const mountCheck = 'mounted?'

type CallbackMoment = 'effect' | 'layout-effect' | 'memo'
type UseEffectOptions = Partial<{ moment: CallbackMoment} >
type PublicState<T> = {
  readonly mounted: boolean
  ref: RefObject<T>
}
/**
 * `useEffects` is intended to allow the complex declaration of multiple, potentially async effects.
 *
 * Usage:
 * ```tsx
 * const MyComp = () => {
 *   const { ref } = useEffects<HTMLDivElement>(async function* (div, state) {
 *     const value = await fetch(something)
 *     yield 'mounted?'
 *     yield subscribeSomething(value)
 *     await waitSeconds(30)
 *     yield 'mounted?'
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
  effect: (value: T, state: PublicState<T>) => void | Generator<Destroyable | typeof mountCheck> | AsyncGenerator<Destroyable | typeof mountCheck>,
  deps: any[] | 'always-recalculate',
  { moment = 'effect' }: UseEffectOptions = {}
) {

  // NOTE: It is very important here that the 3 internal callbacks ("initialization", 
  // "callback", "destroy") have the same dependencies, otherwise subscription 
  // creation / destruction will not be called in the right order.
  const callbackDeps = deps === 'always-recalculate' ? undefined : deps

  // 1. "memo": This is the "initialization" phase. The states are created.
  const [state, publicState] = reactUseMemo(() => {
    let innerValue: T | null = null
    const ref = {
      get current() { return innerValue },
      set current(value) { innerValue = value },
    } as RefObject<T>
    const state = {
      ref,
      mounted: true,
      destroyCallbacks: [] as (() => void)[],
    }
    const publicState = {
      ref,
      get mounted() { return state.mounted },
    }
    return [state, publicState]
  }, callbackDeps)

  // 2. "effects": This is the "callback" phase, which can be called on three 
  // different moments.
  const fn = {
    'effect': reactUseEffect,
    'layout-effect': reactUseLayoutEffect,
    'memo': reactUseMemo,
  }[moment]
  fn(() => {

    // Safety set.
    state.mounted = true

    // Helping to fix careless mistakes?
    if (effect.length === 1 && state.ref.current === null) {
      console.log(`Hey, "useEffects" here.\nRef current value is null.\nYou probably forgot to link the state.ref.`)
      console.log(effect)
    }

    const iterator = effect(state.ref.current!, publicState)

    if (iterator) {
      const isAsync = Symbol.asyncIterator in iterator
      if (isAsync) {
        // Async:
        const asyncIterator = iterator as AsyncGenerator<Destroyable>
        const then = ({ value, done }: IteratorResult<Destroyable, any>): void => {
          if (done === false) {
            if (state.mounted) {
              // If mounted, then collect the callbacks for further usage.
              if (value !== mountCheck) {
                // ... only if callback is not a "mount check".
                solveDestroyableIntoArray(value, state.destroyCallbacks)
              }
              asyncIterator.next().then(then)
            } else {
              // If unmounted call immediately the current callbacks.
              if (value !== mountCheck) {
                // ... only if callback is not a "mount check".
                const destroyCallbacks: (() => void)[] = []
                solveDestroyableIntoArray(value, destroyCallbacks)
                for (const callback of destroyCallbacks) {
                  callback()
                }
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

  }, callbackDeps)

  // 3. This is the "destroy" phase. All the effects called during the "callback"
  // phase will be destroyed here.
  reactUseEffect(() => {
    return () => {
      state.mounted = false
      for (const callback of state.destroyCallbacks) {
        callback()
      }
    }
  }, callbackDeps)

  return publicState
}
/**
 * Exactly the same function than useEffects, but with the option "moment"
 * set to "layout-effect" (callback is executed ["before the browser has any chance to paint"](https://reactjs.org/docs/hooks-reference.html#uselayouteffect)).
 * @param effect
 * @param deps
 * @returns
 */

export function useLayoutEffects<T = undefined>(
  effect: Parameters<typeof useEffects<T>>[0],
  deps: Parameters<typeof useEffects<T>>[1]
) {
  return useEffects<T>(effect, deps, { moment: 'layout-effect' })
}
