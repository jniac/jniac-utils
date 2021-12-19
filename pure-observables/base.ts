import { setValueWithDelay } from './delay'
import { ValueSetter, ObservableCallback } from './types'

class DestroyedObservable {
  static errorMessage = `This observable has been destroyed.\nYou should not use it anymore. "onDestroy" callback helps to prevent any usage after destruction.`
  setValue() {
    throw new Error(DestroyedObservable.errorMessage)
  }
  setValueWithDelay() {
    throw new Error(DestroyedObservable.errorMessage)
  }
  onChange() {
    throw new Error(DestroyedObservable.errorMessage)
  }
  onDestroy() {
    throw new Error(DestroyedObservable.errorMessage)
  }
  destroy() {
    throw new Error(DestroyedObservable.errorMessage)
  }
  get destroyed() { return true }
}

let valueSetter: ValueSetter<any> | null = null
export const consumeValueSetter = () => {
  const tmp = valueSetter
  valueSetter = null
  return tmp
}

export class Observable<T> {

  static create<T>(initialValue: T) {
    const observable = new Observable(initialValue)
    const setValue = consumeValueSetter()!
    return { observable, setValue }
  }

  static #count = 0
  readonly id = Observable.#count++

  #onChange = new Set() as Set<ObservableCallback<T>>
  #onDestroy = new Set() as Set<ObservableCallback<T>>

  #value: T
  #valueOld: T
  #hasChanged = false

  get value() { return this.#value }
  get valueOld() { return this.#valueOld }
  get hasChanged() { return this.#hasChanged }
  get destroyed() { return false }
  
  destroy: () => void

  constructor(initialValue: T) {
    this.#valueOld = initialValue
    this.#value = initialValue

    // NOTE: destroy here change the prototype of "this". This is critical but helps 
    // here to prevent any usage of the current observable after destruction.
    // Could be remove, if considered as "too bad".
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
    this.destroy = () => {
      const value = this.#value
      for (const callback of this.#onDestroy) {
        callback(value, this)
      }
      this.#onChange.clear()
      this.#onDestroy.clear()

      Object.setPrototypeOf(this, DestroyedObservable.prototype)
      //@ts-ignore
      delete this.destroy
      Object.freeze(this)
    }
    
    // NOTE: "valueSetter" is created here. It's the only access to set the inner value.
    // It can only be consumed by "consumeValueSetter".
    valueSetter = (value: T, {
      ignoreCallbacks = false
    } = {}): boolean => {
  
      this.#hasChanged = this.#value !== value
      if (this.#hasChanged) {
        this.#valueOld = this.#value
        this.#value = value
        if (ignoreCallbacks === false) {
          for (const callback of this.#onChange) {
            callback(value, this)
          }
        }
      }
  
      return this.#hasChanged
    }
  }

  /**
   * NOTE: triggerChangeCallbacks() allows to defer the callbacks call (eg: after 
   * further / other changes). Since this break the implicit contract of "onChange"
   * callbacks (that should be called only when the value has changed), this should
   * be used very carefully.
   */
  triggerChangeCallbacks({ force = false } = {}) {
    if (this.#hasChanged || force) {
      const value = this.#value
      for (const callback of this.#onChange) {
        callback(value, this)
      }
    }
  }

  onChange(callback: ObservableCallback<T>, { execute = false } = {}) {
    this.#onChange.add(callback)
    if (execute) {
      callback(this.#value, this)
    }
    const destroy = () => {
      this.#onChange.delete(callback)
    }
    return { destroy }
  }

  until(predicate: (value: T) => boolean, {
    enter,
    leave,
  } : {
    enter?: ObservableCallback<T>
    leave?: ObservableCallback<T>
  }) {
    let ok = predicate(this.#value)
    if (ok) {
      enter?.(this.#value, this)
    }
    return this.onChange(value => {
      const okNew = predicate(value)
      if (ok !== okNew) {
        ok = okNew
        if (ok) {
          enter?.(value, this)
        }
        else {
          leave?.(value, this)
        }
      }
    })
  }

  onDestroy(callback: ObservableCallback<T>) {
    this.#onDestroy.add(callback)
  }
}



export class MutObservable<T> extends Observable<T> {

  #valueSetter!: ValueSetter<T>

  constructor(intialValue: T) {
    super(intialValue)
    this.#valueSetter = consumeValueSetter() as ValueSetter<T>
  }

  setValue(value: T, options?: { ignoreCallbacks: boolean} ) {
    return this.#valueSetter(value, options)
  }

  setValueWithDelay(value: T, seconds: number, { clear = true } = {}) {
    setValueWithDelay(this, this.#valueSetter, value, seconds, clear)
  }

  set value(value: T) { this.setValue(value) }
}

