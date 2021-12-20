import { bitmask } from './utils/bitmask'
import { Observable, SetValueOptions } from './Observable'

export class ObservableBitmask extends Observable<number> {

  constructor(initialMask: number) {
    super(bitmask.apply(initialMask, 0))
  }

  test(mask: number) {
    return bitmask.compare(mask, this.value)
  }

  maskChanged(mask: number) {
    return (
      bitmask.compare(mask, this.value) !== bitmask.compare(mask, this.valueOld)
    )
  }

  onMaskChange(mask: number, callback: (match: boolean) => void, { execute = false } = {}) {
    return this.onChange(() => {
      const match = bitmask.compare(mask, this.value)
      const matchOld = bitmask.compare(mask, this.valueOld)
      if (match !== matchOld) {
        callback(match)
      }
    }, { execute })
  }

  toggle(mask: number, options?: SetValueOptions) {
    this.setValue(bitmask.apply(mask, this.value), options)
  }
}