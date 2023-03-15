type Iteration = { i: number, x: number, y: number }

export class Array2d<T = any> {
  array: T[]
  #props: { col: number, count: number }

  get col() { return this.#props.col }
  get row() { return this.#props.count / this.#props.col }
  get count() { return this.#props.count }

  constructor(col = 4, row = 4, defaultValue?: T) {
    const count = col * row
    this.array = new Array(count)
    this.#props = {
      col,
      count,
    }
    if (defaultValue !== undefined) {
      this.array.fill(defaultValue)
    }
  }

  get(x: number, y: number): T {
    const { col } = this.#props
    return this.array[y * col + x]
  }

  set(x: number, y: number, value: T): this {
    const { col } = this.#props
    this.array[y * col + x] = value
    return this
  }

  gridMap<U>(callback: (value: T, iteration: Iteration) => U): Array2d<U> {
    const { col, count } = this.#props
    const row = count / col
    const result = new Array2d<U>(col, row)
    for (let i = 0; i < count; i++) {
      const y = Math.floor(i / col)
      const x = i - y * col
      result.array[i] = callback(this.array[i], { i, x, y })
    }
    return result
  }

  toGridString(stringifier: (value: T) => string = v => !!v ? 'X' : '•', separator = '') {
    const { col, count } = this.#props
    const row = count / col
    const lines: string[] = new Array(row)
    for (let y = 0; y < row; y++) {
      const line: string[] = []
      for (let x = 0; x < col; x++) {
        line[x] = stringifier(this.array[y * col + x])
      }
      lines[y] = line.join(separator)
    }
    return lines.join('\n')
  }
}

export const makeArray2d = <T = Iteration>(col: number, row: number, initializer?: (iteration: Iteration) => T): Array2d<T> => {
  const array = new Array2d<T>(col, row)
  const { count } = array
  for (let i = 0; i < count; i++) {
    const y = Math.floor(i / col)
    const x = i - y * col
    const iteration = { i, x, y }
    array.array[i] = initializer?.(iteration) ?? (iteration as T)
  }
  return array
}
