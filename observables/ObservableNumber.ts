import { Observable } from './Observable'

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
    })
  }
}
