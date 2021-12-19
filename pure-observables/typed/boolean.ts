import { consumeValueSetter, Observable } from '../base'
import { Mut, ValueSetter } from "../types"
import { setValueWithDelay } from '../delay'

export class ObservableBoolean extends Observable<boolean> {
  
  isTrue() {
    return this.value
  }
  
  isFalse() {
    return this.value === false
  }
}

export class MutObservableBoolean extends ObservableBoolean implements Mut<boolean> {

  #valueSetter!: ValueSetter<boolean>

  constructor(intialValue: boolean) {
    super(intialValue)
    this.#valueSetter = consumeValueSetter() as ValueSetter<boolean>
  }

  setValue(value: boolean, { ignoreCallbacks = false } = {}) {
    return this.#valueSetter(value, { ignoreCallbacks })
  }

  setValueWithDelay(value: boolean, seconds: number, { clear = true } = {}) {
    setValueWithDelay(this, this.#valueSetter, value, seconds, clear)
  }

  set value(value: boolean) { this.setValue(value) }



  // Boolean specific:

  toggle() {
    this.setValue(!this.value)
    return this
  }
}