import { Observable } from '../observables'

type SolverState = Record<string, Observable<any>> | Observable<any>[]

export const solve = <T, S extends SolverState>(
  observable: Observable<T>,
  state: S,
  solver: (state: S) => T | undefined,
) => {
  observable.own(observable)
  const initialValue = observable.value
  const update = () => observable.setValue(solver(state) ?? initialValue, {
    owner: observable,
  })
  for (const child of Object.values(state)) {
    child.onChange(update)
  }
  return update
}

export class Solver<T, S extends SolverState> extends Observable<T> {
  constructor(initialValue: T, state: S, solver: (state: S) => T | undefined) {
    super(initialValue)
    solve(this, state, solver)
  }
}

export class ArraySolver<T> extends Observable<T> {

  #children: Set<Observable<T>>
  #update: () => void

  constructor(
    initialValue: T, 
    solver: (children: Observable<T>[]) => T,
  ) {
    super(initialValue)
    this.own(this)
    this.#children = new Set()
    this.#update = () => {
      const values = [...this.#children]
      const value = values.length > 0 ? solver(values) : initialValue
      super.setValue(value, { owner: this })
    }
  }

  createChild(initialValue: T) {
    const child = new Observable(initialValue)
    child.onChange(this.#update)
    child.onDestroy(() => {
      this.#children.delete(child)
      this.#update()
    })
    this.#children.add(child)
    this.#update()
    return child
  }

  createImmutableChild(value: T) {
    const { destroy } = this.createChild(value)
    return { destroy }
  }
}

