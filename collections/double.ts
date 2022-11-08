import { Register } from '.'

export class DoubleMap<K1, K2, V> {
  #map = new Map<K1, Map<K2, V>>()
  set(key1: K1, key2: K2, value: V) {
    const create = () => {
      const map = new Map<K2, V>()
      this.#map.set(key1, map)
      return map
    }
    const map = this.#map.get(key1) ?? create()
    map.set(key2, value)
  }

  delete(key1: K1, key2: K2, value: V) {
    const map = this.#map.get(key1)
    if (map) {
      return map.delete(key2)
    }
    return false
  }

  get(key1: K1, key2: K2) {
    const map = this.#map.get(key1)
    if (map) {
      return map.get(key2)
    }
  }
}

export class DoubleRegister<K1, K2, V> {
  #map = new Map<K1, Register<K2, V>>()

  add(key1: K1, key2: K2, value: V) {
    const create = () => {
      const register = new Register<K2, V>()
      this.#map.set(key1, register)
      return register
    }
    const register = this.#map.get(key1) ?? create()
    register.add(key2, value)
  }

  /** @obsolete Alias for `delete(k1, k2, v)`. */
  remove(key1: K1, key2: K2, value: V) { return this.delete(key1, key2, value) }
  delete(key1: K1, key2: K2, value: V) {
    const register = this.#map.get(key1)
    if (register) {
      const size = register.remove(key2, value)
      if (size === 0) {
        this.#map.delete(key1)
      }
      return size
    }
    return -1
  }

  get(key1: K1, key2: K2) {
    const register = this.#map.get(key1)
    if (register) {
      return register.get(key2)
    }
  }
}
