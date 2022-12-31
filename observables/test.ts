import { Observable } from './Observable'
import { ObservableNumber } from './ObservableNumber'

const assert = {
  equivalent: <T extends Record<any, any>>(A: T, B: T) => {
    const aKeys = Object.keys(A) as any[]
    const bKeys = Object.keys(B) as any[]
    if (aKeys.length !== bKeys.length || aKeys.some(k => bKeys.includes(k) === false)) {
      throw new Error(`A & B does not have the same keys: \n(${aKeys.join(', ')}) <-> (${bKeys.join(', ')})`)
    }
    for (const k of aKeys) {
      if (A[k] !== B[k]) {
        throw new Error(`A & B have different values for "${k}":\nA.${k}: ${A[k]}\nB.${k}: ${B[k]}`)
      }
    }
  }
}

let logger: (...args: any[]) => void = () => {}

const logTitle = (str: string) => logger(`\n\n${str}\n\n`)

const logSection = (name: string, length = 20, char = '-') => {
  const x = length - (name.length + 2)
  const y = Math.floor(x / 2)
  const z = x - y
  logger(char.repeat(y) + ` ${name} ` + char.repeat(z))
}

const logLine = (indent: number, ...args: any[]) => {
  logger(`    `.repeat(indent), ...args)
}

const tests = [

  () => {
    logTitle('onChange { once, execute }')
    type Person = { name: string }
    const foo: Person = { name: 'foo' }
    const bar: Person = { name: 'bar' }
    const observable = new Observable<Person | null>(null)
    logSection('init:')
    observable.onChange(value => logLine(1, `person:`, value))
    observable.onChange(value => logLine(1, `(once) person:`, value), { once: true })
    observable.onChange(value => logLine(1, `(execute) person:`, value), { execute: true })
    observable.onChange(value => logLine(1, `(once, execute) person:`, value), { once: true, execute: true })
    observable.withNonNullableValue(value => logLine(1, `(non-nullable) person:`, value))
    observable.withNonNullableValue(value => logLine(1, `(non-nullable, once) person:`, value), { once: true })
    logSection('foo:')
    observable.setValue(foo)
    logSection('bar:')
    observable.setValue(bar)
    logSection('null:')
    observable.setValue(null)
  },

  () => {
    logTitle('onVerify')

    const obs = new Observable('abc')
    const check = {
      enter: 0,
      leave: 0,
      inner: 0,
      outer: 0,
    }

    obs.onVerify({
      verify: v => v.includes('foo'),
      onEnter: v => {
        logLine(1, `FROM NOW, foo is here: "${v}"`)
        check.enter++
      },
      onLeave: v => {        
        logLine(1, `FROM NOW, foo is NOT here anymore: "${v}"`)
        check.leave++
      },
      onInnerChange: v => {        
        logLine(1, `foo is here: "${v}"`)
        check.inner++
      },
      onOuterChange: v => {        
        logLine(1, `foo is NOT here: "${v}"`)
        check.outer++
      },
    })

    obs.value += '-foo'
    obs.value += '-bar'
    obs.value = 'qux'
    obs.value += '-bar'
    obs.value += '-foo'

    assert.equivalent(check, {
      enter: 2,
      leave: 1,
      inner: 3,
      outer: 2,
    })
  },

  () => {
    logTitle('onInterval')
    const check = { enter: 0, leave: 0, inner: 0, outer: 0 }
    const obs = new ObservableNumber(0)
    obs.onInterval({
      interval: [3, 6],
      onEnter: () => check.enter++,
      onLeave: () => check.leave++,
      onInnerChange: value => {
        logLine(1, `inner value ${value}`)
        check.inner++
      },
      onOuterChange: value => {
        logLine(1, `outer value ${value}`)
        check.outer++
      },
    })
    for (let i = 0; i < 8; i++) {
      obs.value = i
    }
    assert.equivalent(check, { enter: 1, leave: 1, inner: 4, outer: 3 })
  },

]

export const runObservableTests = ({ 
  log = false,
}: { 
  log?: boolean
} = {}) => {

  logger = log ? console.log : () => {}

  try {
    for (const test of tests) {
      test()
    }

    console.log('TEST OK')
  }
  catch (e) {
    console.log('TEST FAILED')
    console.error(e)
  }
}
