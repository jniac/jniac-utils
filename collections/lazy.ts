export class LazyRecord<K, V> {
  #map = new Map<K, V>()
  #initializer: (key: K) => V
  constructor(initializer: (key: K) => V) {
    this.#initializer = initializer
  }
  get(key: K) {
    if (this.#map.has(key)) {
      return this.#map.get(key)!
    }
    const value = this.#initializer(key)
    this.#map.set(key, value)
    return value
  }
  clear() {
    this.#map.clear()
  }
}
