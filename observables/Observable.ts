
export class Observable<T> {
  private static count:number = 0
  readonly id = Observable.count++

  #callbacks:Set<(value:T, target:Observable<T>) => void> = new Set()

  #value:T
  get value() { return this.#value }
  set value(value:T) { this.setValue(value) }

  #valueOld:T
  get valueOld() { return this.#valueOld }

  #hasChanged = false
  get hasChanged() { return this.#hasChanged }
  
  constructor(initialValue:T) {
    this.#valueOld = initialValue
    this.#value = initialValue
  }

  setValue(value: T | ((value: T) => T)): boolean {
    window.clearTimeout(this.#setValueWithDelayTimeoutID)

    if (typeof value === 'function') {
      const newValue = (value as (value: T) => T)(this.#value)
      return this.setValue(newValue)
    }

    this.#hasChanged = this.#value !== value
    if (this.#hasChanged) {
      this.#valueOld = this.#value
      this.#value = value
      for (const callback of this.#callbacks) {
        callback(value, this)
      }
    }

    return this.#hasChanged
  }

  #setValueWithDelayTimeoutID = -1
  setValueWithDelay(value: T | ((value: T) => T), seconds: number) {
    window.clearTimeout(this.#setValueWithDelayTimeoutID)
    this.#setValueWithDelayTimeoutID = window.setTimeout(() => this.setValue(value), seconds * 1000)
  }

  onChange(callback:(value:T, target:Observable<T>) => void, { execute = false } = {}) {
    this.#callbacks.add(callback)
    if (execute) {
      callback(this.#value, this)
    }
    const destroy = () => { this.#callbacks.delete(callback) }
    return { destroy }
  }

  clear() {
    this.#callbacks.clear()
  }
}
