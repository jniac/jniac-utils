import { Observable } from './Observable'

export class ObservableNumber extends Observable<number> {

  #min: number
  #max: number

  constructor(initialValue: number, { min = -Infinity, max = Infinity } = {}) {
    super(initialValue)
    this.#min = min
    this.#max = max
  }

  setValue(value: number | ((v: number) => number), { 
    ignoreCallbacks = false,
    owner = null as any,
  } = {}): boolean {
      if (typeof value === 'function') {
        value = value(this.value)
      }
      value = value < this.#min ? this.#min : value > this.#max ? this.#max : value
      return super.setValue(value, { ignoreCallbacks, owner })
  }

  get delta() { return this.value - this.valueOld }
  
  passedAbove(threshold: number ) {
    return this.valueOld < threshold && this.value >= threshold
  }
  
  passedBelow(threshold: number ) {
    return this.valueOld > threshold && this.value <= threshold
  }

  passedThrough(threshold: number) {
    return this.passedBelow(threshold) || this.passedAbove(threshold)
  }
  
  onPassAbove(threshold: number, callback: (target: ObservableNumber) => void) {
    return this.onChange(() => {
      if (this.passedAbove(threshold)) {
        callback(this)
      }
    })
  }
  
  onPassBelow(threshold: number, callback: (target: ObservableNumber) => void) {
    return this.onChange(() => {
      if (this.passedBelow(threshold)) {
        callback(this)
      }
    })
  }

  onPassThrough(threshold: number, callback: (target: ObservableNumber) => void) {
    return this.onChange(() => {
      if (this.passedThrough(threshold)) {
        callback(this)
      }
    })
  }

  onStepChange(step: number, callback:(value: number, target:Observable<number>) => void, { execute = false } = {}) {
    let currentValue = Math.round(this.value / step) * step
    return this.onChange(() => {
      let newValue = Math.round(this.value / step) * step
      if (currentValue !== newValue) {
        currentValue = newValue
        callback(currentValue, this)
      }
    }, { execute })
  }
}
