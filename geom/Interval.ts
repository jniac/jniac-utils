
export type IntervalParams = 
  | { min?: number, max?: number }
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

export class Interval {

  // Static
  static ensure(params: IntervalParams) {
    return ensure(params)
  }

  // Instance
  min: number
  max: number
  constructor(min = 0, max = 1) {
    this.min = min
    this.max = max
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
      const {
        min = 0,
        max = 1,
      } = arg
      return safeSet(this, min, max)
    }
    throw new Error(`invalid args: ${args}`)
  }
  isDegenerate() {
    return this.min > this.max
  }
  contains(other: IntervalParams) {
    const { min, max } = ensure(other)
    return this.min <= min && this.max >= max
  }
  containsValue(value: number) {
    return this.min <= value && this.max >= value
  }
  union(other: IntervalParams, receiver = new Interval()) { 
    return union(this, ensure(other), receiver)
  }
  intersection(other: IntervalParams, receiver = new Interval()) {
    return intersection(this, ensure(other), receiver)
  }
  signedDistanceToValue(value: number) {
    const { min, max } = this
    return (
      value < min ? value - min :
      value > max ? value - max : 0
    )
  }
  equals(other: Interval) {
    return equals(this, other)
  }
  equivalent(other: IntervalParams) {
    return equals(this, ensure(other))
  }
}