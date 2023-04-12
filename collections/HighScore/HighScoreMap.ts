import { HighScoreList } from './HighScoreList'

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

  constructor(size: number) {
    this.#props = {
      list: new HighScoreList(size),
      map: new Map(),
    }
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
