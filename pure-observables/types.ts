import { Observable } from './base'

export type ValueSetter<T> = (value: T, options?: { ignoreCallbacks?: boolean} ) => boolean

export type ObservableCallback<T> = (value: T, target: Observable<T>) => void

export interface Mut<T> {
  setValue: ValueSetter<T>
  value: T
}
