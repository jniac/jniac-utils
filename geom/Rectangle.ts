import { IPoint, Point } from './Point'

export type IRectangle = {
  x: number
  y: number
  width: number
  height: number
}

type RectangleParams = Partial<IRectangle> & {
  xMin?: number
  yMin?: number
  xMax?: number
  yMax?: number
}

export class Rectangle {
  static intersection(a: IRectangle, b: IRectangle): Rectangle
  static intersection(a: IRectangle, b: IRectangle, receiver: Rectangle, options?: { degenerate: boolean }): Rectangle
  static intersection(a: IRectangle, b: IRectangle, receiver: IRectangle, options?: { degenerate: boolean }): IRectangle
  static intersection(a: IRectangle, b: IRectangle, receiver: IRectangle = new Rectangle(), {
    degenerate = true,
  } = {}) {
    const xMin = Math.max(a.x, b.x)
    const yMin = Math.max(a.y, b.y)
    const xMax = Math.min(a.x + a.width, b.x + b.width)
    const yMax = Math.min(a.y + a.height, b.y + b.height)
    const width = xMax - xMin
    const height = yMax - yMin
    if (width < 0) {
      receiver.x = (xMin + xMax) / 2
      receiver.width = degenerate ? NaN : 0
    } else {
      receiver.x = xMin
      receiver.width = width
    }
    if (height < 0) {
      receiver.y = (yMin + yMax) / 2
      receiver.height = degenerate ? NaN : 0
    } else {
      receiver.y = yMin
      receiver.height = height
    }
    return receiver
  }
  static union(a: IRectangle, b: IRectangle): Rectangle
  static union(a: IRectangle, b: IRectangle, receiver: Rectangle): Rectangle
  static union(a: IRectangle, b: IRectangle, receiver: IRectangle): IRectangle
  static union(a: IRectangle, b: IRectangle, receiver: IRectangle = new Rectangle()) {
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
  static distance(a: IRectangle, b: IRectangle, receiver = { x: 0, y: 0}) {
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
  x: number
  y: number
  width: number
  height: number
  constructor(x = 0, y = 0, width = 1, height = 1) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height    
  }
  get xMin() { return this.x }
  set xMin(value) { this.setXMin(value) }
  get yMin() { return this.y }
  set yMin(value) { this.setYMin(value) }
  get xMax() { return this.x + this.width }
  set xMax(value) { this.setXMax(value) }
  get yMax() { return this.y + this.height }
  set yMax(value) { this.setYMax(value) }
  equals(other: IRectangle) {
    return this.isDegenerate() ? (isNaN(other.width) || isNaN(other.height)) : (
      this.x === other.x &&
      this.y === other.y &&
      this.width === other.width &&
      this.height === other.height)
  }
  copy(other: IRectangle) {
    this.x = other.x
    this.y = other.y
    this.width = other.width
    this.height = other.height
    return this
  }
  clone() {
    return new Rectangle().copy(this)
  }
  setDimensions(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    return this
  }
  set(x: number, y: number, width: number, height: number): Rectangle
  set(width: number, height: number): Rectangle
  set(arg: RectangleParams): Rectangle
  set(...args: any[]) {
    if (args.length === 2) {
      return this.setDimensions(0, 0, parseFloat(args[0]), parseFloat(args[1]))
    }
    if (args.length === 4) {
      return this.setDimensions(
        parseFloat(args[0]), 
        parseFloat(args[1]), 
        parseFloat(args[2]), 
        parseFloat(args[3]),
      )
    }
    if (args.length === 1 && (args[0] && typeof args[0] === 'object')) {
      const {
        xMin = 0,
        yMin = 0,
        xMax = 0,
        yMax = 0,
        x = xMin,
        y = xMax,
        width = xMax - xMin,
        height = yMax - yMin,    
      } = args[0]
      return this.setDimensions(x, y, width, height)
    }

    throw new Error(`invalid args: ${args}`)
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
  isDegenerate() {
    return Number.isNaN(this.width) || Number.isNaN(this.height)
  }
  setDegenerate() {
    return this.setDimensions(0, 0, NaN, NaN)
  }
  intersection(other: Rectangle, { clone = false } = {}) {
    return Rectangle.intersection(this, other, clone ? new Rectangle() : this)
  }
  union(other: Rectangle, { clone = false } = {}) {
    return Rectangle.union(this, other, clone ? new Rectangle() : this)
  }
  distance(other: Rectangle, receiver = new Point()) {
    return Rectangle.distance(this, other, receiver)
  }
  area() {
    return this.width * this.height || 0
  }
  get centerX() { return this.x + this.width / 2 }
  get centerY() { return this.y + this.height / 2 }
  topLeft(receiver = new Point()) {
    receiver.x = this.x
    receiver.y = this.y
    return receiver
  }
  topRight(receiver = new Point()) {
    receiver.x = this.x + this.width
    receiver.y = this.y
    return receiver
  }
  bottomLeft(receiver = new Point()) {
    receiver.x = this.x
    receiver.y = this.y + this.height
    return receiver
  }
  bottomRight(receiver = new Point()) {
    receiver.x = this.x + this.width
    receiver.y = this.y + this.height
    return receiver
  }
  center(receiver = new Point()) {
    receiver.x = this.centerX
    receiver.y = this.centerY
    return receiver
  }
  relativePoint({ x, y }: IPoint, receiver = new Point()) {
    receiver.x = this.x + this.width * x
    receiver.y = this.y + this.height * y
    return receiver
  }
  closestPoint({ x, y }: IPoint, receiver = new Point()) {
    const { xMin, xMax, yMin, yMax } = this
    receiver.x = x < xMin ? xMin : x > xMax ? xMax : x
    receiver.y = y < yMin ? yMin : y > yMax ? yMax : y
    return receiver
  }
  contains(other: Rectangle) {
    return (
      other.xMin >= this.xMin && 
      other.xMax <= this.xMax && 
      other.yMin >= this.yMin && 
      other.yMax <= this.yMax)
  }
  containsPoint({ x, y }: IPoint) {
    return (
      x >= this.xMin && 
      x <= this.xMax && 
      y >= this.yMin && 
      y <= this.yMax)
  }
  inflate(padding: number | { left: number, right: number, top: number, bottom: number }) {
    if (typeof padding === 'number') {
      this.x += -padding
      this.y += -padding
      this.width += 2 * padding
      this.height += 2 * padding
    }
    else {
      const { left, right, top, bottom } = padding
      this.x += -left
      this.y += -top
      this.width += right + left
      this.height += top + bottom
    }
    return this
  }
  toString() {
    return `Bounds{ x: ${this.x}, y: ${this.y}, width: ${this.width}, height:${this.height} }`
  }
}
