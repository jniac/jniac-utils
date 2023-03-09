
export type GridIteration = Readonly<{
  x: number
  y: number
  i: number
  centerX: number
  centerY: number
}>
export function grid(column: number, row: number): Generator<GridIteration>
export function grid(size: { x: number, y: number }): Generator<GridIteration>
export function* grid(...args: any[]) {
  let row = 4, column = 4
  if (args.length > 1) {
    [row, column] = args
  } else {
    ({ x: row, y: column } = args[0])
  }
  let x = 0, y = 0, i = 0
  const iteration = {
    get x() { return x },
    get y() { return y },
    get i() { return i },
    get centerX() { return x - (row - 1) / 2 },
    get centerY() { return y - (column - 1) / 2 },
  }
  for (y = 0; y < row; y++) {
    for (x = 0; x < column; x++) {
      yield iteration
      i++
    }
  }
}

export function* centerGrid(columnHalf = 4, rowHalf = 4) {
  let i = 0
  for (let y = -rowHalf; y < rowHalf + 1; y++) {
    for (let x = -columnHalf; x < columnHalf + 1; x++) {
      yield { x, y, i }
      i++
    }
  }
}
