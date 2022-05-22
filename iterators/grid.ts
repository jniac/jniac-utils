
export function* grid(column = 4, row = 4) {
  let i = 0
  for (let y = 0; y < row; y++) {    
    for (let x = 0; x < column; x++) {
      yield { x, y, i }
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
