import { ScoreBasedIndexPool } from './ScoreBasedIndexPool'
import { createTest, areEquivalent } from '../../test'

const {
  test,
  getCurrentTestName,
  testDone,
} = createTest('ScoreBasedIndexPool')

export const testScoreBasedIndexPool = () => {
  // Test state:
  const positions = [
    1000, 1001, 1002,
    2000, 2001, 2002,
    3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008,
  ].map(value => ({ value }))
  const state = {
    head: 0,
    distanceMax: 3,
  }
  const activatedPositions = new Set<{ value: number }>()
  
  const activatedPositionsAreEquivalentTo = (positions: number[]) => {
    return areEquivalent(
      [...activatedPositions].map(v => v.value).sort(),
      positions)
  }
  const activatedPositionToString = () => [...activatedPositions].map(i => i.value).join(', ')

  const pool = new ScoreBasedIndexPool(5, positions.length, {
    computeScore: index => {
      const position = positions[index]
      const distance = Math.abs(state.head - position.value)
      let score = -1
      if (distance <= state.distanceMax) {
        score = 1 / distance
      }
      return score
    },
    onActivate: index => {
      const position = positions[index]
      if (activatedPositions.has(position)) {
        throw new Error(
          `onActivate: Oh no!`
          + `\n> "${getCurrentTestName()}"`
          + `\n> position "${position.value}" is already in (${activatedPositionToString()})`)
      }
      activatedPositions.add(position)
    },
    onDeactivate: index => {
      const position = positions[index]
      if (activatedPositions.has(position) === false) {
        throw new Error(
          `onDeactivate: Oh no!`
          + `\n> "${getCurrentTestName()}"`
          + `\n> position "${position.value}" is not in (${activatedPositionToString()})`)
      }
      activatedPositions.delete(position)
    },
  })

  const info = () => `(${state.head}:${state.distanceMax}:${pool.poolSize})`

  pool.update()

  test(`${info()} Empty pool.`,
    activatedPositionsAreEquivalentTo([]))

  state.head = 1000
  pool.update()

  test(`${info()} Activation!`,
    activatedPositionsAreEquivalentTo([
      1000, 1001, 1002,
    ]))

  state.head = 2000
  pool.update()

  test(`${info()} Deactivation + activation (the pool watch size is not reached).`,
    activatedPositionsAreEquivalentTo([
      2000, 2001, 2002,
    ]))

  state.head = 3000
  pool.update()

  test(`${info()} Deactivation + activation, more entries (4)`,
    activatedPositionsAreEquivalentTo([
      3000, 3001, 3002, 3003,
    ]))

  state.head = 3002
  pool.update()

  test(`${info()} Clamp to "watchSize" (5)`,
    activatedPositionsAreEquivalentTo([
      3000, 3001, 3002, 3003, 3004,
    ]))

  state.head = 3006
  pool.update()

  test(`${info()} Activation + deactivation + clamp (make sure the range is centered around 3006)`,
    activatedPositionsAreEquivalentTo([
      3004, 3005, 3006, 3007, 3008,
    ]))

  state.head = 4000
  pool.update()

  test(`${info()}: Everything can be clean in one move`,
    activatedPositionsAreEquivalentTo([
    ]))

  positions[0].value = 4000
  pool.update()

  test(`${info()}: If the original state change, the "index" set follows`,
    activatedPositionsAreEquivalentTo([
      4000,
    ]))

  positions[1].value = 4001
  pool.update()

  test(`${info()}: ...follows again`,
    activatedPositionsAreEquivalentTo([
      4000, 4001,
    ]))

  positions[0].value = 0
  positions[2].value = 4002
  pool.update()

  test(`${info()}: ...and again`,
    activatedPositionsAreEquivalentTo([
      4001, 4002,
    ]))

  state.head = 3006
  state.distanceMax = 20
  pool.update()

  test(`${info()} Rollback to 3006 to prepare the next test.`,
    activatedPositionsAreEquivalentTo([
      3004, 3005, 3006, 3007, 3008,
    ]))

  pool.poolSize = 20
  pool.update()

  test(`${info()} Pool size has changed (increase)!`,
    activatedPositionsAreEquivalentTo([
      3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008,
    ]))

  pool.poolSize = 1
  pool.update()

  test(`${info()} Pool size has changed (decrease)!`,
    activatedPositionsAreEquivalentTo([
      3006,
    ]))

  state.head = 0
  pool.poolSize = 4
  positions.forEach((position, index) => position.value = index)
  pool.update()

  test(`${info()} Complex edge case (head & positions has changed)`,
    activatedPositionsAreEquivalentTo([
      0, 1, 2, 3,
    ]))

  testDone()
}