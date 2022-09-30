
/**
 * A set, divided into sets that are ordered by an index.
 * 
 * Usage: 
 * ```
 * const callbacks = new OrderSet<() => void>()
 * 
 * callbacks.add(0, () => console.log('zero'))
 * callbacks.add(10, () => console.log('ten'))
 * callbacks.add(-10, () => console.log('minus ten'))
 * callbacks.add(0, () => console.log('zero (dup)'))
 * 
 * for (const cb of callbacks.values()) {
 *   cb()
 * }
 * // "minus ten"
 * // "zero"
 * // "zero (dup)"
 * // "ten"
 * ```
 */
export class OrderSet<T> {

  #size = 0
  #orders: number[] = []
  #map = new Map<number, Set<T>>()
  
  add(order: number, value: T) {
    const createSet = () => {
      const set = new Set<T>()
      this.#map.set(order, set)
      this.#orders.push(order)
      this.#orders.sort((a, b) => a - b)
      this.#size++
      return set
    }
    const set = this.#map.get(order) ?? createSet()
    set.add(value)
  }

  delete(order: number, value: T) {
    const deleteSet = () => {
      this.#map.delete(order)
      this.#orders.splice(this.#orders.indexOf(order), 1)
      this.#size--
    }
    const set = this.#map.get(order)
    if (set) {
      const deleted = set.delete(value)
      if (set.size === 0) {
        deleteSet()
      }
      return deleted
    }
    return false
  }

  clear() {
    this.#map.clear()
    this.#size = 0
  }

  *values({ reverseOrder = false } = {}) {
    const orders = this.#orders
    for (let index = 0, max = orders.length; index < max; index++) {
      const order = orders[reverseOrder ? max - 1 - index : index]
      for (const value of this.#map.get(order)!) {
        yield value
      }
    }
  }
  
  get size() { return this.#size }
}
