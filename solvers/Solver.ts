import { consumeValueSetter } from 'some-utils/pure-observables/base'
import { ValueSetter } from "some-utils/pure-observables/types"
import { Observable } from '../pure-observables'
import { MutObservable } from '../pure-observables'

export class Solver<V, P = null> extends Observable<V> {

  #children = new Set<{ child: MutObservable<V>, props: Partial<P> }>()
  #update: () => void

  constructor(initialValue: V, solver: (values: { value:V, props: Partial<P> }[]) => V) {
    super(initialValue)
    const valueSetter = consumeValueSetter() as ValueSetter<V>
    this.#update = () => {
      const values = [...this.#children].map(({ child, props }) => ({ value: child.value, props }))
      const value = values.length > 0 ? solver(values) : initialValue
      valueSetter(value)
    }
  }

  createChild(initialValue: V, childProps?: P) {
    const child = new MutObservable(initialValue)
    child.onChange(this.#update)
    const bundle = { child, props: childProps ?? {} }
    this.#children.add(bundle)
    this.#update()
    child.onDestroy(() => {
      this.#children.delete(bundle)
      this.#update()
    })
    return child
  }

  createImmutableChild(value: V, childProps?: P) {
    const { destroy } = this.createChild(value, childProps)
    return { destroy }
  }
}
