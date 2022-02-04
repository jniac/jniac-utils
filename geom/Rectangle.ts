import { IPoint, Point } from './Point'

export type IRectangle = {
  x: number
  y: number
  width: number
  height: number
}

type RectangleParams = 
  | Partial<IRectangle> 
  | [number, number, number, number]
  | [number, number]
  | {
    xMin?: number
    yMin?: number
    xMax?: number
    yMax?: number
  }

type RectangleDegenerateMode = 'collapse' | 'swap' | 'ignore'

const equals = (a: IRectangle, b: IRectangle) => (
  a.x === b.x &&
  a.y === b.y &&
  a.width === b.width &&
  a.height === b.height
)

const copy = (a: IRectangle, b: IRectangle) => {
  a.x = b.x
  a.y = b.y
  a.width = b.width
  a.height = b.height
  return a
}

const setDimensions = (rectangle: IRectangle, x: number, y: number, width: number, height: number, mode: RectangleDegenerateMode) => {
  if (width < 0) {
    if (mode === 'collapse') {
      x += width / 2
      width = 0 
    }
    else if (mode === 'swap') {
      x += width
      width = -width
    }
  }
  if (height < 0) {
    if (mode === 'collapse') {
      y += height / 2
      height = 0 
    }
    else if (mode === 'swap') {
      y += height
      height = -height
    }
  }
  rectangle.x = x
  rectangle.y = y
  rectangle.width = width
  rectangle.height = height
  return rectangle
}

const set = (rectangle: IRectangle, params: RectangleParams, mode: RectangleDegenerateMode) => {
  
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

const ensure = (x: RectangleParams, mode = 'collapse' as RectangleDegenerateMode) => x instanceof Rectangle ? x : set(new Rectangle(), x, mode)

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

const intersection = (a: IRectangle, b: IRectangle, receiver: IRectangle, mode: RectangleDegenerateMode) => {
  const xMin = Math.max(a.x, b.x)
  const yMin = Math.max(a.y, b.y)
  const xMax = Math.min(a.x + a.width, b.x + b.width)
  const yMax = Math.min(a.y + a.height, b.y + b.height)
  return setDimensions(receiver, xMin, yMin, xMax - xMin, yMax - yMin, mode)
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

const inflate = (r: IRectangle, left: number, right: number, top: number, bottom: number) => {
  r.x += -left
  r.y += -top
  r.width += right + left
  r.height += top + bottom
  return r
}

export class Rectangle {
  static ensure(params: RectangleParams, mode = 'collapse' as RectangleDegenerateMode) { return ensure(params, mode) }
  x = 0
  y = 0
  width = 1
  height = 1
  constructor()
  constructor(width: number, height: number, mode?: RectangleDegenerateMode)
  constructor(x: number, y: number, width: number, height: number, mode?: RectangleDegenerateMode)
  constructor(params: RectangleParams, mode?: RectangleDegenerateMode)
  constructor(...args: any[]) {
    if (args.length > 0) {
      // @ts-ignore
      this.set.apply(this, args)
    }
  }
  set(x: number, y: number, width: number, height: number, mode?: RectangleDegenerateMode): Rectangle
  set(width: number, height: number, mode?: RectangleDegenerateMode): Rectangle
  set(arg: RectangleParams, mode?: RectangleDegenerateMode): Rectangle
  set(...args: any[]) {

    if (args.length === 5) {
      return set(this, args.slice(0, 4) as [number, number, number, number], args[4])
    }
    if (args.length === 4) {
      return set(this, args as [number, number, number, number], 'collapse')
    }
    if (args.length === 3) {
      return set(this, args.slice(0, 2) as [number, number], args[2])
    }
    if (args.length === 2 && typeof args[0] === 'number') {
      return set(this, args as [number, number], 'collapse')
    }

    const [arg, mode = 'collapse'] = args

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

  equals(other: Rectangle) {
    return equals(this, other)
  }
  copy(other: IRectangle) {
    return copy(this, other)
  }
  clone() {
    return new Rectangle().copy(this)
  }
  setDimensions(x: number, y: number, width: number, height: number, {
    mode = 'collapse',
  } = {} as { mode?: RectangleDegenerateMode }) {
    return setDimensions(this, x, y, width, height, mode)
  }
  setXMin(value: number) {
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
  setXMax(value: number) {
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
  setYMin(value: number) {
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
  setYMax(value: number) {
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
    receiver = this, 
  } = {} as { 
    receiver?: T
  }) {
    return union(this, ensure(other), receiver) as T
  }

  intersection<T extends IRectangle = Rectangle>(other: RectangleParams, { 
    receiver = this, 
    mode = 'collapse',
  } = {} as { 
    receiver?: T
    mode?: RectangleDegenerateMode
  }) {
    return intersection(this, ensure(other), receiver, mode) as T
  }

  signedDistance<T extends IPoint = Point>(other: RectangleParams, {
    receiver = new Point(),
  } = {} as {
    receiver?: T,
  }) {
    return signedDistance(this, ensure(other), receiver) as T
  }

  area() {
    return this.width * this.height
  }

  topLeft<T extends IPoint = Point>({ receiver = new Point() } = {} as { receiver?: T }) {
    receiver.x = this.x
    receiver.y = this.y
    return receiver
  }
  topRight<T extends IPoint = Point>({ receiver = new Point() } = {} as { receiver?: T }) {
    receiver.x = this.x + this.width
    receiver.y = this.y
    return receiver
  }
  bottomLeft<T extends IPoint = Point>({ receiver = new Point() } = {} as { receiver?: T }) {
    receiver.x = this.x
    receiver.y = this.y + this.height
    return receiver
  }
  bottomRight<T extends IPoint = Point>({ receiver = new Point() } = {} as { receiver?: T }) {
    receiver.x = this.x + this.width
    receiver.y = this.y + this.height
    return receiver
  }
  center<T extends IPoint = Point>({ receiver = new Point() } = {} as { receiver?: T }) {
    receiver.x = this.centerX
    receiver.y = this.centerY
    return receiver
  }
  relativePoint<T extends IPoint = Point>({ x, y }: IPoint, { 
    receiver = new Point(),
  } = {} as { receiver?: T }) {
    receiver.x = this.x + this.width * x
    receiver.y = this.y + this.height * y
    return receiver
  }
  closestPoint<T extends IPoint = Point>(point: IPoint, { 
    receiver = new Point(),
  } = {} as { receiver?: T }) {
    return closestPoint(this, point, receiver)
  }
  contains(other: RectangleParams) {
    return contains(this, ensure(other))
  }
  containsPoint(point: IPoint) {
    return containsPoint(this, point)
  }
  inflate(padding: number | { left: number, right: number, top: number, bottom: number }) {
    if (typeof padding === 'number') {
      return inflate(this, padding, padding, padding, padding)
    }
    else {
      const { left, right, top, bottom } = padding
      return inflate(this, left, right, top, bottom)
    }
  }
  toString() {
    return `Bounds{ x: ${this.x}, y: ${this.y}, width: ${this.width}, height:${this.height} }`
  }
}