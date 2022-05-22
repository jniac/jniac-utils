// @ts-ignore
import { Euler, PerspectiveCamera, Vector3 } from 'three'

const EPSILON = 0.0001
const TO_RADIAN = Math.PI / 180
const TO_DEGREE = 180 / Math.PI

const ONE = new Vector3(1, 1, 1)
const vector3 = new Vector3()
const euler = new Euler()

export class VertigoCamera extends PerspectiveCamera {

  #perspective = NaN
  get perspective() { return this.#perspective }
  set perspective(perspective) { this.setVertigo({ perspective }) }

  get isPerspective() { return this.#perspective > EPSILON }

  #height = NaN
  get height() { return this.#height }
  set height(height) { this.setVertigo({ height }) }

  #range = NaN
  get range() { return this.#range }
  set range(range) { this.setVertigo({ range }) }

  #distance = NaN
  get distance() { return this.#distance }
  set distance(distance) { this.setVertigo({ distance }) }

  #translation = new Vector3()

  setRotation({
    useDegree,
    x = this.rotation.x * (useDegree ? TO_DEGREE : 1), 
    y = this.rotation.y * (useDegree ? TO_DEGREE : 1), 
    z = this.rotation.z * (useDegree ? TO_DEGREE : 1), 
  }: {
    useDegree: boolean
    x?: number
    y?: number
    z?: number
  }) {
    x *= useDegree ? TO_RADIAN : 1
    y *= useDegree ? TO_RADIAN : 1
    z *= useDegree ? TO_RADIAN : 1
    this.rotation.set(x, y, z)
    return this
  }

  constructor({ 
    height = 10,
    range = 300,
    distance = 0, 
    perspective = 1, 
    aspect = 1,
    rotationOrder = 'YXZ',
  } = {}) {
    super()
    this.aspect = aspect
    this.rotation.order = rotationOrder
    this.matrixAutoUpdate = false
    this.setVertigo({ height, perspective, range, distance })
  }

  #updateNearFar(z: number) {
    const { range } = this
    this.near = Math.max(.1, z - range)
    this.far = z + range
  }

  setVertigo({ 
    perspective = this.perspective, 
    height = this.#height,
    distance = this.#distance,
    range = this.#range,
  }) {
    if (perspective < 0) {
      perspective = 0
    }

    const hasChanged = (
      this.#perspective !== perspective
      || this.#height !== height
      || this.#range !== range
      || this.#distance !== distance
    )
    
    if (hasChanged) {
      this.#perspective = perspective
      this.#height = height
      this.#range = range
      this.#distance = distance
      this.updateProjection()
    }
  }

  updateQuaternion() {
    const { x, y, z, order } = this.rotation
    euler.set(x, y, z, order)
    this.quaternion.setFromEuler(euler, false) // false -> do not update rotation (euler) from quaternion
    return this
  }

  updateProjection() {

    // https://github.com/mrdoob/three.js/blob/master/src/cameras

    this.updateQuaternion()

    const { perspective, height, distance } = this
    const isPerspective = perspective > EPSILON

    if (isPerspective) {
      // Projection:
      const z = height / 2 / perspective
      this.fov = Math.atan(perspective) * 2 * TO_DEGREE
      this.#updateNearFar(z)
      super.updateProjectionMatrix()
      
      // Position:
      this.#translation
        .set(0, 0, z + distance)
        .applyQuaternion(this.quaternion)
    }

    else {
      // Projection:
      const z = height / 2 / EPSILON
      this.#updateNearFar(z)
      const width = height * this.aspect
      this.projectionMatrix.makeOrthographic(-width / 2, width / 2, height / 2, -height / 2, this.near, this.far)
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert() 

      // Position:
      this.#translation
        .set(0, 0, z)
        .applyQuaternion(this.quaternion)
    }

    this.updateMatrix()
  }

  updateMatrix() {
    vector3.addVectors(this.position, this.#translation)
    this.matrix.compose(vector3, this.quaternion, ONE)
    this.matrixWorld.copy(this.matrix)
    this.matrixWorldInverse.copy(this.matrix).invert()
  }

  updatePositionRotation() {
    this.updateQuaternion()
    this.updateMatrix()
  }
}
