
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

const set = <T extends ICircle>(circle: T, x: number, y: number, r: number) => {
  circle.x = x
  circle.y = y
  circle.r = r
  return circle
}

  
export class Circle {

  static ensure(x: CircleParams) {
    return ensure(x)
  }

  static isCircleParams(x: any) {
    return isCircleParams(x)
  }

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
}
