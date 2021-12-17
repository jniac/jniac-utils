
export class Register<K, V> {
  #map = new Map<K, Set<V>>()

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

  getValues(key: K) {
    return this.#map.get(key)
  }

  *entries(key: K) {
    const set = this.#map.get(key)
    if (set) {
      yield* set
    }
  }
}