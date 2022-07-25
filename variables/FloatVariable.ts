import { Variable } from './types'

export class FloatVariable implements Variable<number> {
  
  #derivative: FloatVariable | null = null

  #array: Float32Array | Float64Array
  #index = 0
  #sum!: number

  get size() { return this.#array.length }
  get floatSize() { return this.#array instanceof Float32Array ? 32 : 64 }

  get value() { return this.#array[this.#index] }

  get newValue() { return this.#array[this.#index] }
  set newValue(value: number) { this.setNewValue(value) }

  get currentValue() { return this.#array[this.#index] }
  set currentValue(value: number) { this.setCurrentValue(value) }

  get sum() { return this.#sum }
  get average() { return this.#sum / this.#array.length }

  get derivative() { return this.#derivative }
  get derivativeCount(): number { return this.#derivative ? this.#derivative.derivativeCount + 1 : 0 }

  constructor(initialValue: number, {
    size = 16,
    floatSize = 64 as (32 | 64),
    derivativeCount = 0,
  } = {}) {
    this.#array = floatSize === 32 ? new Float32Array(size) : new Float64Array(size)
    this.fill(initialValue)
    if (derivativeCount > 0) {
      this.#derivative = new FloatVariable(0, { size, floatSize, derivativeCount: derivativeCount - 1 })
    }
  }

  *values() {
    const array = this.#array
    const index = this.#index
    const size = array.length
    for (let i = 0; i < size; i++) {
      const valueIndex = (index - i + size) % size
      yield array[valueIndex]
    }
  }

  fill(value: number) {
    const size = this.#array.length
    this.#sum = value * size
    for (let i = 0; i < size; i++) {
      this.#array[i] = value
    }
    if (this.#derivative) {
      this.#derivative.fill(0)
    }
    return this
  }

  setValue(value: number, asNewValue: boolean) {
    const array = this.#array
    const index = this.#index
    const size = array.length

    if (this.#derivative) {
      const valueOld = array[index]
      const delta = value - valueOld
      this.#derivative.setValue(delta, asNewValue)
    }

    const indexNew = asNewValue ? (index + 1 < size ? index + 1 : 0) : index
    this.#sum += value - array[indexNew]

    // At the end, update:
    array[indexNew] = value
    this.#index = indexNew

    return this
  }

  setCurrentValue(value: number) {
    return this.setValue(value, false)
  }

  setNewValue(value: number) {
    return this.setValue(value, true)
  }

  toString({ precision = 2, floatMaxCount = 16 } = {}) {
    const array = this.#array
    const index = this.#index
    const size = array.length
    const data = Array.from({ length: size })
    .map((_, i) => array[(index - i + size * 2) % size])
    .map(x => x.toFixed(precision))
    .join(', ')
    const tab = '  '
    const trunc = floatMaxCount < size ? ', ...' : ''
    return (
      `FloatVariable<${size}, f${this.floatSize}, d:${this.derivativeCount}>` + 
      `\n${tab}sum: ${this.sum.toFixed(precision)}, average: ${this.average.toFixed(precision + 2)}` +
      `\n${tab}[${data}${trunc}]`
    )
  }
}

