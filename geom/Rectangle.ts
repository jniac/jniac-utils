
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
  static intersection(a: Rectangle, b: Rectangle, receiver: Rectangle = new Rectangle()) {
    const xMin = Math.max(a.xMin, b.xMin)
    const yMin = Math.max(a.yMin, b.yMin)
    const xMax = Math.min(a.xMax, b.xMax)
    const yMax = Math.min(a.yMax, b.yMax)
    const width = xMax - xMin
    const height = yMax - yMin
    if (width < 0) {
      receiver.x = (xMin + xMax) / 2
      receiver.width = 0
    } else {
      receiver.x = xMin
      receiver.width = NaN
    }
    if (height < 0) {
      receiver.y = (yMin + yMax) / 2
      receiver.height = NaN
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
    return (
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
  set(width: number, height: number): Rectangle
  set(x: number, y: number, width: number, height: number): Rectangle
  set(arg: RectangleSetParams): Rectangle
  set(...args: any[]) {
    if (args.length === 2) {
      this.width = parseFloat(args[0])
      this.height = parseFloat(args[1])
    }
    else if (args.length === 4) {
      this.x = parseFloat(args[0])
      this.y = parseFloat(args[1])
      this.width = parseFloat(args[2])
      this.height = parseFloat(args[3])
    }
    else if (args.length === 1 && (args[0] && typeof args[0] === 'object')) {
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
      this.x = x
      this.y = y
      this.width = width
      this.height = height
    }
    else {
      throw new Error(`invalid args: ${args}`)
    }
    return this
  }
  intersection(other: Rectangle, { useSelf = false } = {}) {
    return Rectangle.intersection(this, other, useSelf ? this : new Rectangle())
  }
  union(other: Rectangle, { useSelf = false } = {}) {
    return Rectangle.union(this, other, useSelf ? this : new Rectangle())
  }
  area() {
    return this.width * this.height
  }
  center() {
    const x = this.x + this.width / 2
    const y = this.y + this.height / 2
    return { x, y }
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
  isDegenerate() {
    return Number.isNaN(this.width) || Number.isNaN(this.height)
  }
  toString() {
    return `Bounds{ x: ${this.x}, y: ${this.y}, width: ${this.width}, height:${this.height} }`
  }
}
