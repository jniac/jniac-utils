import { Mut, ObservableCallback, ValueSetter } from '../types'
import { consumeValueSetter, Observable } from '../base'
import { setValueWithDelay } from '../delay'

export class ObservableNumber extends Observable<number> {

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

  onStepChange(step: number, callback: ObservableCallback<number>, { execute = false } = {}) {
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

export class MutObservableNumber extends ObservableNumber implements Mut<number> {
  
  #min: number
  #max: number
  #valueSetter!: ValueSetter<number>

  constructor(intialValue: number, {
    min = -Infinity,
    max = Infinity,
  } = {}) {
    super(intialValue)
    this.#min = min
    this.#max = max
    this.#valueSetter = consumeValueSetter() as ValueSetter<number>
  }

  setValue(value: number, { ignoreCallbacks = false } = {}) {
    value = value < this.#min ? this.#min : value > this.#max ? this.#max : value
    return this.#valueSetter(value, { ignoreCallbacks })
  }

  setValueWithDelay(value: number, seconds: number, { clear = true } = {}) {
    setValueWithDelay(this, this.setValue, value, seconds, clear)
  }

  set value(value: number) { this.setValue(value) }
}
