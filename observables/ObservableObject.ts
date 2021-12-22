
import { deepClone, deepEquals, deepCopy } from '../object'
import { Observable, SetValueOptions } from './Observable'

export class ObservableObject<T> extends Observable<T> {

  constructor(initialValue: T) {
    super(initialValue)
    this._setValueOld(deepClone(initialValue))
  }

  /**
   * Same as setValue but WITHOUT changing the inner value reference, but its properties only (deep copy).
   */
  updateValue(value: T | ((v: T) => T), { 
    ignoreCallbacks = false, 
    owner = null 
  }: SetValueOptions = {}) {

    if (this.owner !== owner) {
      throw new Error(`Value cannot be changed with an invalid "owner" value.`)
    }

    if (typeof value === 'function') {
      value = (value as (value: T) => T)(this.value)
    }

    const hasChanged = deepEquals(this.value, value) === false

    if (hasChanged) {
      this._permuteValues()
      deepCopy(value, this.value)
      this._setHasChanged(hasChanged)
      if (ignoreCallbacks === false && this.ignoreCallbacks === false) {
        this.triggerChangeCallbacks()
      }
   }

    return hasChanged
  }
}