import { HighScoreMap } from './HighScoreMap'
import { areEquivalent, createTest } from '../../test'

const {
  test,
  testDone,
} = createTest('HighScoreMap')

export const testHighScoreMap = () => {
  const map = new HighScoreMap(4)
  map.put(2, 'two')
  map.put(3, 'three')
  map.put(2, 'deux')
  map.put(2, 'zwei')

  test(`Basic: Sorted values.`,
    areEquivalent(map.keys(), [2, 2, 2, 3]),
    areEquivalent(map.values(), ['zwei', 'deux', 'two', 'three']))

  map.put(12, 'douze')

  test(`Basic: Insert an entry at the highest place.`,
    areEquivalent(map.keys(), [2, 2, 3, 12]),
    areEquivalent(map.values(), ['deux', 'two', 'three', 'douze']))

  map.put(4, 'quattro')

  test(`Basic: Insert an entry at an intermediate place.`,
    areEquivalent(map.keys(), [2, 3, 4, 12]),
    areEquivalent(map.values(), ['two', 'three', 'quattro', 'douze']))

  map.drop()

  test(`Advanced: Drop() reduce size by one.`,
    areEquivalent(map.keys(), [3, 4, 12]),
    areEquivalent(map.values(), ['three', 'quattro', 'douze']))

  map.extend()
  map.put(1, 'one')

  test(`Advanced: Extend() reduce size by one.`,
    areEquivalent(map.keys(), [1, 3, 4, 12]),
    areEquivalent(map.values(), ['one', 'three', 'quattro', 'douze']))

  map.resize(1)

  test(`Advanced: Resize() is correct (decreasing the size).`,
    areEquivalent(map.keys(), [12]),
    areEquivalent(map.values(), ['douze']))

  map.resize(5)

  test(`Advanced: Resize() is correct (increasing the size).`,
    areEquivalent([map.size, map.freeSize, map.currentSize], [5, 4, 1]),
    areEquivalent(map.keys(), [12]),
    areEquivalent(map.values(), ['douze']))

  map.put(70, 'septante')

  test(`Advanced: ...and everything is still working well.`,
    areEquivalent([map.size, map.freeSize, map.currentSize], [5, 3, 2]),
    areEquivalent(map.keys(), [12, 70]),
    areEquivalent(map.values(), ['douze', 'septante']))

  testDone()
}
