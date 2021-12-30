import { Observable, SetValueOptions, WhenOptionA, WhenOptionB } from './Observable'

export class ObservableBoolean extends Observable<boolean> {
  
  isTrue() {
    return this.value
  }
  
  isFalse() {
    return this.value === false
  }

  whenTrue(option: WhenOptionA<boolean> | WhenOptionB<boolean>) {
    return this.when(value => value === true, option)
  }

  whenFalse(option: WhenOptionA<boolean> | WhenOptionB<boolean>) {
    return this.when(value => value === false, option)
  }

  toggle() {
    this.setValue(!this.value)
    return this
  }

  setTrue(option?: SetValueOptions) {
    return this.setValue(true, option)
  }

  setFalse(option?: SetValueOptions) {
    return this.setValue(false, option)
  }
}