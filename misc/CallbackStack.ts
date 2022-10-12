export class CallbackStack<T = undefined> {
  #scope: T
  #callbacks = new Set<(scope: T) => void>();
  constructor()
  constructor(scope: T)
  constructor(scope?: T) {
    this.#scope = scope as unknown as T
  }
  add(callback: (scope: T) => void) {
    this.#callbacks.add(callback)
    const destroy = () => this.#callbacks.delete(callback)
    return { destroy }
  }
  addOnce(callback: (scope: T) => void) {
    const { destroy } = this.add(scope => {
      destroy()
      callback(scope)
    })
    return { destroy }
  }
  delete(callback: (scope: T) => void) {
    return this.#callbacks.delete(callback)
  }
  call() {
    const scope = this.#scope
    const copy = new Set(this.#callbacks)
    for (const callback of copy) {
      callback(scope)
    }
  }
}
