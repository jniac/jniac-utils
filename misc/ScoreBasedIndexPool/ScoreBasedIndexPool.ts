import { HighScoreMap } from 'some-utils/collections'

class ScoreBasedIndexPool {
  #props: {
    poolSize: number
    watchSize: number
    computeScore: (index: number) => number
    onActivate?: (index: number) => void
    onDeactivate?: (index: number) => void
    onBeforeUpdate?: () => void
    onAfterUpdate?: () => void
    useIndexes1: boolean
    indexes1: HighScoreMap<number>
    indexes2: HighScoreMap<number>
  }

  get poolSize() {
    return this.#props.poolSize
  }

  set poolSize(value: number) {
    this.resizePool(value)
  }

  get watchSize() {
    return this.#props.watchSize
  }

  constructor(
    poolSize: number,
    watchSize: number,
    props: {
      computeScore: (index: number) => number
      onActivate?: (index: number) => void
      onDeactivate?: (index: number) => void
      onBeforeUpdate?: () => void
      onAfterUpdate?: () => void
    },
  ) {
    this.#props = {
      poolSize,
      watchSize,
      useIndexes1: true,
      indexes1: new HighScoreMap(poolSize),
      indexes2: new HighScoreMap(poolSize),
      ...props,
    }
  }

  #getBothIndexes(): [indexes: HighScoreMap<number>, oldIndexes: HighScoreMap<number>] {
    const {
      useIndexes1,
      indexes1,
      indexes2,
    } = this.#props
    return useIndexes1 ? [indexes1, indexes2] : [indexes2, indexes1]
  }
  
  #flipIndexes() {
    this.#props.useIndexes1 = !this.#props.useIndexes1
  }

  resizePool(newSize: number) {
    const [indexes] = this.#getBothIndexes()
    indexes.resize(newSize)
  }

  update() {
    const {
      watchSize,
      computeScore,
      onActivate,
      onDeactivate,
      onBeforeUpdate,
      onAfterUpdate,
    } = this.#props

    const [indexes, oldIndexes] = this.#getBothIndexes()
    this.#flipIndexes()

    indexes.clear()

    // Callback:
    onBeforeUpdate?.()

    for (let index = 0; index < watchSize; index++) {
      const score = computeScore(index)
      if (score > 0) {
        indexes.put(score, index)
      }
    }

    const deactivate = new Set(oldIndexes.values())
    const activate = new Set(indexes.values())

    for (const index of deactivate) {
      if (activate.has(index)) {
        deactivate.delete(index)
        activate.delete(index)
      }
    }

    // Callbacks:
    if (onDeactivate) {
      for (const index of deactivate) {
        onDeactivate(index)
      }
    }
    if (onActivate) {
      for (const index of activate) {
        onActivate(index)
      }
    }

    // Callback:
    onAfterUpdate?.()
  }
}

export { ScoreBasedIndexPool }
