import { IPoint, Point, PointParams } from './Point'

export interface ICircle {
  x: number
  y: number
  r: number
}

export type CircleParams =
  | Partial<ICircle>
  | [number, number, number]
  | number

export const isCircleParams = (params: any) => {
  const type = typeof params
  if (type === 'number') {
    return true
  }
  if (type === 'object' && params !== null) {
    if (Array.isArray(params)) {
      return params.length === 3 && params.every(x => typeof x === 'number')
    }
    if ('x' in params && typeof params.x !== 'number') {
      return false
    }
    if ('y' in params && typeof params.x !== 'number') {
      return false
    }
    if ('r' in params && typeof params.x !== 'number') {
      return false
    }
    return true
  }
  return false
}

const ensure = (x: CircleParams) => x instanceof Circle ? x : new Circle(x)

const ensureICircle = (c: CircleParams) => (c && typeof c === 'object' && ('x' in c && 'y' in c && 'r' in c)) ? c as ICircle : new Circle(c)

const set = <T extends ICircle>(circle: T, x: number, y: number, r: number) => {
  circle.x = x
  circle.y = y
  circle.r = r
  return circle
}

const localPoint = (circle: ICircle, point: IPoint, receiver: IPoint): IPoint => {
  receiver.x = (point.x - circle.x) / circle.r
  receiver.y = (point.y - circle.y) / circle.r
  return receiver
}

const localCircle = (circle: ICircle, circle2: ICircle, receiver: ICircle): ICircle => {
  receiver.x = (circle2.x - circle.x) / circle.r
  receiver.y = (circle2.y - circle.y) / circle.r
  receiver.r = circle2.r / circle.r
  return receiver
}

const intersectsCircleCircle = (circle1: ICircle, circle2: ICircle) => {
  const dx = circle2.x - circle1.x
  const dy = circle2.y - circle1.y
  const r2 = circle1.r + circle2.r
  return r2 * r2 >= dx * dx + dy * dy 
}



/**
 * Returns the intersection of a circle with the Unit Circle:
 * https://www.desmos.com/calculator/wnnlatidcn
 * @param radius 
 * @param distance 
 * @returns 
 */
const intersectionUnitCircleCircle = (radius: number, distance: number) => {

  if (distance > radius + 1) {
    return null
  }

  // Remember: 
  // xx + yy = 1
  // y = sqrt(1 - xx)

  const u = (distance * distance - radius * radius + 1) / (2 * distance)
  const v = Math.sqrt(1 - u * u)

  return { u, v }
}



/**
 * Returns the intersections (array) of two circles.
 * Result may contain 0, 1 or 2 intersection points.
 * 
 * https://www.desmos.com/calculator/lqcxd2kcxj
 * @param circle1 
 * @param circle2 
 * @returns 
 */
const intersectionCircleCircle = (circle1: ICircle, circle2: ICircle) => {

  const v12 = Point.subtract(circle2, circle1)
  const distance = v12.magnitude
  const r2 = circle1.r + circle2.r
  
  if (distance > r2) {
    return []
  }

  if (distance === r2) {
    return [
      new Point(
        (circle1.x + circle2.x) / 2,
        (circle1.y + circle2.y) / 2,
      )
    ]
  }

  // cf intersectionUnitCircleCircle()
  const local_d =  distance / circle1.r
  const local_r = circle2.r / circle1.r
  const u = (local_d * local_d - local_r * local_r + 1) / (2 * local_d)
  const v = Math.sqrt(1 - u * u)

  const dx = v12.x / distance * circle1.r
  const dy = v12.y / distance * circle1.r
  const ix = circle1.x + dx * u
  const iy = circle1.y + dy * u
  const vx = -dy * v
  const vy = dx * v

  return [
    new Point(
      ix + vx,
      iy + vy,
    ),
    new Point(
      ix - vx,
      iy - vy,
    ),
  ]
}



export class Circle {

  static ensure = ensure
  static ensureICircle = ensureICircle
  static isCircleParams = isCircleParams
  static intersectionUnitCircleCircle = intersectionUnitCircleCircle
  
  static intersectsCircleCircle = (circle1: CircleParams, circle2: CircleParams) => 
    intersectsCircleCircle(ensureICircle(circle1), ensureICircle(circle2))
  static intersectionCircleCircle = (circle1: CircleParams, circle2: CircleParams) =>
    intersectionCircleCircle(ensureICircle(circle1), ensureICircle(circle2))

  x!: number
  y!: number
  r!: number

  constructor(x: number, y: number, r: number)
  constructor(params: CircleParams)
  constructor()
  constructor() {
    this.x = 0
    this.y = 0
    this.r = 1
    // @ts-ignore
    this.set.apply(this, arguments)
  }

  set(x: number, y: number, r: number): Circle
  set(params: CircleParams): Circle
  set(...args: any[]) {
    if (args.length === 3) {
      return set(this, args[0], args[1], args[2])
    }
    if (args.length === 1) {
      const params = args[0] as CircleParams
      if (typeof params === 'number') {
        return set(this, 0, 0, params)
      }
      if (Array.isArray(params)) {
        return set(this, params[0], params[1], params[2])
      }
      return set(this, params.x ?? 0, params.y ?? 0, params.r ?? 1)
    }
    return this
  }

  containsPoint(p: PointParams) {
    let { x, y } = Point.ensureIPoint(p)
    x -= this.x
    y -= this.y
    return (x * x) + (y * y) <= this.r * this.r
  }

  localPoint(p: PointParams) {
    return localPoint(this, Point.ensureIPoint(p), new Point()) as Point
  }

  localCircle(circle: CircleParams, receiver: Circle = new Circle()) {
    return localCircle(this, ensureICircle(circle), receiver) as Circle
  }

  intersectsCircle(circle: CircleParams) {
    return intersectsCircleCircle(this, ensureICircle(circle))
  }

  intersectionCircle(circle: CircleParams) {
    return intersectionCircleCircle(this, ensureICircle(circle))
  }
}

