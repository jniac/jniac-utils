import { Interval, IntervalParams } from '../geom'
import { Observable, ObservableCallback } from './Observable'

export class ObservableNumber extends Observable<number> {

  #min: number
  #max: number

  constructor(initialValue: number, { min = -Infinity, max = Infinity } = {}) {
    super(initialValue)
    this.#min = min
    this.#max = max
  }

  setMinMax(min: number, max: number, {
    ignoreCallbacks = false,
    owner = null as any,
  } = {}) {
    if (min > this.#max) {
      this.#max = min
    }
    if (max < this.#min) {
      this.#min = max
    }
    this.#min = min
    this.#max = max
    return this.setValue(this.value, { ignoreCallbacks, owner })
  }

  getMin() { return this.#min }
  setMin(value: number, {
    ignoreCallbacks = false,
    owner = null as any,
  } = {}) {
    return this.setMinMax(value, this.#max, { ignoreCallbacks, owner })
  }

  getMax() { return this.#max }
  setMax(value: number, {
    ignoreCallbacks = false,
    owner = null as any,
  } = {}) {
    return this.setMinMax(this.#min, value, { ignoreCallbacks, owner })
  }

  clamp(value: number) {
    return value < this.#min ? this.#min : value > this.#max ? this.#max : value
  }

  setValue(value: number | ((v: number) => number), {
    ignoreCallbacks = false,
    owner = null as any,
  } = {}): boolean {
    if (typeof value === 'function') {
      value = value(this.value)
    }
    value = this.clamp(value)
    return super.setValue(value, { ignoreCallbacks, owner })
  }

  /**
   * Shorthand for `obs.setValue(obs.value + delta)`
   */
  increment(delta: number | ((v: number) => number), {
    ignoreCallbacks = false,
    owner = null as any,
  } = {}): boolean {
    if (typeof delta === 'function') {
      delta = delta(this.value)
    }
    return this.setValue(this.value + delta, { ignoreCallbacks, owner })
  }

  get delta() { return this.value - this.valueOld }

  passedAbove(threshold: number) {
    return this.valueOld < threshold && this.value >= threshold
  }

  passedBelow(threshold: number) {
    return this.valueOld > threshold && this.value <= threshold
  }

  passedThrough(threshold: number) {
    return this.passedBelow(threshold) || this.passedAbove(threshold)
  }

  onPassAbove(threshold: number, callback: ObservableCallback<number, ObservableNumber>) {
    return this.onChange(() => {
      if (this.passedAbove(threshold)) {
        callback(this.value, this)
      }
    })
  }

  onPassBelow(threshold: number, callback: ObservableCallback<number, ObservableNumber>) {
    return this.onChange(() => {
      if (this.passedBelow(threshold)) {
        callback(this.value, this)
      }
    })
  }

  onPassThrough(threshold: number, callback: ObservableCallback<number, ObservableNumber>) {
    return this.onChange(() => {
      if (this.passedThrough(threshold)) {
        callback(this.value, this)
      }
    })
  }

  onStepChange(step: number, callback: ObservableCallback<number, ObservableNumber>, { execute = false, once = false } = {}) {
    let currentValue = NaN
    return this.onChange((value) => {
      let newValue = Math.round(value / step) * step
      if (currentValue !== newValue) {
        currentValue = newValue
        callback(currentValue, this)
      }
    }, { execute, once })
  }

  /**
   * Alias for `onStepChange(cb, { execute: true })` 
   */
  withStepValue(step: number, callback: ObservableCallback<number, ObservableNumber>, { once = false } = {}) {
    return this.onStepChange(step, callback, { execute: true, once })
  }

  onInterval({ interval, ...props }: {
    interval: IntervalParams
    onEnter?: ObservableCallback<number>
    onLeave?: ObservableCallback<number>
    onInnerChange?: ObservableCallback<number>
    onOuterChange?: ObservableCallback<number>
    execute?: boolean
    once?: boolean
  }) {
    const _interval = Interval.ensure(interval)
    return this.onVerify({
      verify: value => _interval.containsValue(value),
      ...props,
    })
  }

  almostEquals(value: number, tolerance?: number): boolean
  almostEquals(value: number, options?: { tolerance: number }): boolean
  almostEquals(value: number, options: any) {
    const tolerance = (typeof options === 'number' ? options : options?.tolerance) ?? 1e-9
    return Math.abs(this.value - value) <= tolerance
  }
}
