
export class Register<K, V> {

  #map = new Map<K, Set<V>>()

  get keyCount() { return this.#map.size }

  add(key: K, value: V) {
    const create = () => {
      const set = new Set<V>()
      this.#map.set(key, set)
      return set
    }
    const set = this.#map.get(key) ?? create()
    set.add(value)
  }

  remove(key: K, value: V) {
    const set = this.#map.get(key)
    if (set) {
      const ok = set.delete(value)
      if (ok && set.size === 0) {
        this.#map.delete(key)
        return 0
      }
      return set.size
    }
    return -1
  }

  removeAll(key: K) {
    return this.#map.delete(key)
  }

  get(key: K) {
    return this.#map.get(key)
  }

  keys() {
    return this.#map.keys()
  }

  *entries() {
    for (const [key, set] of this.#map.entries()) {
      for (const value of set) {
        yield [key, value]
      }
    }
  }

  *values() {
    for (const set of this.#map.values()) {
      yield* set
    }
  }

  *valuesOf(key: K) {
    const set = this.#map.get(key)
    if (set) {
      yield* set
    }
  }

  clear() {
    for (const set of this.#map.values()) {
      set.clear()
    }
    this.#map.clear()
    return this
  }
}