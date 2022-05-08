
import { deepClone, deepPartialEquals, deepPartialCopy, deepGet } from '../object/clone'
import { Observable, SetValueOptions } from './Observable'

// https://stackoverflow.com/questions/41980195/recursive-partialt-in-typescript
type RecursivePartial<T> = {
  [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> :
    T[P]
};

/**
 * Tricky concept.
 * 
 * Be aware that valueOld only refers to the previous last change state.
 * This won't work:
 * 
 * ```
 * const x = new ObservableObject({ name: 'foo', age: 7 })
 * x.updateValue({ age: 8 })
 * x.valueOld.age // 7 (ok)
 * x.updateValue({ name: 'bar })
 * x.valueOld.age // 8 (ok but expected?)
 * ``` 
 */
export class ObservableObject<T> extends Observable<T> {

  constructor(initialValue: T) {
    super(initialValue)
    this._setValueOld(deepClone(initialValue))
  }

  /**
   * Same as setValue but WITHOUT changing the inner value reference, but its properties only (deep copy).
   */
  updateValue(value: RecursivePartial<T> | ((v: T) => RecursivePartial<T>), { 
    ignoreCallbacks = false, 
    owner = null 
  }: SetValueOptions = {}) {

    if (this.owner !== owner) {
      throw new Error(`Value cannot be changed with an invalid "owner" value.`)
    }

    if (typeof value === 'function') {
      value = (value as (value: T) => RecursivePartial<T>)(this.value)
    }

    const hasChanged = deepPartialEquals(value, this.value) === false

    if (hasChanged) {
      this._permuteValues()
      deepPartialCopy(value, this.value)
      this._setHasChanged(hasChanged)
      if (ignoreCallbacks === false && this.ignoreCallbacks === false) {
        this.triggerChangeCallbacks()
      }
   }

    return hasChanged
  }

  getPropValue(path: string | (string | number | symbol)[]) {
    return deepGet(this.value, path)
  }

  onPropChange<V = any>(path: string | (string | number | symbol)[], callback: (value: V, valueOld: V, target: ObservableObject<T>) => void)
  {
    let valueOld = this.getPropValue(path)
    return this.onChange(() => {
      const value = this.getPropValue(path)
      if (value !== valueOld) {
        callback(value, valueOld, this)
        valueOld = value
      }
    })
  }
}