
export interface IInterval {
  min: number
  max: number
}

export type IntervalParams = 
  | Partial<IInterval>
  | { center: number, length: number }
  | [number, number]

export type IntervalDegenerateMode = 'collapse' | 'swap'

const ensure = (x: IntervalParams) => x instanceof Interval ? x : new Interval().set(x)

type SafeSetOptions = { mode?: IntervalDegenerateMode }
const safeSet = (interval: Interval, min: number, max: number, options?: SafeSetOptions) => {
  if (min <= max) {
    interval.min = min
    interval.max = max
  }
  else {
    const { mode = 'collapse' } = options ?? {}
    if (mode === 'swap') {
      interval.min = max
      interval.max = min  
    }
    else {
      interval.min =
      interval.max = (min + max) / 2
    }
  }
  return interval
}

const equals = (a: Interval, b: Interval) => (
  a.min === b.min &&
  a.max === b.max
)

const union = (a: Interval, b: Interval, receiver: Interval) => {
  receiver.min = Math.min(a.min, b.min)
  receiver.max = Math.max(a.max, b.max)
  return receiver
}

const intersection = (a: Interval, b: Interval, receiver: Interval, options?: SafeSetOptions) => {
  const min = Math.max(a.min, b.min)
  const max = Math.min(a.max, b.max)
  return safeSet(receiver, min, max, options)
}

const signedDistanceToValue = (interval: Interval, x: number) => {
  return (
    x < interval.min ? x - interval.min :
    x > interval.max ? x - interval.max : 0
  )
}

const signedDistance = (a: Interval, b: Interval) => {
  return (
    a.max < b.min ? b.min - a.max :
    a.min > b.max ? b.max - a.min : 0
  )
}

const signedGreatestDistance = (a: Interval, b: Interval) => {
  const min = -signedDistanceToValue(b, a.min)
  const max = -signedDistanceToValue(b, a.max)
  return min > -max ? min : max
}

const coverLength = (a: Interval, b: Interval) => {
  const min = Math.max(a.min, b.min)
  const max = Math.min(a.max, b.max)
  return min >= max ? 0 : max - min
}

export class Interval {

  // Static
  static ensure(params: IntervalParams) {
    return ensure(params)
  }

  // Instance
  min: number = 0
  max: number = 1
  get length() { return this.max - this.min }
  get center() { return (this.max + this.min) / 2 }
  constructor()
  constructor(min: number, max: number, options?: SafeSetOptions)
  constructor(params: IntervalParams)
  constructor(...args: any[]) {
    if (args.length > 0) {
      // @ts-ignore
      this.set(...args)
    }
  }
  set(min: number, max: number, options?: SafeSetOptions): Interval
  set(params: IntervalParams): Interval
  set(...args: any[]) {
    if (args.length >= 2) {
      return safeSet(this, args[0], args[1], args[2])
    }
    const [arg] = args
    if (Array.isArray(arg)) {
      return safeSet(this, arg[0], arg[1])
    }
    if (typeof arg === 'object') {
      if ('center' in arg) {
        const { center, length } = arg
        return safeSet(this, center - length / 2, center + length / 2)
      }
      const {
        min = 0,
        max = 1,
      } = arg
      return safeSet(this, min, max)
    }
    throw new Error(`invalid args: ${args}`)
  }
  equals(other: Interval) {
    return equals(this, other)
  }
  equivalent(other: IntervalParams) {
    return equals(this, ensure(other))
  }
  isDegenerate() {
    return this.min > this.max
  }
  contains(other: IntervalParams) {
    const { min, max } = ensure(other)
    return this.min <= min && this.max >= max
  }
  containsValue(value: number) {
    return this.min <= value && value <= this.max
  }
  union(other: IntervalParams, receiver = new Interval()) { 
    return union(this, ensure(other), receiver)
  }
  intersection(other: IntervalParams, receiver = new Interval()) {
    return intersection(this, ensure(other), receiver)
  }
  signedDistanceToValue(value: number) {
    return signedDistanceToValue(this, value)
  }
  signedDistance(other: IntervalParams) {
    return signedDistance(this, ensure(other))
  }
  signedGreatestDistance(other: IntervalParams) {
    return signedGreatestDistance(this, ensure(other))
  }
  coverLength(other: IntervalParams) {
    return coverLength(this, ensure(other))
  }
  coverRatio(other: IntervalParams) {
    return coverLength(this, ensure(other)) / this.length
  }
}