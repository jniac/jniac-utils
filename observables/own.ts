import { Observable } from './Observable'

let count = 0
export const own = <T>(observable: Observable<T>) => {
  const id = count++
  const identity = Symbol(id)
  observable.own(identity)
  
  const setValue = (value: T | ((v: T) => T), {
    ignoreCallbacks = false,
  } = {}): boolean => {
    return observable.setValue(value, {
      ignoreCallbacks,
      owner: identity,
    })
  }

  // NOTE: a Proxy could be handy here
  return {
    observable,
    setValue,
  }
}