import { Observable } from './Observable'

export class ObservableBoolean extends Observable<boolean> {
  
  isTrue() {
    return this.value
  }
  
  isFalse() {
    return this.value === false
  }

  toggle() {
    this.setValue(!this.value)
    return this
  }
}