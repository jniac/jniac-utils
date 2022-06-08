
export interface IPoint {
  x: number
  y: number
}

export type PointParams =
  | Partial<IPoint>
  | [number, number]
  | number[]

const set = <T extends IPoint>(point: T, x: number, y: number) => {
  point.x = x
  point.y = y
  return point
}

const ensure = (p: PointParams) => p instanceof Point ? p : new Point().set(p)

const ensureIPoint = (p: PointParams) => (p && typeof p === 'object' && ('x' in p && 'y' in p)) ? p as IPoint : new Point().set(p)

const equals = (a: IPoint, b: IPoint) => (
  a.x === b.x && a.y === b.y
)

const add = <T extends IPoint>(a: IPoint, b: IPoint, receiver: T) => {
  receiver.x = a.x + b.x
  receiver.y = a.y + b.y
  return receiver
}

const subtract = <T extends IPoint>(a: IPoint, b: IPoint, receiver: T) => {
  receiver.x = a.x - b.x
  receiver.y = a.y - b.y
  return receiver
}

const sqMagnitude = (p: IPoint) => {
  const { x, y } = p
  return x * x + y * y
}

const magnitude = (p: IPoint) => Math.sqrt(sqMagnitude(p))

export class Point {
  
  static ensure = ensure
  static ensureIPoint = ensureIPoint

  static add(lhs: PointParams, rhs: PointParams, receiver: Point = new Point()) {
    return add(ensureIPoint(lhs), ensureIPoint(rhs), ensure(receiver))
  }
  static subtract(lhs: PointParams, rhs: PointParams, receiver: Point = new Point()) {
    return subtract(ensureIPoint(lhs), ensureIPoint(rhs), ensure(receiver))
  }
  static distance(p0: PointParams, p1: PointParams) {
    return magnitude(Point.subtract(p0, p1, dummy))
  }
  static sqDistance(p0: PointParams, p1: PointParams) {
    return sqMagnitude(Point.subtract(p0, p1, dummy))
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
  copy(other: IPoint) {
    return set(this, other.x, other.y)
  }
  clone() {
    return new Point(this.x, this.y)
  }
  add(other: PointParams, receiver = new Point()) {
    return add(this, ensureIPoint(other), receiver)
  }
  subtract(other: PointParams, receiver = new Point()) {
    return subtract(this, ensureIPoint(other), receiver)
  }
  equals(other: Point) {
    return equals(this, other)
  }
  equivalent(other: PointParams) {
    return equals(this, ensureIPoint(other))
  }

  get magnitude() { return magnitude(this) }
  get sqMagnitude() { return sqMagnitude(this) }
}

const dummy = new Point()