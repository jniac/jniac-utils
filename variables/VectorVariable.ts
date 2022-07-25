import { Variable } from './types'

type FloatArray = Float32Array | Float64Array

const getArray = (length: number, defaultValue: number = 0) => {
  return Array.from({ length }).fill(defaultValue) as number[]
}

const getFloatArray = (length: number, { floatSize }: { floatSize: number }) => {
  return floatSize === 64 ? new Float64Array(length) : new Float32Array(length)
}

const vectorToString = (vector: ArrayLike<number>, { precision = 1 } = {}) => {
  let str = ''
  for (let i = 0, max = vector.length; i < max; i++) {
    const x = vector[i].toFixed(precision)
    str = str.length > 0 ? `${str}, ${x}` : x
  }
  return `(${str})`
}

export class VectorVariable implements Variable<ArrayLike<number>> {

  #derivative: VectorVariable | null = null

  #vectorSize: number
  #array: FloatArray
  #index = -1
  #sum: FloatArray

  get vectorSize() { return this.#vectorSize }
  get size() { return this.#array.length / this.#vectorSize }
  get floatSize() { return this.#array instanceof Float32Array ? 32 : 64 }

  get value() { return this.getValue() }

  get newValue() { return this.getValue() }
  set newValue(value: ArrayLike<number>) { this.setNewValue(value) }

  get currentValue() { return this.getValue() }
  set currentValue(value: ArrayLike<number>) { this.setCurrentValue(value) }

  get sum() { return this.#sum }
  get average() { return this.getAverage() }

  get derivative() { return this.#derivative }
  get derivativeCount(): number { return this.#derivative ? this.#derivative.derivativeCount + 1 : 0 }

  get array() { return this.#array }

  constructor(initialValue: ArrayLike<number>, {
    size = 16,
    floatSize = 64 as (32 | 64),
    derivativeCount = 0,
  } = {}) {
    const vectorSize = initialValue.length
    this.#vectorSize = vectorSize
    this.#array = getFloatArray(size * vectorSize, this)
    this.#sum = getFloatArray(vectorSize, this)
    this.fill(initialValue)
    if (derivativeCount > 0) {
      this.#derivative = new VectorVariable(getArray(vectorSize), { size, floatSize, derivativeCount: derivativeCount - 1 })
    }
  }

  getValue(reverseIndex = 0, vector = getFloatArray(this.#vectorSize, this)) {
    const vectorSize = this.#vectorSize
    const array = this.#array
    const index = this.#index
    const size = array.length / vectorSize
    if (reverseIndex > size) {
      throw new Error(`'reverseIndex' is too big.`)
    }
    const valueIndex = (index - reverseIndex + size) % size
    for (let k = 0; k < vectorSize; k++) {
      vector[k] = array[valueIndex * vectorSize + k]
    }
    return vector
  }

  getAverage() {
    const vectorSize = this.#vectorSize
    const size = this.#array.length / vectorSize
    const sum = this.#sum
    const vector = getFloatArray(vectorSize, this)
    for (let k = 0; k < vectorSize; k++) {
      vector[k] = sum[k] / size
    }
    return vector
  }

  *values() {
    const vectorSize = this.#vectorSize
    const array = this.#array
    const index = this.#index
    const size = array.length / vectorSize
    for (let i = 0; i < size; i++) {
      const vector = getFloatArray(vectorSize, this)
      const valueIndex = (index - i + size) % size
      for (let k = 0; k < vectorSize; k++) {
        vector[k] = array[valueIndex * vectorSize + k]
      }
      yield vector
    }
  }

  fill(value: ArrayLike<number>) {
    if (value.length !== this.#vectorSize) {
      throw new Error(`Invalid value size. Expected value size: ${this.#vectorSize}. Received: ${value.length}`)
    }
    const vectorSize = this.#vectorSize
    const array = this.#array
    const sum = this.#sum
    const size = array.length / vectorSize
    for (let k = 0; k < vectorSize; k++) {
      sum[k] = value[k] * size
    }
    for (let i = 0; i < size; i++) {
      for (let k = 0; k < vectorSize; k++) {
        array[i * vectorSize + k] = value[k]
      }
    }
    if (this.#derivative) {
      this.#derivative.fill(getArray(vectorSize))
    }
    return this
  }

  setValue(value: ArrayLike<number>, asNewValue: boolean) {
    if (value.length !== this.#vectorSize) {
      throw new Error(`Invalid value size. Expected value size: ${this.#vectorSize}. Received: ${value.length}`)
    }

    const array = this.#array
    const sum = this.#sum
    const index = this.#index
    const vectorSize = this.#vectorSize
    const size = array.length / vectorSize

    if (this.#derivative) {
      const delta = this.getValue()
      for (let k = 0; k < vectorSize; k++) { 
        delta[k] = value[k] - delta[k]
      }
      this.#derivative.setValue(delta, asNewValue)
    }

    const indexNew = asNewValue ? (index + 1 < size ? index + 1 : 0) : index
    for (let k = 0; k < vectorSize; k++) {
      const valueOld = array[indexNew * vectorSize + k]
      sum[k] += value[k] - valueOld
      array[indexNew * vectorSize + k] = value[k]
    }

    // At the end, update:
    this.#index = indexNew

    return this
  }

  setCurrentValue(value: ArrayLike<number>) {
    return this.setValue(value, false)
  }

  setNewValue(value: ArrayLike<number>) {
    return this.setValue(value, true)
  }

  toString({ precision = 1, floatMaxCount = 16 } = {}) {
    const { vectorSize, size, sum, average } = this
    const tab = '  '
    const data = [...this.values()]
      .map(v => vectorToString(v, { precision }))
      .join(`\n${tab}${tab}`)
    const trunc = floatMaxCount < size ? ', ...' : ''
    return (
      `VectorVariable(${vectorSize})<${size}, f${this.floatSize}, d:${this.derivativeCount}>` +
      `\n${tab}sum: ${vectorToString(sum, { precision })}` +
      `\n${tab}average: ${vectorToString(average, { precision: precision + 2 })}` +
      `\n${tab}values:` +
      `\n${tab}${tab}${data}${trunc}`
    )
  }
}

