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
export const useComplexEffects = (complexEffects: () => Generator<Destroyable>, deps?: React.DependencyList) => {
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

export const useForceUpdate = () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0)
  // NOTE: setImmediate here avoid some dependency call bug with React.
  // The kind that happens when a distant component is modifying an observable used here.
  // "setImmediate" solve the probleme because the update is delayed to the next frame.
  return () => setImmediate(forceUpdate)
}

export const useObservable = <T>(observable: Observable<T>): T => {
  const forceUpdate = useForceUpdate()
  React.useEffect(() => observable.onChange(forceUpdate).destroy, [forceUpdate, observable]);
  return observable.value
}

export const mapWithSeparator = <T, U, V>(data: T[], map: (item: T, index: number) => U, separator: (index: number) => V) => {

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
