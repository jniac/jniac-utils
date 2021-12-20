import { Observable, SetValueOptions } from './Observable'


export class ObservableBitmask extends Observable<number> {

  setIndex(index: number, value: boolean, options?: SetValueOptions) {
    if (value) {
      const n = this.value | (1 << index)
      this.setValue(n, options)
    }
    else {
      const n = this.value & ~(1 << index)
      this.setValue(n, options)
    }
  } 
}