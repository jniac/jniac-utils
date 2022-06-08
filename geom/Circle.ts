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

const circleCircleIntersects = (circle1: ICircle, circle2: ICircle) => {
  const dx = circle2.x - circle1.x
  const dy = circle2.y - circle1.y
  const { r: r1 } = circle1
  const { r: r2 } = circle2
  const rr = circle1.r + circle2.r
  const sqDistance = dx * dx + dy * dy
  if (sqDistance > rr * rr) {
    return false
  }
  const distance = Math.sqrt(sqDistance)
  if (distance + r2 < r1) {
    return false
  }
  if (distance + r1 < r2) {
    return false
  }
  return true
}

const circleCircleStatus = (circle1: ICircle, circle2: ICircle) => {
  const dx = circle2.x - circle1.x
  const dy = circle2.y - circle1.y
  const { r: r1 } = circle1
  const { r: r2 } = circle2
  const rr = circle1.r + circle2.r
  const sqDistance = dx * dx + dy * dy
  if (sqDistance > rr * rr) {
    return 'APART'
  }
  const distance = Math.sqrt(sqDistance)
  if (distance + r2 < r1) {
    return 'CIRCLE1_CONTAINS_CIRCLE2'
  }
  if (distance + r1 < r2) {
    return 'CIRCLE2_CONTAINS_CIRCLE1'
  }
  return 'TOUCHING'
}


/**
 * Returns the intersection of a circle with the Unit Circle:
 * https://www.desmos.com/calculator/wnnlatidcn
 * @param radius 
 * @param distance 
 * @returns 
 */
const unitCircleCircleIntersection = (radius: number, distance: number) => {

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
const circleCircleIntersection = (circle1: ICircle, circle2: ICircle) => {

  const { x: x1, y: y1, r: r1 } = circle1
  const { x: x2, y: y2, r: r2 } = circle2
  
  const x12 = x2 - x1
  const y12 = y2 - y1
  const r12 = r1 + r2
  const sqDistance = x12 * x12 + y12 * y12
  const distance = Math.sqrt(sqDistance)
  
  if (distance > r12) {
    return []
  }

  if (distance + r1 < r2) {
    return []
  }

  if (distance + r2 < r1) {
    return []
  }

  if (distance === r12) {
    return [
      new Point(
        (circle1.x + circle2.x) / 2,
        (circle1.y + circle2.y) / 2,
      )
    ]
  }

  // cf unitCircleCircleIntersection()
  const local_d =  distance / r1
  const local_r = r2 / r1
  const u = (local_d * local_d - local_r * local_r + 1) / (2 * local_d)
  const v = Math.sqrt(1 - u * u)

  const dx = x12 / distance * r1
  const dy = y12 / distance * r1
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
  static unitCircleCircleIntersection = unitCircleCircleIntersection
  
  static circleCircleIntersects = (circle1: CircleParams, circle2: CircleParams) => 
    circleCircleIntersects(ensureICircle(circle1), ensureICircle(circle2))
  static circleCircleStatus = (circle1: CircleParams, circle2: CircleParams) =>
    circleCircleStatus(ensureICircle(circle1), ensureICircle(circle2))
  static circleCircleIntersection = (circle1: CircleParams, circle2: CircleParams) =>
    circleCircleIntersection(ensureICircle(circle1), ensureICircle(circle2))

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

  circleIntersects(circle: CircleParams) {
    return circleCircleIntersects(this, ensureICircle(circle))
  }

  circleIntersection(circle: CircleParams) {
    return circleCircleIntersection(this, ensureICircle(circle))
  }
}

