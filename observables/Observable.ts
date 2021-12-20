import { setValueWithDelay } from './utils/delay'

export type ObservableCallback<T> = (value:T, target:Observable<T>) => void
export type SetValueOptions = {
  ignoreCallbacks?: boolean
  owner?: any
}

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

export class Observable<T> {
  
  private static count:number = 0
  readonly id = Observable.count++

  #onChange = new Set() as Set<ObservableCallback<T>>
  #onDestroy = new Set() as Set<ObservableCallback<T>>

  #value:T
  get value() { return this.#value }
  set value(value:T) { this.setValue(value) }

  #valueOld:T
  get valueOld() { return this.#valueOld }

  #hasChanged = false
  get hasChanged() { return this.#hasChanged }

  #owner = null as any
  own(owner: any) {
    if (this.#owner !== null) {
      throw new Error(`Ownership has already been set.`)
    }
    this.#owner = owner
  }

  get destroyed() { return false }
  destroy: () => void

  ignoreCallbacks = false
  
  constructor(initialValue:T) {
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
  }

  setValue(value: T | ((v: T) => T), {
    ignoreCallbacks = false,
    owner = null,
  }: SetValueOptions = {}): boolean {

    if (this.#owner !== owner) {
      throw new Error(`Value cannot be changed with an invalid "owner" value.`)
    }

    if (typeof value === 'function') {
      const newValue = (value as (value: T) => T)(this.#value)
      return this.setValue(newValue)
    }

    this.#hasChanged = this.#value !== value
    if (this.#hasChanged) {
      this.#valueOld = this.#value
      this.#value = value
      if (ignoreCallbacks === false && this.ignoreCallbacks === false) {
        for (const callback of this.#onChange) {
          callback(value, this)
        }
      }
    }

    return this.#hasChanged
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

  setValueWithDelay(value: T | ((v: T) => T), seconds: number, {
    clearOnChange = true,
    clearPrevious = true,
  } = {}) {
    setValueWithDelay(this, value, seconds, clearOnChange, clearPrevious)
  }

  onChange(callback: ObservableCallback<T>, { execute = false } = {}) {
    this.#onChange.add(callback)
    if (execute) {
      callback(this.#value, this)
    }
    const destroy = () => { this.#onChange.delete(callback) }
    return { destroy }
  }

  onDestroy(callback: ObservableCallback<T>) {
    this.#onDestroy.add(callback)
  }

  /**
   * enter() is called when the first time the predicate returns true afer returning false
   * every() is called every time the predicates returns true
   * leave() is called when the first time the predicate returns false afer returning true
   */
  when(predicate: (value: T) => boolean, {
    enter,
    leave,
    every,
  } : {
    enter?: ObservableCallback<T>
    leave?: ObservableCallback<T>
    every?: ObservableCallback<T>
  }) {
    let ok = predicate(this.#value)
    if (ok) {
      enter?.(this.#value, this)
      every?.(this.#value, this)
    }
    return this.onChange(value => {
      const okNew = predicate(value)
      every?.(value, this)
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

  child<U>(predicate: (v: Observable<T>) => U) {
    const child = new Observable(predicate(this))
    const { destroy } = this.onChange(() => {
      child.setValue(() => predicate(this))
    })
    child.onDestroy(destroy)
    return child
  }

  // utils
  logOnChange(name: string) {
    return this.onChange(value => {
      console.log(`"${name}" has changed: ${value}`)
    })
  }
}
