
export class FloatVariable {
  
  #derivative: FloatVariable | null = null

  #array: Float32Array | Float64Array
  #index = 0
  #sum!: number

  get size() { return this.#array.length }
  get floatSize() { return this.#array instanceof Float32Array ? 32 : 64 }

  get value() { return this.#array[this.#index] }
  set value(value: number) { this.setNewValue(value) }

  get sum() { return this.#sum }
  get average() { return this.#sum / this.#array.length }

  get derivative() { return this.#derivative }
  get derivativeCount(): number { return this.#derivative ? this.#derivative.derivativeCount + 1 : 0 }

  constructor(initialValue: number, {
    size = 16,
    floatSize = 32 as (32 | 64),
    derivativeCount = 0,
  } = {}) {
    this.#array = floatSize === 32 ? new Float32Array(size) : new Float64Array(size)
    this.fill(initialValue)
    if (derivativeCount > 0) {
      this.#derivative = new FloatVariable(0, { size, floatSize, derivativeCount: derivativeCount - 1 })
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
  }

  setNewValue(value: number) {
    const array = this.#array
    const index = this.#index
    const size = array.length

    if (this.#derivative) {
      const valueOld = array[index]
      const delta = value - valueOld
      this.#derivative.setNewValue(delta)
    }

    const indexNew = index < size ? index + 1 : 0
    this.#sum += value - array[indexNew]

    // At the end, update:
    array[indexNew] = value
    this.#index = indexNew
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
