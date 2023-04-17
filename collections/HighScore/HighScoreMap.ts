import { HighScoreList } from './HighScoreList'

type Order = 'ASCENDING' | 'DESCENDING'

const defaultOptions = {
  /** The order use internally to store the scores. Defaults to "ASCENDING" (the higher scores remain). */
  order: 'ASCENDING' as Order,
}

/**
 * `HighScoreMap` is based on `HighScoreList` but, because it uses a Map internally,
 * is also able to associate any kind of value with a score.
 * 
 * Usage: 
 * ```
 * const map = new HighScoreMap<string>(4)
 * 
 * map.put(11, 'onze')
 * map.put(2, 'duo')
 * map.put(2, 'deux')
 * map.put(2, 'zwei')
 * console.log(...map.values()) // zwei deux duo onze
 * 
 * map.put(100, 'cent')
 * map.put(92, 'quatre-vingt-douze')
 * console.log(...map.values()) // duo onze quatre-vingt-douze cent 
 * ```
 */
class HighScoreMap<T> {
  #props: {
    list: HighScoreList
    map: Map<number, T>
  }

  get size() {
    return this.#props.list.size
  }

  get freeSize() {
    return this.#props.list.freeSize
  }

  get currentSize() {
    return this.#props.list.currentSize
  }

  constructor(size: number, options: Partial<typeof defaultOptions> = {}) {
    this.#props = {
      list: new HighScoreList(size, options),
      map: new Map(),
    }
  }

  copy(other: HighScoreMap<T>): this {
    const { list, map } = this.#props
    const { list: otherList, map: otherMap } = other.#props
    list.copy(otherList)
    map.clear()
    const nodeIdIterator = list.nodeIds()
    const otherNodeIdIterator = otherList.nodeIds()
    while (true) {
      const { value: nodeId, done } = nodeIdIterator.next().value
      const { value: otherNodeId } = otherNodeIdIterator.next()
      if (done) {
        break
      }
      map.set(nodeId, otherMap.get(otherNodeId)!)
    }
    return this
  }

  clone(): HighScoreMap<T> {
    return new HighScoreMap<T>(this.size).copy(this)
  }

  drop(): [score: number, value: T] {
    const { list, map } = this.#props
    const [nodeId, score] = list.drop()
    const value = map.get(nodeId)!
    map.delete(nodeId)
    return [score, value]
  }

  extend(): void {
    const { list } = this.#props
    list.extend()
  }

  resize(newSize: number): this {
    const { list, map } = this.#props
    const nodeIds = list.resize(newSize)
    for (const nodeId of nodeIds) {
      map.delete(nodeId)
    }
    return this
  }

  put(score: number, value: T) {
    const { list, map } = this.#props
    const id = list.put(score)
    if (id !== -1) {
      map.set(id, value)
    }
    return id
  }

  clear() {
    const { list, map } = this.#props
    list.clear()
    map.clear()
  }

  *keys(): Generator<number> {
    yield* this.#props.list
  }

  *values(): Generator<T> {
    const { list, map } = this.#props
    for (const nodeId of list.nodeIds()) {
      yield map.get(nodeId)!
    }
  }

  *entries(): Generator<[score: number, value: T]> {
    const { list, map } = this.#props
    for (const [nodeId, score] of list.entries()) {
      yield [score, map.get(nodeId)!]
    }
  }
}

export { HighScoreMap }
