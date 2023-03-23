type Iteration = { i: number, x: number, y: number }

type Array2dType<T> = {
  array: T[]
  readonly count: number
  readonly col: number
  readonly row: number
  entries(): Generator<[Iteration, T], Array2dType<T>>
  get(x: number, y: number): T
  set(x: number, y: number, value: T): Array2dType<T>
  gridMap<U>(callback: (value: T, iteration: Iteration) => U): Array2dType<U>
  toGridString(stringifier?: (value: T) => any, separator?: string): string
}

const cache = new WeakMap<Array<any>, { col: number, row: number }>()

/**
 * Array2d is a small wrapper around a flat array that provides easier way to handle 
 * the inner values.
 * 
 * ### Usage:
 * ```
 * const foo = Array2d(6, 15, ({ x, y }) => {
 *   return {
 *     point: new Vector2(x, y),
 *     magnitude: Math.sqrt(x * x + y * y),
 *   }
 * })
 * console.log(foo.array) // (30) [{...}, {...}, {...}, ...]
 * console.log(foo.get(3, 4).magnitude) // 5 (the first Pythagorean triple!)
 * 
 * // let forget the wrapper:
 * const { array: fooArray } = foo
 * // and later, because you know that `fooArray` is flat array reference that represents a 2D array:
 * console.log(Array2d(fooArray).col, Array2d(fooArray).row) // 6 15 (row & col has been memoized in a cache (WeakMap))
 * console.log(Array2d(fooArray).get(5, 12).magnitude) // 13 (the second Pythagorean triple!) * ```
 * ```
 */
export function Array2d<T>(col: number, row: number, initializer?: (iteration: Iteration) => T): Array2dType<T>
export function Array2d<T>(array: T[], col?: number, row?: number): Array2dType<T>
export function Array2d<T>(...args: any[]): Array2dType<T> {
  let col = 0, row = 0
  let array: T[]
  
  // Overload #1: (col, row, initializer?)
  if (typeof args[0] === 'number') {
    col = args[0]
    row = args[1]
    const initializer = args[2] ?? ((x: Iteration) => x)
    const count = col * row
    array = new Array(count)
    cache.set(array, { col, row })
    for (let i = 0; i < count; i++) {
      const y = Math.floor(i / col)
      const x = i - y * col
      const iteration: Iteration = { i, x, y }
      array[i] = initializer(iteration)
    }
  }
  // Overload #2: (array, col?, row?)
  else if (Array.isArray(args[0])) {
    array = args[0]
    if (cache.has(array)) {
      const info = cache.get(array)!
      col = info.col
      row = info.row
      if (args.length > 1) {
        console.warn(`Extra parameters will be ignored since the given array has already row & col defined: ${col}x${row} (received: ${args[1]}x${args[2]}).`)
      }
    } else {
      if (args.length === 3) {
        col = args[1]
        row = args[2]
        cache.set(array, { col, row })
      } else {
        throw new Error(`Insufficient args provided. "col" & "row" are missing.`)
      }
    }
  } 
  // Overload failed: 
  else {
    throw new Error(`Invalid arguments! Typescript should have prevented the current usage.`)
  }

  const count = col * row

  const handler: Array2dType<T> = {
    array,
    get count() { return col * row },
    get col() { return col },
    get row() { return row },

    *entries() {
      for (let i = 0; i < count; i++) {
        const y = Math.floor(i / col)
        const x = i - y * col
        const iteration: Iteration = { i, x, y }
        yield [iteration, array[i]] as [Iteration, T]
      }
      return handler
    },
    
    get(x: number, y: number): T {
      return array[y * col + x]
    },

    set(x: number, y: number, value: T) {
      array[y * col + x] = value
      return handler
    },

    gridMap<U>(callback: (value: T, iteration: Iteration) => U): Array2dType<U> {
      const result = new Array<U>(count)
      cache.set(result, { col: col, row: row })
      for (let i = 0; i < count; i++) {
        const y = Math.floor(i / col)
        const x = i - y * col
        result[i] = callback(array[i], { i, x, y })
      }
      return Array2d(result)
    },

    toGridString(stringifier: (value: T) => any = (value => !!value ? 'X' : '•'), separator = ''): string {
      const lines: string[] = new Array(row)
      for (let y = 0; y < row; y++) {
        const line: string[] = []
        for (let x = 0; x < col; x++) {
          const value = stringifier(array[y * col + x])
          line[x] = typeof value === 'string' ? value : (!!value ? 'X' : '•')
        }
        lines[y] = line.join(separator)
      }
      return lines.join('\n')
    },
  }

  return handler
}
