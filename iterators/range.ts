
type RangeOptions = Partial<{
  reverse: boolean
  step: number
}>

export function range(max: number, options?: RangeOptions): Generator<number>
export function range(min: number, max: number, options?: RangeOptions): Generator<number>
export function* range(...args: any[]) {
  const optionsIndex = args.findIndex(v => typeof v === 'object')
  const { 
    reverse = false, 
    step = 1,
  } = optionsIndex !== -1 ? args.splice(optionsIndex, 1)[0] : {}
  let min = 0, max = 0
  if (args.length === 1) {
    max = args[0]
  } 
  else if (args.length === 2) {
    min = args[0]
    max = args[1]
  } 
  else {
    throw new Error(`Invalid usage (Typescript is missing).`)
  }
  if (reverse === false) {
    for (let i = min; i < max; i += step) {
      yield i
    }
  } else {
    for (let i = max - ((max - min) % step); i >= min; i -= step) {
      yield i
    }
  }
}

type MakeArrayOptions<T> = RangeOptions & {
  defaultValue: T,
}
/**
 * Make an array, and fill it with integers, ranging by default from 0 to the 
 * length of the array. 
 */
export function makeArray<T = number>(max: number, options?: MakeArrayOptions<T>): T[]
export function makeArray<T = number>(min: number, max: number, options?: MakeArrayOptions<T>): T[]
export function makeArray(...args: any[]) {
  const { defaultValue } = typeof args[1] === 'object' ? args[1] : (args[2] ?? {})
  // @ts-ignore
  const array = [...range(...args)]
  if (defaultValue !== undefined) {
    array.fill(defaultValue)
  }
  return array
}

export {
  // Backward compatibility:
  makeArray as aRange,
}
