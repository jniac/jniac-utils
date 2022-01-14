import React from 'react'
import { Observable } from '../observables'

export function useAsyncEffect(callback: () => void, deps?: React.DependencyList) {
  React.useEffect(() => {
    callback()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export type Destroyable = { destroy: () => void}  | (() => void)

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
export function useComplexEffects(
  complexEffects: () => Generator<Destroyable>, 
  deps?: React.DependencyList,
  { debug = '', useLayoutEffect = true } = {}
) {

  // NOTE: For animation purpose, useLayoutEffect should be used to avoid "first frame glitches"
  const use = useLayoutEffect ? React.useLayoutEffect : React.useEffect

  use(() => {
    
    const destroyArray = [] as (() => void)[]

    for (const destroy of complexEffects()) {
      destroyArray.push(typeof destroy === 'function' ? destroy : destroy.destroy)
    }
    
    if (debug) {
      console.log(`useComplexEffects debug ${debug}: ${destroyArray.length} callbacks`)
    }

    return () => {
      for (const destroy of destroyArray) {
        destroy()
      }
    }

  }, deps)
}

/**
 * Same as `useComplexEffects` but with a ref (short-hand).
 */
export function useRefComplexEffects<T = HTMLElement>(
  complexEffects: (current: T) => Generator<Destroyable>, 
  deps?: React.DependencyList,
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
  const [, forceUpdate] = React.useReducer(x => x + 1, 0)
  // NOTE: setImmediate here avoid some dependency call bug with React.
  // The kind that happens when a distant component is modifying an observable used here.
  // "setImmediate" solve the probleme because the update is delayed to the next frame.
  return (waitNextFrame
    ? () => window.requestAnimationFrame(forceUpdate)
    : forceUpdate
  )
}

type UseObservableOption<T, O extends Observable<T>, U> = Partial<{ useValueOld: boolean, extract: (o: O) => U }>
export function useObservable<T>(observable: Observable<T>): T
export function useObservable<T, O extends Observable<any> = Observable<T>, U = any>(observable: O, options: UseObservableOption<T, O, U>): U
export function useObservable<T, O extends Observable<any> = Observable<T>, U = any>(observable: O, { useValueOld = false, extract }: UseObservableOption<T, O, U> = {}) {
  const forceUpdate = useForceUpdate()
  React.useEffect(() => observable.onChange(forceUpdate).destroy, [forceUpdate, observable]);
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