
/**
 * An internal node that should not be exposed.
 */
class Node {
  static #count = 0
  readonly id = Node.#count++
  score: number
  next: Node | null = null;
  constructor(score: number) {
    this.score = score
  }
}

/**
 * `HighScoreList` has a very narrow purpose: handle a limited list of scores.
 * 
 * `HighScoreList` is a data structure that is used to keep track of a list of high 
 * scores in a game or any other scenario where scores need to be ranked and 
 * tracked. It is essentially a linked list that maintains a maximum size and 
 * allows for the insertion of new scores while ensuring that the list is always 
 * sorted in ascending order.
 * 
 * `HighScoreList` is performant because the internal linked list is always 
 * sorted, this allows that the values that are too low are quickly discarded.
 * 
 * HighScoreList gives the best results when it comes to extracting the highest 
 * scores from a large list of scores (eg: top 10 of 10K entries).
 * 
 * Since here only the score is stored, for any advanced use it may be better to 
 * use `HighScoreMap`.
 * 
 * Usage: 
 * ```
 * const list = new HighScoreList(4)
 * 
 * list.put(400)
 * list.put(100)
 * list.put(300)
 * list.put(300)
 * console.log('scores:', ...list) // scores: 100 300 300 400
 * 
 * list.put(101)
 * list.put(102)
 * console.log('scores:', ...list) // scores: 102 200 300 400
 * 
 * list.clear()
 * console.log('scores:', ...list) // scores: 
 * ```
 */
class HighScoreList {
  readonly #props: {
    size: number
    freeSize: number
    free: Node | null
    head: Node | null
  }

  /**
   * The maximum number of score in the list.
   */
  get size() {
    return this.#props.size
  }

  /**
   * The actual remaining number of free nodes (less or equal to `size`).
   */
  get freeSize() {
    return this.#props.freeSize
  }

  /**
   * The "current" number of score in the list (less or equal to `size`).
   */
  get currentSize() {
    const { size, freeSize } = this.#props
    return size - freeSize
  }

  constructor(size: number) {
    if (size < 1) {
      throw new Error(`Invalid Size!`)
    }

    const free = new Node(-1)
    this.#props = {
      size,
      freeSize: size,
      free,
      head: null
    }

    let previous = free
    for (let i = 1; i < size; i++) {
      const node = new Node(-1)
      previous.next = node
      previous = node
    }
  }

  copy(other: HighScoreList): this {
    // NOTE: copy is not so trivial, since here we have to wait (potentially) for
    // the beginning of pertinent nodes (delta), and proceed to the "cut" of the 
    // free link.
    this.clear()
    const props = this.#props
    let otherNode = other.#props.head
    if (otherNode === null) {
      // The other list is empty, skip.
      return this
    }
    const { size, free } = props
    const otherCurrentSize = other.currentSize
    let delta = Math.max(0, otherCurrentSize - size)
    let node = free!
    props.freeSize = size - (otherCurrentSize - delta)
    while (delta-- > 0) {
      otherNode = otherNode.next!
    }
    while (otherNode!.next) {
      node.score = otherNode.score
      node = node.next!
      otherNode = otherNode.next
    }
    node.score = otherNode.score
    
    // Cut the "free" link
    props.head = free
    props.free = node.next
    node.next = null

    return this
  }

  clone(): HighScoreList {
    return new HighScoreList(this.size).copy(this)
  }

  /**
   * Drops one node from the chain and returns it a tuple id.
   */
  drop(): [nodeId: number, score: number] {
    const props = this.#props
    const {
      size,
      freeSize,
      free,
      head,
    } = props
    if (size < 2) {
      throw new Error('Not enough space in to drop one item.')
    }
    props.size = size - 1
    if (free) {
      props.free = free.next
      props.freeSize = freeSize - 1
      return [free.id, free.score]
    }
    if (head) {
      props.head = head.next
      return [head.id, head.score]
    }
    throw new Error('Your computer is broken.')
  }

  extend(): void {
    const props = this.#props
    const {
      size,
      freeSize,
      free,
    } = props
    const newNode = new Node(-1)
    props.size = size + 1
    props.freeSize = freeSize + 1
    if (free === null) {
      props.free = newNode
      return
    }
    let node = free
    while (node.next) {
      node = node.next
    }
    node.next = newNode
  }

  /**
   * Resizes the list of nodes and returns dropped node ids.
   */
  resize(newSize: number): number[] {
    if (newSize < 1) {
      throw new Error('Invalid Size!')
    }
    const droppedNodeIds: number[] = []
    while (this.size > newSize) {
      const [nodeId] = this.drop()
      droppedNodeIds.push(nodeId)
    }
    while (this.size < newSize) {
      this.extend()
    }
    return droppedNodeIds
  }

  #freeNode(): Node | null {
    const props = this.#props
    const { free: node } = props
    if (node) {
      props.free = node.next
      props.freeSize--
      node.next = null
    }
    return node
  }

  #freeHead(): Node | null {
    const props = this.#props
    const { head: node } = props
    if (node) {
      props.head = node.next
      node.next = null
    }
    return node
  }

  #getLastFreeNode(): Node | null {
    let node = this.#props.free
    while (node?.next) {
      node = node.next
    }
    return node
  }

  clear(): this {
    const props = this.#props
    const { head } = props
    if (head) {
      const lastFreeNode = this.#getLastFreeNode()
      if (lastFreeNode === null) {
        props.free = head
      } else {
        lastFreeNode.next = head
      }
      props.head = null
      props.freeSize = props.size
    }
    return this
  }

  /**
   * Add a "score" to the internal linked list. Returns the id of the internal 
   * node if the "score" was really stored, otherwise it returns -1.
   * 
   * NOTE: The returned id is the only option to associate the score to any kind 
   * of data. It is used by `HighScoreMap` to keep track of data pushed with 
   * the score.
   */
  put(score: number): number {
    const props = this.#props
    const { head } = props
    const free = this.#freeNode()

    if (head === null) {
      free!.score = score
      props.head = free!
      return free!.id
    }

    if (free === null && score < head.score) {
      // The list is full, and the new score is lower than the lowest value, skip.
      return -1
    }

    const newNode = free ?? this.#freeHead()!
    newNode.score = score

    let node = props.head
    if (node === null) {
      props.head = newNode
      return newNode.id
    }
    
    if (score <= node.score) {
      props.head = newNode
      newNode.next = node
      return newNode.id
    }   

    while (node.next && score > node.next.score) {
      node = node.next
    }
    newNode.next = node.next
    node.next = newNode
    return newNode.id
  }

  *[Symbol.iterator](): Generator<number> {
    let node = this.#props.head
    while (node) {
      yield node.score
      node = node.next
    }
  }
  
  *nodeIds(): Generator<number> {
    let node = this.#props.head
    while (node) {
      yield node.id
      node = node.next
    }
  }
  
  *entries(): Generator<[nodeId: number, score: number]> {
    let node = this.#props.head
    while (node) {
      yield [node.id, node.score]
      node = node.next
    }
  } 

  toArray(): number[] {
    return [...this]
  }

  toString(): string {
    const { size, freeSize } = this.#props
    return `HighScoreList(${size}:${size-freeSize}:${freeSize})`
  }

  toDebugString(): string {
    const { head, free } = this.#props
    const headInfo = [], freeInfo = [] 
    let node = head
    while (node) {
      headInfo.push(`#${node.id}(${node.score})`)
      node = node.next
    }
    node = free
    while (node) {
      freeInfo.push(`#${node.id}(${node.score})`)
      node = node.next
    }
    return `${this.toString()} { ${headInfo.join(', ')} ::: ${freeInfo.join(', ')} }`
  }
}

export { HighScoreList }
