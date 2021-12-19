import { Observable } from './base'
import { ValueSetter } from "./types"

const map = new WeakMap<Observable<any>, number>()

export const setValueWithDelay = <T>(
  observable: Observable<T>,
  valueSetter: ValueSetter<T>,
  value: T,
  seconds: number,
  clear = true
) => {

  const id = window.setTimeout(() => {
    valueSetter(value)
  }, seconds * 1000)

  if (clear) {
    window.clearTimeout(map.get(observable))
    map.set(observable, id)
    const { destroy } = observable.onChange(() => {
      window.clearTimeout(map.get(observable))
      destroy()
    })
  }
}
