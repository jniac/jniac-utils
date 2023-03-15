
export type GridIteration = Readonly<{
  x: number
  y: number
  i: number
  count: number
  centerX: number
  centerY: number
}>

function resolveColRow(...args:any[]): readonly [number, number] {
  let col = 4
  let row = 4

  if (args.length === 1 && Array.isArray(args[0])) {
    [args] = args
  }

  if (args.length > 1) {
    [col, row] = args
  } else {
    ({ x: col, y: row } = args[0])
  }

  return [col, row]
}

export function grid(col: number, row: number): Generator<GridIteration>
export function grid(size: { x: number, y: number }): Generator<GridIteration>
export function* grid(...args: any[]) {
  const [col, row] = resolveColRow(args)
  const count = col * row
  let x = 0
  let y = 0
  let i = 0

  const iteration: GridIteration = {
    get x() { return x },
    get y() { return y },
    get i() { return i },
    get count() { return count },
    get centerX() { return x - (col - 1) / 2 },
    get centerY() { return y - (row - 1) / 2 },
  }
  
  for (i = 0; i < count; i++) {
    y = Math.floor(i / col)
    x = i - y * col
    yield iteration
  }
}

export function* centerGrid(colHalf = 4, rowHalf = 4) {
  let i = 0
  for (let y = -rowHalf; y < rowHalf + 1; y++) {
    for (let x = -colHalf; x < colHalf + 1; x++) {
      yield { x, y, i }
      i++
    }
  }
}

/**
 * Returns a FLAT array, filled with "grid" items. Grid items are made from GridIteration.
 * 
 * NOTE: makeGridArray is FLAT, it means it is not a 2D array (`GridIteration[][]`) but a regular array (`GridIteration[]`)
 * 
 * Usage:
 * ```
 * makeGridArray(4, 3).map(({ x, y }) => new Vector2(x, y))
 * makeGridArray(4, 3).map(({ centerX, centerY }) => new Vector2(centerX, centerY))
 * ```
 */
export function makeGridArray(col: number, row: number): GridIteration[]
export function makeGridArray(size: { x: number, y: number }): GridIteration[]
export function makeGridArray(...args: any[]): GridIteration[] {
  const [col, row] = resolveColRow(args)
  const array: GridIteration[] = new Array(col * row)
  for (const iteration of grid(col, row)) {
    array[iteration.i] = { ...iteration }
  }
  return array
}