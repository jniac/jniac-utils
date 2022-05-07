import { Observable } from './Observable'

const section = (name: string, length = 20, char = '-') => {
  const x = length - (name.length + 2)
  const y = Math.floor(x / 2)
  const z = x - y
  return char.repeat(y) + ` ${name} ` + char.repeat(z)
}

const tests = [
  () => {
    type Person = { name: string }
    const foo: Person = { name: 'foo' }
    const bar: Person = { name: 'bar' }
    const observable = new Observable<Person | null>(null)
    console.log(section('init:'))
    observable.onChange(value => console.log(`person:`, value))
    observable.onChange(value => console.log(`(once) person:`, value), { once: true })
    observable.onChange(value => console.log(`(execute) person:`, value), { execute: true })
    observable.onChange(value => console.log(`(once, execute) person:`, value), { once: true, execute: true })
    observable.withNonNullableValue(value => console.log(`(non-nullable) person:`, value))
    observable.withNonNullableValue(value => console.log(`(non-nullable, once) person:`, value), { once: true })
    console.log(section('foo:'))
    observable.setValue(foo)
    console.log(section('bar:'))
    observable.setValue(bar)
    console.log(section('null:'))
    observable.setValue(null)
  },
]

export const runObservableTests = () => tests.forEach(test => test())
