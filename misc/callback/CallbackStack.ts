
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
  dump() {
    const scope = this.#scope
    const copy = new Set(this.#callbacks)
    this.#callbacks.clear()
    for (const callback of copy) {
      callback(scope)
    }
  }

  /**
   * This will execute and remove from the stack as many callbacks that it is 
   * possible in the given max duration (ms).
   * 
   * NOTE: This concept may be better implemented with Array than Set.
   * @param maxDuration ms
   */
  dumpWhile(maxDuration: number) {
    const scope = this.#scope
    const copy = new Set(this.#callbacks)
    const start = Date.now()
    for (const callback of copy) {
      this.#callbacks.delete(callback)
      callback(scope)
      if (Date.now() - start > maxDuration) {
        break
      }
    }
  }
}
