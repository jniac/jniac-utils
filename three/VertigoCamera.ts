// @ts-ignore
import { Euler, PerspectiveCamera, Vector3 } from 'three'

const EPSILON = 0.0001
const TO_RADIAN = Math.PI / 180
const TO_DEGREE = 180 / Math.PI

const ONE = new Vector3(1, 1, 1)
const vector3 = new Vector3()
const euler = new Euler()

export class VertigoCamera extends PerspectiveCamera {
  
  #perspective = -1
  get perspective() { return this.#perspective }
  set perspective(perspective) { this.setVertigo({ perspective }) }

  get isPerspective() { return this.#perspective > EPSILON }

  #height = -1
  get height() { return this.#height }
  set height(height) { this.setVertigo({ height }) }

  #distance = -1
  get distance() { return this.#distance }
  set distance(distance) { this.setVertigo({ distance }) }

  constructor({ height = 10, distance = 10, perspective = 1, aspect = 1 } = {}) {
    super()
    this.aspect = aspect
    this.matrixAutoUpdate = false
    this.setVertigo({ height, perspective, distance })
  }

  #translation = new Vector3()

  setVertigo({ 
    perspective = this.perspective, 
    height = this.#height,
    distance = this.#distance,
  }) {
    if (perspective < 0) {
      perspective = 0
    }

    const hasChanged = (
      this.#perspective !== perspective
      || this.#height !== height
      || this.#distance !== distance
    )
    
    if (hasChanged) {
      this.#perspective = perspective
      this.#height = height
      this.#distance = distance
      this.updateProjection()
    }
  }

  updateQuaternion() {
    euler.copy(this.rotation)
    euler.x *= TO_RADIAN
    euler.y *= TO_RADIAN
    euler.z *= TO_RADIAN
    this.quaternion.setFromEuler(euler)
  }

  updateProjection() {

    // https://github.com/mrdoob/three.js/blob/master/src/cameras

    this.updateQuaternion()

    const { perspective, height, distance } = this
    const isPerspective = perspective > EPSILON

    if (isPerspective) {
      // Projection:
      this.fov = Math.atan(perspective) * 2 * TO_DEGREE
      super.updateProjectionMatrix()
      
      // Position:
      const z = height / 2 / perspective
      this.far = z + 1000
      this.#translation
        .set(0, 0, z + distance)
        .applyQuaternion(this.quaternion)
    }

    else {
      // Projection:
      const width = height * this.aspect
      this.projectionMatrix.makeOrthographic(-width / 2, width / 2, height / 2, -height / 2, this.near, this.far)
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert() 

      // Position:
      this.#translation
        .set(0, 0, height)
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
