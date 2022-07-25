
export interface Variable<T> {
  
  derivative: Variable<T> | null
  derivativeCount: number
  
  size: number
  floatSize: 32 | 64

  value: T
  newValue: T
  currentValue: T
  sum: T
  average: T
  
  values: () => Generator<T, void, unknown>
  fill: (value: T) => this
  setValue: (value: T, asNewValue: boolean) => this
  setCurrentValue: (value: T) => this
  setNewValue: (value: T) => this

}
