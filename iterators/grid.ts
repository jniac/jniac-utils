
export function* grid(column = 4, row = 4) {
  for (let y = 0; y < row; y++) {    
    for (let x = 0; x < column; x++) {
      yield { x, y }
    }
  }
}
