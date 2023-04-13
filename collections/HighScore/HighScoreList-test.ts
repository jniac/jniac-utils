import { HighScoreList } from './HighScoreList'
import { areEquivalent, createTest } from '../../test'

const {
  test,
  testDone,
} = createTest('HighScoreList')

export const testHighScoreList = () => {
  const list = new HighScoreList(4)
  list.put(101)
  list.put(100)
  list.put(103)
  list.put(102)
  
  test(`Basic: Ascending order.`,
    areEquivalent(list, [100, 101, 102, 103]))

  list.put(400)

  test(`Basic: Insert new value at the end.`,
    areEquivalent(list, [101, 102, 103, 400]))

  list.put(200)

  test(`Basic: Insert new value at intermediate position.`,
    areEquivalent(list, [102, 103, 200, 400]))

  {
    const [n1, n2, n3, n4] = [...list.nodeIds()]

    list.put(-100)

    test(`Basic: Too small value leaves the list untouched`,
      areEquivalent(list.nodeIds(), [n1, n2, n3, n4]))

    list.put(1000)

    test(`Basic: Inserted value changes the node's id order.`,
      areEquivalent(list.nodeIds(), [n2, n3, n4, n1]),
      areEquivalent(list, [103, 200, 400, 1000]))
  }

  {
    const anotherList = new HighScoreList(10)
    anotherList.put(1)
    anotherList.put(2)
    anotherList.put(3)
    anotherList.put(4)
    anotherList.clear()

    test(`Basic: Clear() will free all nodes.`, 
      areEquivalent(anotherList, []),
      areEquivalent(anotherList.freeSize, 10))
  }

  test(`Advanced: Copy() works with same length list.`,
    areEquivalent(list, new HighScoreList(list.size).copy(list)))

  test(`Advanced: Clone() works.`,
    areEquivalent(list, list.clone()))

  test(`Advanced: A smaller list copy only the top values.`,
    areEquivalent(new HighScoreList(3).copy(list), [200, 400, 1000]),
    areEquivalent(new HighScoreList(2).copy(list), [400, 1000]),
    areEquivalent(new HighScoreList(1).copy(list), [1000]))

  test(`Advanced: A bigger list copy all the values.`,
    areEquivalent(new HighScoreList(5).copy(list), [103, 200, 400, 1000]),
    areEquivalent(new HighScoreList(6).copy(list), [103, 200, 400, 1000]),
    areEquivalent(new HighScoreList(100).copy(list), [103, 200, 400, 1000]))

  test(`Advanced: ...and has the size values are right.`,
    areEquivalent(new HighScoreList(5).copy(list).freeSize, 1),
    areEquivalent(new HighScoreList(6).copy(list).freeSize, 2),
    areEquivalent(new HighScoreList(100).copy(list).freeSize, 96))

  {
    const clone = list.clone()
    const nodeIds = [...clone.nodeIds()]
    const [nodeId] = clone.drop()

    test(`Advanced: Drop() reduces the size by one, the dropped node id is correct.`,
      areEquivalent(clone.size, list.size - 1),
      areEquivalent(nodeId, nodeIds[0]))
  }

  {
    const clone = list.clone()
    clone.extend()

    test(`Advanced: Extend() extends the size by one, there is now one free node.`,
      areEquivalent(clone.size, list.size + 1),
      areEquivalent(clone.freeSize, 1))

    clone.put(-5)

    test(`Advanced: ...that is available to store another score.`,
      areEquivalent(clone, [-5, 103, 200, 400, 1000]))

    clone.put(300)

    test(`Advanced: ...and everything is still working well.`,
      areEquivalent(clone, [103, 200, 300, 400, 1000]))
  }

  {
    const clone = list.clone()
    clone.resize(2)

    test(`Advanced: Resize() performs the right way (decreasing the size).`,
      areEquivalent(clone, [400, 1000]),
      areEquivalent(clone.size, 2),
      areEquivalent(clone.freeSize, 0))

    clone.resize(4)

    test(`Advanced: Resize() performs the right way (increasing the size).`,
      areEquivalent(clone, [400, 1000]),
      areEquivalent(clone.size, 4),
      areEquivalent(clone.freeSize, 2))

    clone.put(500)

    test(`Advanced: ...and everything is still working well.`,
      areEquivalent(clone, [400, 500, 1000]),
      areEquivalent(clone.size, 4),
      areEquivalent(clone.freeSize, 1))
  }

  testDone()
}
