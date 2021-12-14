
export type PaddingParams = {
  all?: number
  vertical?: number
  horizontal?: number
  top?: number
  bottom?: number
  right?: number
  left?: number
} 
  | [number, number, number, number]
  | [number, number, number]
  | [number, number]
  | [number]
  | number

export class Padding {
  static ensure(object: PaddingParams) {
    return (object instanceof Padding ? object : new Padding(object))
  }

  top = 0
  right = 0
  bottom = 0
  left = 0

  constructor(params: PaddingParams = {}) {
    this.set(params)
  }

  set(params: PaddingParams = {}) {

    if (Array.isArray(params)) {
      if (params.length === 1) {
        const [all] = params
        this.top = all
        this.right = all
        this.bottom = all
        this.left = all
      } else if (params.length === 2) {
        const [vertical, horizontal] = params
        this.top = vertical
        this.right = horizontal
        this.bottom = vertical
        this.left = horizontal
      } else if (params.length === 4) {
        const [top, right, bottom, left] = params
        this.top = top
        this.right = right
        this.bottom = bottom
        this.left = left
      }
    } else 
    if (typeof params === 'number') {
      this.top = params
      this.right = params
      this.bottom = params
      this.left = params
    } else 
    {
      const {
        all = 0,
        vertical = all,
        horizontal = all,
        top = vertical,
        bottom = vertical,
        left = horizontal,
        right = horizontal,
      } = params
      this.top = top
      this.right = right
      this.bottom = bottom
      this.left = left
    }
  }

  isAll() {
    return (
      this.top === this.right &&
      this.top === this.bottom &&
      this.top === this.left
    )
  }

  get horizontal() {
    return (this.left + this.right) / 2
  }

  get vertical() {
    return (this.top + this.bottom) / 2
  }

  get all() {
    return this.isAll() ? this.top : NaN
  }

  get totalHorizontal() {
    return this.left + this.right
  }

  get totalVertical() {
    return this.top + this.bottom
  }

  toCSS({ scalar = 1 } = {}) {
    return `${this.top * scalar}px ${this.right * scalar}px ${this.bottom * scalar}px ${this.left * scalar}px`
  }
}
