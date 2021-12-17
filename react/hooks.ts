import React from 'react'
import { Observable } from '../observables'

export type Destroyable = { destroy: () => void}  | (() => void)

/**
 * Using generator to allow multiple "on destroy" callbacks.
 * 
 * Callbacks are return with "yield".
 * 
 * Usage:
 * 
 *     useComplexEffects(function* () {
 *       subscribe(username)
 *       yield () => unsubscribe(username)
 *       
 *       const onScroll = () => doSomethingCool(username)
 *       window.addEventListener('scroll', onScroll)
 *       yield () => window.removeEventListener('scroll', onScroll)
 *     }, [username])
 */
export function useComplexEffects(complexEffects: () => Generator<Destroyable>, deps?: React.DependencyList) {
  React.useEffect(() => {
    const onDestroyArray: (() => void)[] = []
    for (const destroy of complexEffects()) {
      onDestroyArray.push(typeof destroy === 'function' ? destroy : destroy.destroy)
    }
    return () => {
      for (const cb of onDestroyArray) {
        cb()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
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

export function useObservable<T>(observable: Observable<T>): T
export function useObservable<T>(observable: Observable<T>, option: { useValueOld: true }): { value: T, valueOld: T }
export function useObservable<T>(observable: Observable<T>, { useValueOld = false } = {}) {
  const forceUpdate = useForceUpdate()
  React.useEffect(() => observable.onChange(forceUpdate).destroy, [forceUpdate, observable]);
  if (useValueOld) {
    const { value, valueOld } = observable
    return { value, valueOld }
  }
  return observable.value
}

export function mapWithSeparator<T, U, V>(
  data: T[],
  map: (item: T, index: number) => U,
  separator: (index: number) => V,
) {

  if (data.length === 0) {
    return []
  }

  const result = [map(data[0], 0)] as (T | U | V)[]
  for (let index = 1; index < data.length; index++) {
    result.push(separator(index - 1))
    result.push(map(data[index], index))
  }
  return result
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
