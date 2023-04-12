import { ScoreBasedIndexPool } from './ScoreBasedIndexPool'

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
  const activatedPosition = new Set<{ value: number }>()
  const getActivatedPositionString = () => [...activatedPosition].map(i => i.value).join(', ')

  // Test object:
  const test = {
    state: {
      debug: false,
      currentTestName: '',
    },
    debug: (value: boolean = true) => {
      test.state.debug = value
      return test
    },
    name: (name: string) => {
      test.state.currentTestName = name
      return test
    },
    compare: (array: number[]) => {
      const set = new Set(array)
      for (const position of activatedPosition) {
        if (set.has(position.value) === false) {
          throw new Error(
            `Oops.`
            + `\n> "${test.state.currentTestName}"`
            + `\n> (${getActivatedPositionString()})`
            + `\nThe given array (${array.join(', ')}) does not contains ${position.value}.`)
        }
        set.delete(position.value)
      }
      if (set.size > 0) {
        throw new Error(
          `Oops.`
          + `\n> "${test.state.currentTestName}"`
          + `\n> (${getActivatedPositionString()})`
          + `\nThe given array contains extra entries (${[...set].join(', ')})`)
      }
      test.state.currentTestName += ` DONE`
      return test
    },
  }

  const pool = new ScoreBasedIndexPool(5, positions.length, {
    computeScore: index => {
      const position = positions[index]
      const distance = Math.abs(state.head - position.value)
      let score = -1
      if (distance <= state.distanceMax) {
        score = 1 / distance
      }
      if (test.state.debug) {
        console.log(`#${index}(${position.value}) distance: ${distance} score: ${score.toFixed(3)}`)
      }
      return score
    },
    onActivate: index => {
      const position = positions[index]
      activatedPosition.add(position)
    },
    onDeactivate: index => {
      const position = positions[index]
      if (test.state.debug) {
        debugger
      }
      activatedPosition.delete(position)
    },
  })

  try {
    pool.update()
    test
      .name('#0 Empty pool.')
      .compare([])

    // #1. Test activation / deactivation

    state.head = 1000
    pool.update()
    test
      .name('#1 activation')
      .compare([
        1000, 1001, 1002,
      ])

    state.head = 2000
    pool.update()
    test
      .name('#2 deactivation + activation (the pool watch size is not reached).')
      .compare([
        2000, 2001, 2002,
      ])

    state.head = 3000
    pool.update()
    test
      .name('#3 deactivation + activation, more entries (4)')
      .compare([
        3000, 3001, 3002, 3003,
      ])

    state.head = 3002
    pool.update()
    test
      .name('#4: clamp to "watchSize" (5)')
      .compare([
        3000, 3001, 3002, 3003, 3004,
      ])

    state.head = 3006
    pool.update()
    test
      .name('#5: activation + deactivation + clamp (make sure the range is centered around 3006)')
      .compare([
        3004, 3005, 3006, 3007, 3008,
      ])

    state.head = 4000
    pool.update()
    test
      .name('#6: everything can be clean in one move')
      .compare([
      ])

    // #3. Test with position intermediate update:

    positions[0].value = 4000
    pool.update()
    test
      .name('#7: if the original state change, the "index" set follows')
      .compare([
        4000,
      ])

    positions[1].value = 4001
    pool.update()
    test
      .name('#8: follows again')
      .compare([
        4000, 4001,
      ])

    positions[0].value = 0
    positions[2].value = 4002
    pool.update()
    test
      .name('#9: ...and again')
      .compare([
        4001, 4002,
      ])

    state.head = 3006
    state.distanceMax = 20
    pool.update()
    test
      .name('#10: rollback to 3006 to prepare #11')
      .compare([
        3004, 3005, 3006, 3007, 3008,
      ])

    pool.poolSize = 20
    pool.update()
    test
      .name('#11: poolSize has changed (increase)!')
      .compare([
        3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008,
      ])

    pool.poolSize = 1
    pool.update()
    test
      .name('#11: poolSize has changed (decrease)!')
      .compare([
        3006,
      ])

    console.log(`Test "testScoreBasedIndexPool" passed.`)
  } catch (error) {
    console.log(activatedPosition)
    console.error(`Test "testScoreBasedIndexPool" failed.`)
    console.error(error)
  }
}