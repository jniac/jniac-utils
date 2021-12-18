import { Observable } from '../observables'

export class Solver<V, P = null> extends Observable<V> {

  #children = new Set<{ child: Observable<V>, props: Partial<P> }>()
  #update: () => void

  constructor(initialValue: V, solver: (values: { value:V, props: Partial<P> }[]) => V) {
    super(initialValue)
    this.#update = () => {
      const values = [...this.#children].map(({ child, props }) => ({ value: child.value, props }))
      const value = values.length > 0 ? solver(values) : initialValue
      super.setValue(value)
    }
  }

  createChild(initialValue: V, childProps?: P) {
    const child = new Observable(initialValue)
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

  setValue() {
    console.warn('Solver cannot be set directly. Use "getChild" to change the inner value.')
    return false
  }
}
