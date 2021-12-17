
type RectangleSetParams = {
  xMin?: number
  yMin?: number
  xMax?: number
  yMax?: number
  x?: number
  y?: number
  width?: number
  height?: number
}

export class Rectangle {
  static intersection(a: Rectangle, b: Rectangle, receiver: Rectangle = new Rectangle(), {
    degenerate = true,
  } = {}) {
    const xMin = Math.max(a.xMin, b.xMin)
    const yMin = Math.max(a.yMin, b.yMin)
    const xMax = Math.min(a.xMax, b.xMax)
    const yMax = Math.min(a.yMax, b.yMax)
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
  static union(a: Rectangle, b: Rectangle, receiver: Rectangle = new Rectangle()) {
    const xMin = Math.min(a.xMin, b.xMin)
    const yMin = Math.min(a.yMin, b.yMin)
    const xMax = Math.max(a.xMax, b.xMax)
    const yMax = Math.max(a.yMax, b.yMax)
    receiver.x = xMin
    receiver.width = xMax - xMin
    receiver.y = yMin
    receiver.height = yMax - yMin
    return receiver
  }
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  get xMin() { return this.x }
  get yMin() { return this.y }
  get xMax() { return this.x + this.width }
  get yMax() { return this.y + this.height }
  equals(other: Rectangle) {
    return this.isDegenerate() ? other.isDegenerate() : (
      this.x === other.x &&
      this.y === other.y &&
      this.width === other.width &&
      this.height === other.height)
  }
  copy(other: Rectangle) {
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
  set(arg: RectangleSetParams): Rectangle
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
  area() {
    return this.width * this.height || 0
  }
  get centerX() { return this.x + this.width / 2 }
  get centerY() { return this.y + this.height / 2 }
  center(receiver = { x: 0, y: 0 }) {
    receiver.x = this.centerX
    receiver.y = this.centerY
    return receiver
  }
  relativePoint(tx: number, ty: number, receiver = { x: 0, y: 0 }) {
    receiver.x = this.x + this.width * tx
    receiver.y = this.y + this.height * ty
    return receiver
  }
  contains(other: Rectangle) {
    return (
      other.xMin >= this.xMin && 
      other.xMax <= this.xMax && 
      other.yMin >= this.yMin && 
      other.yMax <= this.yMax)
  }
  containsPoint({ x, y }: { x: number, y: number }) {
    return (
      x >= this.xMin && 
      x <= this.xMax && 
      y >= this.yMin && 
      y <= this.yMax)
  }
  toString() {
    return `Bounds{ x: ${this.x}, y: ${this.y}, width: ${this.width}, height:${this.height} }`
  }
}
