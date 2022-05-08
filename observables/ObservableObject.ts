
import { deepClone, deepPartialEquals, deepPartialCopy, deepGet } from '../object/clone'
import { Observable, SetValueOptions } from './Observable'

export class ObservableObject<T> extends Observable<T> {

  constructor(initialValue: T) {
    super(initialValue)
    this._setValueOld(deepClone(initialValue))
  }

  /**
   * Same as setValue but WITHOUT changing the inner value reference, but its properties only (deep copy).
   */
  updateValue(value: Partial<T> | ((v: T) => Partial<T>), { 
    ignoreCallbacks = false, 
    owner = null 
  }: SetValueOptions = {}) {

    if (this.owner !== owner) {
      throw new Error(`Value cannot be changed with an invalid "owner" value.`)
    }

    if (typeof value === 'function') {
      value = (value as (value: T) => Partial<T>)(this.value)
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

  getPropValueOld(path: string | (string | number | symbol)[]) {
    return deepGet(this.valueOld, path)
  }

  onPropChange<V = any>(path: string | (string | number | symbol)[], callback: (value: V, valueOld: V, target: ObservableObject<T>) => void)
  {
    return this.onChange(() => {
      const value = this.getPropValue(path)
      const valueOld = this.getPropValueOld(path)
      if (value !== valueOld) {
        callback(value, valueOld, this)
      }
    })
  }
}