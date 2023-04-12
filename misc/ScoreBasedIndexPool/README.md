# ScoreBasedIndexPool

The purpose of `ScoreBasedIndexPool` is to keep track of a fixed number of indexes that have the highest scores among a larger set of indexes.

It could be very useful for tracking a limited amount of items among a very large set of possibilities. By example, imagine a 3D navigation that will display a maximum of 10 points of interest among thousand other points. The pool can keep track of the 10 points of interest with the highest scores, which could be based on their distance from the camera, as well as other weights such as their importance or relevance. The ScoreBasedIndexPool can efficiently manage the limited set of points of interest and update their scores as needed, while ignoring the rest of the points that are not relevant for the display. This can improve the performance of the navigation system and make it more efficient.

Usage : 

```ts
import { ScoreBasedIndexPool } from 'whatever-the-path'

const camera: Camera = getCamera()

const points: { position: Vector3, weight: number }[] = 
  getPoints() // A large set of points

const MAXIMUM_POINTS_OF_INTEREST = 10
const MAXIMUM_DISTANCE = 25

const pool = new ScoreBasedIndexPool(MAXIMUM_POINTS_OF_INTEREST, points.length, {
  computeScore: index => {
    const point = points[index]
    const distance = computeDistance(camera.position, point.position)
    if (distance < MAXIMUM_DISTANCE) {
      return 1 / distance
    } else {
      return -1
    }
  },
  onActivate: index => {
    const point = points[index]
    activatePoint(point)
  },
  onDeactivate: index => {
    const point = points[index]
    deactivatePoint(point)
  },
})
```