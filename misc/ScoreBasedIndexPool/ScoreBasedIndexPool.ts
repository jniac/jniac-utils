class Item {
  index: number = -1
  score: number = -1
  isFree(): boolean {
    return this.index === -1
  }
  set(index: number, score: number): this {
    this.index = index
    this.score = score
    return this
  }
  free(): this {
    return this.set(-1, -1)
  }
}

/**
 * Used to sort an array of IndexPoolItem the ascending way.
 */
const itemComparer = (a: Item, b: Item): number => a.score - b.score

class ScoreBasedIndexPool {
  #props: {
    poolSize: number
    watchSize: number
    computeScore: (index: number) => number
    onActivate?: (index: number) => void
    onDeactivate?: (index: number) => void
    map: Map<number, Item>
    sortedItems: Item[]
  }

  get poolSize() {
    return this.#props.poolSize
  }

  set poolSize(value: number) {
    // NOTE: changing the pool size is not trivial, since we have potentially to
    // invoke callbacks.
    const {
      poolSize: currentPoolSize,
      sortedItems,
      map,
      onDeactivate,
    } = this.#props
    this.#props.poolSize = value
    // Add new "free" items:
    if (value > currentPoolSize) {
      while (sortedItems.length < value) {
        sortedItems.push(new Item())
      }
    }
    // Removes exceeding items, and call "onDeactivate" on valid indexes:
    else if (value < currentPoolSize) {
      sortedItems.sort(itemComparer)
      const delta = currentPoolSize - value
      const deactivateIndexes = new Set<number>()
      for (let i = 0; i < delta; i++) {
        const item = sortedItems.shift()!
        const { index } = item
        if (index !== -1) {
          map.delete(index)
          deactivateIndexes.add(index)
        }
      }
      if (onDeactivate) {
        for (const index of deactivateIndexes) {
          onDeactivate(index)
        }
      }
    }
  }

  constructor(
    poolSize: number,
    watchSize: number,
    props: {
      computeScore: (index: number) => number
      onActivate?: (index: number) => void
      onDeactivate?: (index: number) => void
    },
  ) {
    const sortedItems = new Array(poolSize).fill(null).map(() => new Item())
    this.#props = {
      poolSize,
      watchSize,
      sortedItems,
      map: new Map<number, Item>(),
      ...props,
    }
  }

  update() {
    const {
      poolSize,
      watchSize,
      computeScore,
      onActivate,
      onDeactivate,
      sortedItems,
      map,
    } = this.#props

    const activateIndexes = new Set<number>()
    const deactivateIndexes = new Set<number>()

    for (let index = 0; index < watchSize; index++) {
      const score = computeScore(index)
      const item = map.get(index)
      if (score > 0) {
        if (item) {
          // The index is already activated, update the score (if necessary):
          if (item.score !== score) {
            item.score = score
          }
        } else {
          if (map.size < poolSize) {
            // There is room for new items
            const item = sortedItems.find(item => item.isFree())!
            item.set(index, score)
            map.set(index, item)
            activateIndexes.add(index)
          } else {
            // The pool is full:
            // - Sort the array to find the lowest score item.
            // - Compare scores, if the current score is bigger do the update.
            sortedItems.sort(itemComparer)
            const item = sortedItems[0]
            if (score > item.score) {
              activateIndexes.delete(item.index) // Make sure to remove from here too! (since item may have been activated previously during the same "update" call!)
              deactivateIndexes.add(item.index)
              map.delete(item.index)
              item.set(index, score)
              map.set(index, item)
              activateIndexes.add(index)
            }
          }
        }
      }
      // If the score is zero, or negative:
      else {
        if (item) {
          deactivateIndexes.add(item.index)
          map.delete(item.index)
          item.free()
        }
      }
    }

    // Callbacks:
    if (onDeactivate) {
      for (const index of deactivateIndexes) {
        onDeactivate(index)
      }
    }
    if (onActivate) {
      for (const index of activateIndexes) {
        onActivate(index)
      }
    }
  }
}

export { ScoreBasedIndexPool }
