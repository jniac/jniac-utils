
export interface IPoint {
  x: number
  y: number
}

export type PointParams =
  | Partial<IPoint>
  | [number, number]

const set = (point: Point, x: number, y: number) => {
  point.x = x
  point.y = y
  return point
}

const ensure = (x: PointParams) => x instanceof Point ? x : new Point().set(x)

const equals = (a: Point, b: Point) => (
  a.x === b.x && a.y === b.y
)

const add = (a: Point, b: Point, receiver: Point) => {
  receiver.x = a.x + b.x
  receiver.y = a.y + b.y
  return receiver
}

const subtract = (a: Point, b: Point, receiver: Point) => {
  receiver.x = a.x - b.x
  receiver.y = a.y - b.y
  return receiver
}

export class Point {
  static ensure(x: PointParams) {
    return ensure(x)
  }
  x: number
  y: number
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }
  set(x: number, y: number): Point
  set(params: PointParams): Point
  set(...args: any[]) {
    if (args.length === 2) {
      return set(this, args[0], args[1])
    }
    if (args.length === 1) {
      const [arg] = args
      if (Array.isArray(arg)) {
        const [x, y] = arg
        return set(this, x, y)
      }
      else if (typeof arg === 'object') {
        const {
          x = 0,
          y = 0,
        } = arg
        return set(this, x, y)
      }
    }
    throw new Error(`invalid args: ${args}`)
  }
  copy(other: Point) {
    return set(this, other.x, other.y)
  }
  clone() {
    return new Point(this.x, this.y)
  }
  add(other: PointParams, receiver = new Point()) {
    return add(this, ensure(other), receiver)
  }
  subtract(other: PointParams, receiver = new Point()) {
    return subtract(this, ensure(other), receiver)
  }
  equals(other: Point) {
    return equals(this, other)
  }
  equivalent(other: PointParams) {
    return equals(this, ensure(other))
  }
}