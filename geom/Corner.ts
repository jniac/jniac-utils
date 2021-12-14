
export type CornerParams = {
  all?: number
  top?: number
  bottom?: number
  right?: number
  left?: number
  topLeft?: number
  topRight?: number
  bottomRight?: number
  bottomLeft?: number
} 
  | [number, number, number, number]
  | [number, number]
  | [number]
  | number

export class Corner {
  static ensure(object: CornerParams) {
    return (object instanceof Corner ? object : new Corner(object))
  }

  topLeft = 0
  topRight = 0
  bottomRight = 0
  bottomLeft = 0

  constructor(params: CornerParams = {}) {
    this.set(params)
  }

  set(params: CornerParams = {}) {

    if (Array.isArray(params)) {
      if (params.length === 1) {
        const [all] = params
        this.topLeft = all
        this.topRight = all
        this.bottomRight = all
        this.bottomLeft = all
      } 
      else if (params.length === 2) {
        const [vertical, horizontal] = params
        this.topLeft = vertical
        this.topRight = horizontal
        this.bottomRight = vertical
        this.bottomLeft = horizontal
      }
      else if (params.length === 4) {
        const [topLeft, topRight, bottomRight, bottomLeft] = params
        this.topLeft = topLeft
        this.topRight = topRight
        this.bottomRight = bottomRight
        this.bottomLeft = bottomLeft
      }
    } 
    else if (typeof params === 'number') {
      this.topLeft = params
      this.topRight = params
      this.bottomRight = params
      this.bottomLeft = params
    } 
    else {
      const {
        all = 0,
        top,
        bottom,
        right,
        left,
        topRight = top ?? right ?? all,
        topLeft = top ?? left ?? all,
        bottomRight = bottom ?? right ?? all,
        bottomLeft = bottom ?? left ?? all,
      } = params
      this.topLeft = topLeft
      this.topRight = topRight
      this.bottomRight = bottomRight
      this.bottomLeft = bottomLeft
    }
  }

  isAll() {
    return (
      this.topLeft === this.topRight &&
      this.topLeft === this.bottomRight &&
      this.topLeft === this.bottomLeft
    )
  }

  get all() {
    return this.isAll() ? this.topLeft : NaN
  }

  toCSS({ scalar = 1 } = {}) {
    return `${this.topLeft * scalar}px ${this.topRight * scalar}px ${this.bottomRight * scalar}px ${this.bottomLeft * scalar}px`
  }
}
