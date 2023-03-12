
export class Array2d<T = any> extends Array<T> {
  #props: { col: number, count: number }

  constructor(col = 4, row = 4, defaultValue?: T) {
    const count = col * row
    super(count)
    this.#props = {
      col,
      count,
    }
    if (defaultValue !== undefined) {
      this.fill(defaultValue)
    }
  }

  get(x: number, y: number): T {
    const { col } = this.#props
    return this[y * col + x]
  }

  set(x: number, y: number, value: T): this {
    const { col } = this.#props
    this[y * col + x] = value
    return this
  }

  toGridString(stringifier: (value: T) => string, separator = '') {
    const { col, count } = this.#props
    const row = count / col
    const lines: string[] = new Array(row)
    for (let y = 0; y < row; y++) {
      const line: string[] = []
      for (let x = 0; x < col; x++) {
        line[x] = stringifier(this[y * col + x])
      }
      lines[y] = line.join(separator)
    }
    return lines.join('\n')
  }
}
