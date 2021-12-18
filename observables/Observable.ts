
type ObservableCallback<T> = (value:T, target:Observable<T>) => void

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

  destroyed = false
  destroy: () => void
  
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

  setValue(value: T | ((value: T) => T), {
    ignoreCallbacks = false
  } = {}): boolean {
    window.clearTimeout(this.#setValueWithDelayTimeoutID)

    if (typeof value === 'function') {
      const newValue = (value as (value: T) => T)(this.#value)
      return this.setValue(newValue)
    }

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

  #setValueWithDelayTimeoutID = -1
  setValueWithDelay(value: T | ((value: T) => T), seconds: number) {
    window.clearTimeout(this.#setValueWithDelayTimeoutID)
    this.#setValueWithDelayTimeoutID = window.setTimeout(() => this.setValue(value), seconds * 1000)
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
}
