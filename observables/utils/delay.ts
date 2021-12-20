import { Observable } from '../Observable'

const map = new WeakMap<Observable<any>, number>()

export const setValueWithDelay = <T>(
  observable: Observable<T>,
  value: T | ((v: T) => T),
  seconds: number,
  clearOnChange = true,
  clearPrevious = true, // should clear any previous call (that have clearPrevious flag too)
) => {

  const id = window.setTimeout(() => {
    observable.setValue(value)
  }, seconds * 1000)

  if (clearOnChange) {
    // NOTE: any intermediate changes will cancel this (future) one.
    // And if not, the callback will auto-cleared when the value will change.
    const { destroy } = observable.onChange(() => {
      window.clearTimeout(id)
      destroy()
    })
  }

  if (clearPrevious) {
    window.clearTimeout(map.get(observable))
    map.set(observable, id)
  }
}