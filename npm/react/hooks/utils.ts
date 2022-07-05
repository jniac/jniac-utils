import React from 'react'
import { Observable } from '../../../observables'

export type Destroyable = null | { destroy: () => void}  | (() => void)

export type ComplexEffectsState = { mounted: boolean }
export type ComplexEffectsDependencyList = React.DependencyList | 'always-recalculate'

/**
 * Using generator to allow multiple "on destroy" callbacks.
 * 
 * Callbacks are return with "`yield`".
 * 
 * Internally uses `React.useLayoutEffect` by default.
 * 
 * Usage:
 * 
 * ```js
 * useComplexEffects(function* () {
 *   subscribe(username)
 *   yield () => unsubscribe(username)
 *   
 *   const onScroll = () => doSomethingCool(username)
 *   window.addEventListener('scroll', onScroll)
 *   yield () => window.removeEventListener('scroll', onScroll)
 * }, [username])
 * ```
 */
export function useComplexEffects<T = void>(
  complexEffects: (state: ComplexEffectsState) => Generator<Destroyable, T>, 
  deps: ComplexEffectsDependencyList,
  { debug = '', useLayoutEffect = true } = {}
) {

  // NOTE: For animation purpose, useLayoutEffect should be used to avoid "first frame glitches"
  const use = useLayoutEffect ? React.useLayoutEffect : React.useEffect
  const result = React.useRef<T>(undefined as unknown as T)

  use(() => {
    
    let mounted = true
    const state = Object.freeze({ get mounted() { return mounted } })
    const destroyArray = [() => mounted = false] as (() => void)[]

    const iterator = complexEffects(state)
    let item = iterator.next()
    while (item.done === false) {
      const { value } = item
      if (value) {
        destroyArray.push(typeof value === 'function' ? value : value.destroy)
      }
      item = iterator.next()
    }

    result.current = item.value as T
    
    if (debug) {
      console.log(`useComplexEffects debug ${debug}: ${destroyArray.length} callbacks`)
    }

    return () => {
      for (const destroy of destroyArray) {
        destroy()
      }
    }

  }, deps === 'always-recalculate' ? undefined : deps)

  return result
}

/**
 * Same as `useComplexEffects` but with a ref (short-hand).
 */
export function useRefComplexEffects<T = HTMLElement>(
  complexEffects: (current: T, state: ComplexEffectsState) => Generator<Destroyable>, 
  deps: ComplexEffectsDependencyList,
) {
  const ref = React.useRef<T>(null)

  useComplexEffects(function* (state) {
    yield* complexEffects(ref.current!, state)
  }, deps)

  return ref
}

export function useForceUpdate({
  waitNextFrame,
}: {
  waitNextFrame: boolean
}) {
  // NOTE: `requestAnimationFrame` & `mounted` here avoid some dependency call bug with React.
  // The kind that happens when a distant component is modifying an observable used here.
  // "setImmediate" solve the probleme because the update is delayed to the next frame.
  
  const [, setCount] = React.useState(0)
  const mounted = React.useRef(true)
  const [forceUpdate, forceUpdateNextFrame] = React.useMemo(() => {
    
    let count = 0
    
    const forceUpdate = () => {
      count++
      setCount(count)
    }

    const forceUpdateNextFrame = () => window.requestAnimationFrame(() => {
      if (mounted.current) {
        // DO NOT trigger `forceUpdate` on unmounted component
        forceUpdate()
      }
    })

    return [forceUpdate, forceUpdateNextFrame]

  }, [])

  React.useEffect(() => {
    mounted.current = true
    // Wait!? 
    // This is absurd right?
    // "mounted.current" is already set to true right?
    // Yep, but you may ignore that <React.StrictMode> could render twice the SAME
    // component, so the "decomission" function may have been called, and mounted.current
    // could already be set to "false".
    // Really?
    // Really. 
    return () => {
      mounted.current = false
    }
  }, [])


  return (waitNextFrame
    ? forceUpdateNextFrame
    : forceUpdate
  )
}

type UseObservableOption<T, O extends Observable<T>, U> = Partial<{ useValueOld: boolean, extract: (o: O) => U }>
export function useObservable<T>(observable: Observable<T>): T
export function useObservable<T, O extends Observable<any> = Observable<T>, U = any>(observable: O, options: UseObservableOption<T, O, U>): U
export function useObservable<T, O extends Observable<any> = Observable<T>, U = any>(observable: O, { useValueOld = false, extract }: UseObservableOption<T, O, U> = {}) {
  const count = React.useRef(0)
  const [, setCount] = React.useState(0)
  const forceUpdate = React.useMemo(() => {
    return () => {
      count.current += 1
      setTimeout(() => {
        setCount(count.current)
      }, 0)
    }
  }, [])
  React.useEffect(() => observable.onChange(forceUpdate).destroy, [forceUpdate, observable])
  if (useValueOld) {
    const { value, valueOld } = observable
    return { value, valueOld }
  }
  if (extract) {
    return extract(observable)
  }
  return observable.value
}

export function useFetchJson<T = any>(url: string): T | null
export function useFetchJson<T = any>(url: string, initialValue: T): T
export function useFetchJson<T = any>(url: string, initialValue: T | null = null) {
  const [data, setData] = React.useState<T | null>(initialValue)
  React.useEffect(() => {
    window.fetch(url).then(async response => {
      try {
        setData(await response.json())
      } catch (e) {
        console.error(e)
      }
    }).catch(e => console.error(e))
  }, [url])
  return data
}

export function useAnimationFrame(callback: (ms: number) => void) {
  React.useEffect(() => {
    let id = -1
    const loop = (ms: number) => { 
      id = window.requestAnimationFrame(loop)
      callback(ms)
    }
    id = window.requestAnimationFrame(loop)
    return () => {
      window.cancelAnimationFrame(id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export const usePromise = <T>(
  getPromise: Promise<T> | (() => Promise<T>), 
  deps: React.DependencyList = [],
) => {
  const [data, setData] = React.useState<T | null>(null)
  React.useEffect(() => {
    let mounted = true
    const promise = typeof getPromise === 'function' ? getPromise() : getPromise
    promise.then(data => {
      if (mounted) {
        setData(data)
      }
    })
    return () => {
      mounted = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return data
}

/**
 * You know it. Sometimes you're not still there when a response arrive. So
 * useSafeState does not anything if the component is already unmounted.
 * @param initialValue The... initial value!
 * @returns 
 */
export const useSafeState = <T>(initialValue: T): [T, (value: T) => void] => {
  const mounted = React.useRef(true)
  React.useEffect(() => {
    mounted.current = true // Keep that line since <React.StrictMode/> can trigger the effect twice (within the SAME component).
    return () => { mounted.current = false }
  }, [])
  const [value, setValue] = React.useState(initialValue)
  const safeSetValue = React.useMemo(() => {
    return (value: T) => {
      // Safe guard: do not call if unmounted
      if (mounted.current) {
        setValue(value)
      }
    }
  }, [])
  return [value, safeSetValue]
}