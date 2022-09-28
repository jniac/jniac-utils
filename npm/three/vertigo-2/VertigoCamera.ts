import { Euler, Matrix4, PerspectiveCamera, Vector3 } from 'three'

const _vector = new Vector3()
const _matrix = new Matrix4()

type Options = {
  /** Distance "before" the focus point to be rendered. */
  rangeMin: number
  /** Distance "behind" the focus point to be rendered. */
  rangeMax: number
  /** "near" min value.  */
  nearMin: number
  /** "far" min value.  */
  farMax: number
  /** Threshold below which the camera is considered as being orthographic. Approximately 1° */
  fovEpsilon: number
}

const defaultOptions: Options = {
  rangeMin: -100,
  rangeMax: 1000,
  nearMin: .01,
  farMax: 1e5,
  fovEpsilon: .02,
}

export const computeDistance = (fov: number, fovEpsilon: number, height: number, rangeMin: number) => {
  return fov > fovEpsilon
    ? height / 2 / Math.tan(fov / 2)
    : -rangeMin
}

export const computeVertigoCamera = (
  camera: PerspectiveCamera,
  focusPosition: Vector3,
  height: number,
  aspect: number,
  {
    rangeMin = defaultOptions.rangeMin,
    rangeMax = defaultOptions.rangeMax,
    nearMin = defaultOptions.nearMin,
    farMax = defaultOptions.farMax,
    fovEpsilon = defaultOptions.fovEpsilon,
  }: Partial<Options> = {},
) => {

  const fov = camera.fov * Math.PI / 180
  const isPerspective = fov > fovEpsilon
  const distance = isPerspective ? height / 2 / Math.tan(fov / 2) : -rangeMin

  // 1. Position, rotation & matrix.
  camera.quaternion.setFromEuler(camera.rotation)
  _matrix.makeRotationFromQuaternion(camera.quaternion)
  _vector.set(0, 0, distance).applyMatrix4(_matrix)
  camera.position.addVectors(focusPosition, _vector)
  camera.updateMatrix()

  // 2. Near, far & projection.
  const near = Math.max(nearMin, distance + rangeMin)
  const far = Math.min(farMax, distance + rangeMax)
  if (isPerspective) {
    // https://github.com/mrdoob/three.js/blob/master/src/cameras/PerspectiveCamera.js#L179
    const mHeight = height * near / distance * .5
    const mWidth = mHeight * aspect
    camera.projectionMatrix.makePerspective(-mWidth, mWidth, mHeight, -mHeight, near, far)
  } else {
    const mHeight = height * .5
    const mWidth = mHeight * aspect
    camera.projectionMatrix.makeOrthographic(-mWidth, mWidth, mHeight, -mHeight, near, far)
  }
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()

  // 3. Three internals.
  // @ts-ignore
  camera.isPerspectiveCamera = isPerspective
  // @ts-ignore
  camera.isOrthographicCamera = !isPerspective
}

const PERSPECTIVE_ONE = .8

export class VertigoCamera extends PerspectiveCamera {
  
  focusPosition = new Vector3()
  
  #height = 4
  get height() {
    return this.#height
  }
  set height(value: number) {
    this.#height = value
    this.updateVertigoCamera()
  }

  get perspective() {
    return this.fov * Math.PI / 180 / PERSPECTIVE_ONE
  }
  set perspective(value: number) {
    this.fov = value * PERSPECTIVE_ONE * 180 / Math.PI
    this.updateVertigoCamera()
  }

  #cache = {
    position: new Vector3(),
    rotation: new Euler(),
    focusPosition: new Vector3(),
  }
  #updateCache() {
    this.#cache.focusPosition.copy(this.focusPosition)
    this.#cache.position.copy(this.position)
    this.#cache.rotation.copy(this.rotation)
  }

  updateVertigoCamera() {
    computeVertigoCamera(this, this.focusPosition, this.#height, this.aspect)
    this.#updateCache()
  }

  update() {
    const focusPositionHasChanged = this.focusPosition.equals(this.#cache.focusPosition) === false
    const positionHasChanged = this.position.equals(this.#cache.position) === false
    const rotationHasChanged = this.rotation.equals(this.#cache.rotation) === false
    const dirty = focusPositionHasChanged || positionHasChanged || rotationHasChanged
    if (positionHasChanged) {
      _vector.subVectors(this.position, this.#cache.position)
      this.focusPosition.add(_vector)
    }
    if (dirty) {
      this.updateVertigoCamera()
    }
  }

  constructor() {
    super(PERSPECTIVE_ONE * 180 / Math.PI)
    this.updateVertigoCamera()

    // Set the good rotation order (first around Y, then X (front/back), then Z (screen rotation))
    this.rotation.order = 'YXZ'

    // break the "quaternion-to-euler" callback
    this.quaternion._onChangeCallback = () => {}
  }
}