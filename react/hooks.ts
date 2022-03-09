import React from 'react'
import { Observable } from '../observables'

export type Destroyable = { destroy: () => void}  | (() => void)

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
  complexEffects: () => Generator<Destroyable, T>, 
  deps: ComplexEffectsDependencyList,
  { debug = '', useLayoutEffect = true } = {}
) {

  // NOTE: For animation purpose, useLayoutEffect should be used to avoid "first frame glitches"
  const use = useLayoutEffect ? React.useLayoutEffect : React.useEffect
  const result = React.useRef<T>(undefined as unknown as T)

  use(() => {
    
    const destroyArray = [] as (() => void)[]

    const iterator = complexEffects()
    let item = iterator.next()
    while (item.done === false) {
      const { value } = item
      destroyArray.push(typeof value === 'function' ? value : value.destroy)
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
  complexEffects: (current: T) => Generator<Destroyable>, 
  deps: ComplexEffectsDependencyList,
) {
  const ref = React.useRef<T>(null)

  useComplexEffects(function* () {
    yield* complexEffects(ref.current!)
  }, deps)

  return ref
}

export function useForceUpdate({
  waitNextFrame = true,
} = {}) {
  // NOTE: `requestAnimationFrame` & `mounted` here avoid some dependency call bug with React.
  // The kind that happens when a distant component is modifying an observable used here.
  // "setImmediate" solve the probleme because the update is delayed to the next frame.
  const [, forceUpdate] = React.useReducer(x => x + 1, 0)
  const mounted = React.useRef(true)
  React.useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])
  const forceUpdateNextFrame = () => window.requestAnimationFrame(() => {
    if (mounted.current) {
      // DO NOT trigger `forceUpdate` on unmounted component
      forceUpdate()
    }
  })
  return (waitNextFrame
    ? forceUpdateNextFrame
    : forceUpdate
  )
}

type UseObservableOption<T, O extends Observable<T>, U> = Partial<{ useValueOld: boolean, extract: (o: O) => U }>
export function useObservable<T>(observable: Observable<T>): T
export function useObservable<T, O extends Observable<any> = Observable<T>, U = any>(observable: O, options: UseObservableOption<T, O, U>): U
export function useObservable<T, O extends Observable<any> = Observable<T>, U = any>(observable: O, { useValueOld = false, extract }: UseObservableOption<T, O, U> = {}) {
  const forceUpdate = useForceUpdate()
  // "forceUpdate" is different on each render, this should not be used as dep.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => observable.onChange(forceUpdate).destroy, [observable]);
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

export const usePromise = <T>(getPromise: () => Promise<T>) => {
  const [data, setData] = React.useState<T | null>(null)
  React.useEffect(() => {
    let mounted = true
    getPromise().then(data => {
      if (mounted) {
        setData(data)
      }
    })
    return () => {
      mounted = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return data
}