import { PointParams } from '.'
import { IPoint, Point } from './Point'

export type IRectangle = {
  x: number
  y: number
  width: number
  height: number
}

export type RectangleParams = 
  | Partial<IRectangle> 
  | [number, number, number, number]
  | [number, number]
  | number[]
  | {
    xMin?: number
    yMin?: number
    xMax?: number
    yMax?: number
  }

enum DegenerateMode {
  Collapse,
  CollapseMin,
  CollapseMax,
  Swap,
  Degenerate,
  Ignore,
}

const equals = (a: IRectangle, b: IRectangle) => (
  a.x === b.x &&
  a.y === b.y &&
  a.width === b.width &&
  a.height === b.height
)

const setDegenerate = <T extends IRectangle>(rectangle: T) => {
  rectangle.x = 0
  rectangle.y = 0
  rectangle.width = NaN
  rectangle.height = NaN
  return rectangle
}

const isDegenerate = (rectangle: IRectangle) => (
  isNaN(rectangle.width) ||
  isNaN(rectangle.height)
)

const copy = <T extends IRectangle>(a: T, b: IRectangle) => {
  a.x = b.x
  a.y = b.y
  a.width = b.width
  a.height = b.height
  return a
}

const setDimensions = <T extends IRectangle>(rectangle: T, x: number, y: number, width: number, height: number, mode: DegenerateMode): T => {

  if (width < 0) {
    if (mode === DegenerateMode.Collapse) {
      x += width / 2
      width = 0 
    }
    else if (mode === DegenerateMode.CollapseMin) {
      x += width
      width = 0 
    }
    else if (mode === DegenerateMode.CollapseMax) {
      width = 0 
    }
    else if (mode === DegenerateMode.Swap) {
      x += width
      width = -width
    }
    else if (mode === DegenerateMode.Degenerate) {
      return setDegenerate(rectangle)
    }
  }

  if (height < 0) {
    if (mode === DegenerateMode.Collapse) {
      y += height / 2
      height = 0 
    }
    else if (mode === DegenerateMode.CollapseMin) {
      y += height
      height = 0 
    }
    else if (mode === DegenerateMode.CollapseMax) {
      height = 0 
    }
    else if (mode === DegenerateMode.Swap) {
      y += height
      height = -height
    }
    else if (mode === DegenerateMode.Degenerate) {
      return setDegenerate(rectangle)
    }
  }

  rectangle.x = x
  rectangle.y = y
  rectangle.width = width
  rectangle.height = height

  return rectangle
}

const set = (rectangle: IRectangle, params: RectangleParams, mode: DegenerateMode) => {
  
  if (Array.isArray(params)) {
    if (params.length === 4) {
      return setDimensions(rectangle, params[0], params[1], params[2], params[3], mode)
    }
    if (params.length === 2) {
      return setDimensions(rectangle, 0, 0, params[0], params[1], mode)
    }
    throw new Error(`invalid arguments count: (${(params as any[]).length}) ${(params as any[]).join(', ')}`)
  }

  if ('xMin' in params || 'yMin' in params || 'xMax' in params || 'yMax' in params) {
    const {
      xMin = 0,
      yMin = 0,
      xMax = 1,
      yMax = 1,
    } = params
    return setDimensions(rectangle, xMin, yMin, xMax - xMin, yMax - yMin, mode)
  }

  const {
    x = 0,
    y = 0,
    width = 1,
    height = 1,
  } = params as Partial<IRectangle>
  return setDimensions(rectangle, x, y, width, height, mode)
}

const ensure = (x: RectangleParams, mode = DegenerateMode.Collapse) => x instanceof Rectangle ? x : set(new Rectangle(), x, mode) as Rectangle

const union = (a: IRectangle, b: IRectangle, receiver: IRectangle) => {
  const xMin = Math.min(a.x, b.x)
  const yMin = Math.min(a.y, b.y)
  const xMax = Math.max(a.x + a.width, b.x + b.width)
  const yMax = Math.max(a.y + a.height, b.y + b.height)
  receiver.x = xMin
  receiver.width = xMax - xMin
  receiver.y = yMin
  receiver.height = yMax - yMin
  return receiver
}

enum IntersectionMode {
  Clamp,
  Ignore,
  Degenerate,
}
const intersection = <T extends IRectangle>(a: IRectangle, b: IRectangle, receiver: T, mode = IntersectionMode.Clamp) => {
  const axMin = a.x
  const axMax = a.x + a.width
  const bxMin = b.x
  const bxMax = b.x + b.width
  const ayMin = a.y
  const ayMax = a.y + a.height
  const byMin = b.y
  const byMax = b.y + b.height

  const xMin = Math.max(axMin, bxMin)
  const yMin = Math.max(ayMin, byMin)
  const xMax = Math.min(axMax, bxMax)
  const yMax = Math.min(ayMax, byMax)

  let x = xMin
  let y = yMin
  let width = xMax - xMin
  let height = yMax - yMin

  if (width < 0) {
    switch (mode) {
      case IntersectionMode.Clamp: {
        width = 0
        x = axMax < bxMin ? axMax : axMin
        break
      }
      case IntersectionMode.Degenerate: {
        width = NaN
        x = axMax < bxMin ? axMax : axMin
        break
      }
    }
  }

  if (height < 0) {
    switch (mode) {
      case IntersectionMode.Clamp: {
        height = 0
        y = ayMax < byMin ? ayMax : ayMin
        break
      }
      case IntersectionMode.Degenerate: {
        height = NaN
        y = ayMax < byMin ? ayMax : ayMin
        break
      }
    }
  }

  receiver.x = x
  receiver.y = y
  receiver.width = width
  receiver.height = height

  return receiver
}

const signedDistance = (a: IRectangle, b: IRectangle, receiver: IPoint) => {
  const axMin = a.x
  const axMax = a.x + a.width
  const bxMin = b.x
  const bxMax = b.x + b.width
  const ayMin = a.y
  const ayMax = a.y + a.height
  const byMin = b.y
  const byMax = b.y + b.height
  receiver.x = bxMin > axMax ? bxMin - axMax : bxMax < axMin ? bxMax - axMin : 0
  receiver.y = byMin > ayMax ? byMin - ayMax : byMax < ayMin ? byMax - ayMin : 0
  return receiver
}

const signedDistanceToValue = (min: number, max: number, x: number) => {
  return (
    x < min ? x - min :
    x > max ? x - max : 0
  )
}

const signedGreatestDistance = (a: IRectangle, b: IRectangle, receiver: IPoint) => {
  const axMin = a.x
  const axMax = a.x + a.width
  const bxMin = b.x
  const bxMax = b.x + b.width
  const ayMin = a.y
  const ayMax = a.y + a.height
  const byMin = b.y
  const byMax = b.y + b.height

  const xMin = -signedDistanceToValue(bxMin, bxMax, axMin)
  const xMax = -signedDistanceToValue(bxMin, bxMax, axMax)
  receiver.x = xMin > -xMax ? xMin : xMax

  const yMin = -signedDistanceToValue(byMin, byMax, ayMin)
  const yMax = -signedDistanceToValue(byMin, byMax, ayMax)
  receiver.y = yMin > -yMax ? yMin : yMax

  return receiver
}

const closestPoint = (r: IRectangle, p: IPoint, receiver: IPoint) => {
  const xMin = r.x
  const yMin = r.y
  const xMax = xMin + r.width
  const yMax = yMin + r.height
  const { x, y } = p
  receiver.x = x < xMin ? xMin : x > xMax ? xMax : x
  receiver.y = y < yMin ? yMin : y > yMax ? yMax : y
  return receiver
}

const contains = (a: IRectangle, b: IRectangle) => {
  const axMin = a.x
  const axMax = a.x + a.width
  const bxMin = b.x
  const bxMax = b.x + b.width
  const ayMin = a.y
  const ayMax = a.y + a.height
  const byMin = b.y
  const byMax = b.y + b.height
  return (
    bxMin >= axMin && 
    bxMax <= axMax && 
    byMin >= ayMin && 
    byMax <= ayMax
  )
}

const containsPoint = (r: IRectangle, p: IPoint) => {
  return  (
    p.x >= r.x && 
    p.x <= r.x + r.width && 
    p.y >= r.y && 
    p.y <= r.y + r.height)
}

const scale = (r: IRectangle, scaleX: number, scaleY: number) => {
  r.x *= scaleX
  r.y *= scaleY
  r.width *= scaleX
  r.height *= scaleY
  return r
}

const inflate = (r: IRectangle, left: number, right: number, top: number, bottom: number) => {
  r.x += -left
  r.y += -top
  r.width += right + left
  r.height += top + bottom
  return r
}

const transposePoint = <T extends IPoint>(point: IPoint, from: IRectangle, to: IRectangle, receiver: T) => {
  const x = (point.x - from.x) / from.width
  const y = (point.y - from.y) / from.height
  receiver.x = to.x + x * to.width
  receiver.y = to.y + y * to.height
  return receiver
}

export class Rectangle {
  
  static get DegenerateMode() { return DegenerateMode }
  static get IntersectionMode() { return IntersectionMode }
  static ensure(params: RectangleParams, mode = DegenerateMode.Collapse) { return ensure(params, mode) }
  static get intersection() { return intersection }
  static get union() { return union }
  static get signedDistance() { return signedDistance }
  
  static transposePoint(point: PointParams, from: RectangleParams, to: RectangleParams, receiver: IPoint = new Point()) {
    return transposePoint(Point.ensure(point), ensure(from), ensure(to), receiver)
  }

  x = 0
  y = 0
  width = 0
  height = 0

  constructor()
  constructor(x: number, y: number, width: number, height: number, mode?: DegenerateMode)
  constructor(width: number, height: number, mode?: DegenerateMode)
  constructor(params: RectangleParams, mode?: DegenerateMode)
  constructor(...args: any[]) {
    if (args.length > 0) {
      // @ts-ignore
      this.set.apply(this, args)
    }
  }

  set(x: number, y: number, width: number, height: number, mode?: DegenerateMode): Rectangle
  set(width: number, height: number, mode?: DegenerateMode): Rectangle
  set(params: RectangleParams, mode?: DegenerateMode): Rectangle
  set(...args: any[]) {

    if (args.length === 5) {
      return set(this, args.slice(0, 4) as [number, number, number, number], args[4])
    }
    if (args.length === 4) {
      return set(this, args as [number, number, number, number], DegenerateMode.Collapse)
    }
    if (args.length === 3) {
      return set(this, args.slice(0, 2) as [number, number], args[2])
    }
    if (args.length === 2 && typeof args[0] === 'number') {
      return set(this, args as [number, number], DegenerateMode.Collapse)
    }

    const [arg, mode = DegenerateMode.Collapse] = args

    return set(this, arg, mode)
  }

  get xMin() { return this.x }
  set xMin(value) { this.setXMin(value) }
  get yMin() { return this.y }
  set yMin(value) { this.setYMin(value) }
  get xMax() { return this.x + this.width }
  set xMax(value) { this.setXMax(value) }
  get yMax() { return this.y + this.height }
  set yMax(value) { this.setYMax(value) }
  get centerX() { return this.x + this.width / 2 }
  get centerY() { return this.y + this.height / 2 }
  get area() { return this.width * this.height }
  get aspect() { return this.width / this.height }

  equals(other: IRectangle): boolean {
    return equals(this, other)
  }

  setDegenerate(): this {
    return setDegenerate(this)
  }

  isDegenerate(): boolean {
    return isDegenerate(this)
  }

  copy(other: IRectangle): this {
    return copy(this, other)
  }

  clone(): Rectangle {
    return new Rectangle().copy(this)
  }

  setDimensions(x: number, y: number, width: number, height: number, {
    mode = DegenerateMode.Collapse,
  } = {} as { mode?: DegenerateMode }): this {
    return setDimensions(this, x, y, width, height, mode)
  }

  setXMin(value: number): this {
    const delta = value - this.x
    if (delta < this.width) {
      this.width += -delta
    }
    else {
      this.width = 0
    }
    this.x = value
    return this
  }

  setXMax(value: number): this {
    const delta = this.xMax - value
    if (delta < this.width) {
      this.width += -delta
    }
    else {
      this.x = value
      this.width = 0
    }
    return this
  }

  setYMin(value: number): this {
    const delta = value - this.y
    if (delta < this.height) {
      this.height += -delta
    }
    else {
      this.height = 0
    }
    this.y = value
    return this
  }

  setYMax(value: number): this {
    const delta = this.yMax - value
    if (delta < this.height) {
      this.height += -delta
    }
    else {
      this.y = value
      this.height = 0
    }
    return this
  }

  union<T extends IRectangle = Rectangle>(other: RectangleParams, { 
    receiver = new Rectangle(), 
  } = {} as { 
    receiver?: T
  }): T {
    return union(this, ensure(other), receiver) as T
  }

  intersection<T extends IRectangle = Rectangle>(other: RectangleParams, { 
    receiver = new Rectangle(), 
    mode = IntersectionMode.Clamp,
  } = {} as { 
    receiver?: T
    mode?: IntersectionMode
  }): T {
    return intersection(this, ensure(other), receiver, mode) as T
  }

  signedDistance<T extends IPoint = Point>(other: RectangleParams, {
    receiver = new Point(),
  } = {} as {
    receiver?: T
  }): T {
    return signedDistance(this, ensure(other), receiver) as T
  }

  signedGreatestDistance<T extends IPoint = Point>(other: RectangleParams, {
    receiver = new Point(),
  } = {} as {
    receiver?: T
  }): T {
    return signedGreatestDistance(this, ensure(other), receiver) as T
  }

  topLeft<T extends IPoint = Point>({ receiver = new Point() } = {} as { receiver?: T }): T {
    receiver.x = this.x
    receiver.y = this.y
    return receiver as T
  }

  topRight<T extends IPoint = Point>({ receiver = new Point() } = {} as { receiver?: T }): T {
    receiver.x = this.x + this.width
    receiver.y = this.y
    return receiver as T
  }

  bottomLeft<T extends IPoint = Point>({ receiver = new Point() } = {} as { receiver?: T }): T {
    receiver.x = this.x
    receiver.y = this.y + this.height
    return receiver as T
  }

  bottomRight<T extends IPoint = Point>({ receiver = new Point() } = {} as { receiver?: T }): T {
    receiver.x = this.x + this.width
    receiver.y = this.y + this.height
    return receiver as T
  }

  center<T extends IPoint = Point>({ receiver = new Point() } = {} as { receiver?: T }): T {
    receiver.x = this.centerX
    receiver.y = this.centerY
    return receiver as T
  }

  relativePoint<T extends IPoint = Point>({ x, y }: IPoint, { 
    receiver = new Point(),
  } = {} as { receiver?: T }): T {
    receiver.x = this.x + this.width * x
    receiver.y = this.y + this.height * y
    return receiver as T
  }

  closestPoint<T extends IPoint = Point>(point: IPoint, { 
    receiver = new Point(),
  } = {} as { receiver?: T }): T {
    return closestPoint(this, point, receiver) as T
  }
  
  contains(other: RectangleParams): boolean {
    return contains(this, ensure(other))
  }
  
  containsPoint(point: IPoint): boolean {
    return containsPoint(this, point)
  }

  /**
   * Scales everything by the given parameter which may be a scalar (number) or 
   * a vector ({ x, y }). 
   * 
   * eg: 
   * ```
   * const r = new Rectangle(1, 2, 3, 4)
   * r.scale(10) // Rectangle{ x: 10, y: 20, width: 30, height: 40 }
   * ```
   */
  scale(param: number | IPoint): this {
    if (typeof param === 'number') {
      return scale(this, param, param) as this
    } else {
      return scale(this, param.x, param.y) as this
    }
  }

  inflate(padding: number | { left: number, right: number, top: number, bottom: number }): this {
    if (typeof padding === 'number') {
      return inflate(this, padding, padding, padding, padding) as this
    }
    else {
      const { left, right, top, bottom } = padding
      return inflate(this, left, right, top, bottom) as this
    }
  }

  toString(): string {
    return `Rectangle{ x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height} }`
  }
}