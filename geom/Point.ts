export type IPoint = {
  x: number
  y: number
}

export class Point {
  x: number
  y: number
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }
  copy(other: IPoint) {
    this.x = other.x
    this.y = other.y
    return this
  }
  clone() {
    return new Point(this.x, this.y)
  }
  add(other: IPoint) {
    this.x += other.x
    this.y += other.y
    return this
  }
  subtract(other: IPoint) {
    this.x -= other.x
    this.y -= other.y
    return this
  }
}