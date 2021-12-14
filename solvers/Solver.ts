import { Observable } from '../observables'

export class Solver<U, V = null> extends Observable<U> {

  #children = new Set<{ child: Observable<U>, props: Partial<V> }>()
  #update: () => void

  constructor(initialValue: U, solver: (values: { value:U, props: Partial<V> }[]) => U) {
    super(initialValue)
    this.#update = () => {
      const values = [...this.#children].map(({ child, props }) => ({ value: child.value, props }))
      const value = values.length > 0 ? solver(values) : initialValue
      super.setValue(value)
    }
  }

  createChild(initialValue: U, childProps?: V) {
    const child = new Observable(initialValue)
    child.onChange(this.#update)
    const bundle = { child, props: childProps ?? {} }
    this.#children.add(bundle)
    this.#update()
    const destroy = () => {
      this.#children.delete(bundle)
      child.clear()
      this.#update()
    }
    return { child, destroy }
  }

  createImmutableChild(value: U, childProps?: V) {
    const { destroy } = this.createChild(value, childProps)
    return { destroy }
  }

  override setValue() {
    console.warn('Solver cannot be set directly. Use "getChild" to change the inner value.')
    return false
  }
}
