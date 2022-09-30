import { Euler, Matrix4, PerspectiveCamera, Vector3 } from 'three'

const PERSPECTIVE_ONE = .8

const _vector = new Vector3()
const _matrix = new Matrix4()

type Base = {
  /** The "height" of the camera (this is really the height when fov = 0, otherwise it represents the height of the "frame" at the focus point). */
  height: number
  /** Field Of View, in degree (because ThreeJS) */
  fov: number
  /** Represents the focus point. Where the camera is looking at. Where the "height" makes sense. */
  focusPosition: Vector3
  /** The position of the camera. Derives from focusPosition. */
  position: Vector3
  /** The rotation of the camera in euler representation. YXZ ordered. */
  rotation: Euler
}

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

const defaultHeight = 4

const defaultOptions: Options = {
  rangeMin: -1000,
  rangeMax: 1000,
  nearMin: .01,
  farMax: 1e5,
  fovEpsilon: 1 * Math.PI / 180,
}

export const updateVertigoCamera = (
  camera: PerspectiveCamera,
  focusPosition: Vector3,
  height: number,
  aspect: number,
  rangeMin = defaultOptions.rangeMin,
  rangeMax = defaultOptions.rangeMax,
  nearMin = defaultOptions.nearMin,
  farMax = defaultOptions.farMax,
  fovEpsilon = defaultOptions.fovEpsilon,
) => {

  // NOTE: In ThreeJS "fov" is in degree.
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

export class VertigoCamera extends PerspectiveCamera implements Base, Options {

  height = defaultHeight
  rangeMin = defaultOptions.rangeMin
  rangeMax = defaultOptions.rangeMax
  nearMin = defaultOptions.nearMin
  farMax = defaultOptions.farMax
  fovEpsilon = defaultOptions.fovEpsilon
  focusPosition = new Vector3()

  // Cache takes some lines:
  #cache: Base & Options = {
    height: 0,
    fov: 0,
    focusPosition: new Vector3(),
    position: new Vector3(),
    rotation: new Euler(),
    rangeMin: 0,
    rangeMax: 0,
    nearMin: 0,
    farMax: 0,
    fovEpsilon: 0,
  }
  #cacheChanges: Record<keyof (Base & Options), boolean> = {
    height: false,
    fov: false,
    focusPosition: false,
    position: false,
    rotation: false,
    rangeMin: false,
    rangeMax: false,
    nearMin: false,
    farMax: false,
    fovEpsilon: false,
  }
  #computeCacheChanges() {
    const cache = this.#cache
    const changed = this.#cacheChanges
    changed.height = cache.height !== this.height
    changed.fov = cache.fov !== this.fov
    changed.focusPosition = !cache.focusPosition.equals(this.focusPosition)
    changed.position = !cache.position.equals(this.position)
    changed.rotation = !cache.rotation.equals(this.rotation)
    changed.rangeMin = cache.rangeMin !== this.rangeMin
    changed.rangeMax = cache.rangeMax !== this.rangeMax
    changed.nearMin = cache.nearMin !== this.nearMin
    changed.farMax = cache.farMax !== this.farMax
    changed.fovEpsilon = cache.fovEpsilon !== this.fovEpsilon
    return (
      changed.height
      || changed.fov
      || changed.focusPosition
      || changed.position
      || changed.rotation
      || changed.rangeMin
      || changed.rangeMax
      || changed.nearMin
      || changed.farMax
      || changed.fovEpsilon
    )
  }
  #updateCache() {
    const cache = this.#cache
    cache.height = this.height
    cache.fov = this.fov
    cache.focusPosition.copy(this.focusPosition)
    cache.position.copy(this.position)
    cache.rotation.copy(this.rotation)
    cache.rangeMin = this.rangeMin
    cache.rangeMax = this.rangeMax
    cache.nearMin = this.nearMin
    cache.farMax = this.farMax
    cache.fovEpsilon = this.fovEpsilon
  }

  updateVertigoCamera() {
    updateVertigoCamera(this,
      this.focusPosition,
      this.height,
      this.aspect,
      this.rangeMin,
      this.rangeMax,
      this.nearMin,
      this.farMax,
      this.fovEpsilon)
    this.#updateCache()
  }

  throwNaN() {
    if (Number.isNaN(this.height)) {
      throw new Error(`"height" is NaN!`)
    }
    if (Number.isNaN(this.focusPosition.x) || Number.isNaN(this.focusPosition.y) || Number.isNaN(this.focusPosition.z)) {
      throw new Error(`"focusPosition.x|y|z" is NaN!`)
    }
    if (Number.isNaN(this.position.x) || Number.isNaN(this.position.y) || Number.isNaN(this.position.z)) {
      throw new Error(`"position.x|y|z" is NaN!`)
    }
  }

  update() {
    this.throwNaN()

    const dirty = this.#computeCacheChanges()

    if (dirty) {
      // If "position" changes, compute the resulting "focus position" changes.
      if (this.#cacheChanges.position) {
        _vector.subVectors(this.position, this.#cache.position)
        this.focusPosition.add(_vector)
      }

      this.updateVertigoCamera()
    }
  }

  constructor() {
    super(PERSPECTIVE_ONE * 180 / Math.PI)
    this.updateVertigoCamera()

    // Set the good rotation order (first around Y, then X (front/back), then Z (screen rotation))
    this.rotation.order = 'YXZ'

    // break the "quaternion-to-euler" callback
    this.quaternion._onChangeCallback = () => { }
  }

  move(v: Vector3): this
  move(x: number, y: number, z: number): this
  move(arg0: number | Vector3, arg1?: number, arg2?: number) {
    if (arg0 instanceof Vector3) {
      _vector.copy(arg0)
    } else {
      _vector.set(arg0, arg1 ?? 0, arg2 ?? 0)
    }
    const { x, y, z } = _vector
    const position = this.position, me = this.matrix.elements
    position.x += me[0] * x
    position.y += me[1] * x
    position.z += me[2] * x
    position.x += me[4] * y
    position.y += me[5] * y
    position.z += me[6] * y
    position.x += me[8] * z
    position.y += me[9] * z
    position.z += me[10] * z
    return this
  }

  applyZoom(ratio: number, { x = 0, y = 0 } = {}) {
    const deltaHeight = this.height * (1 - ratio) * .5
    this.height *= ratio
    const me = this.matrix.elements
    const dy = deltaHeight * y
    const dx = deltaHeight * this.aspect * x
    const rx = me[0], ry = me[1], rz = me[2]
    const ux = me[4], uy = me[5], uz = me[6]
    this.focusPosition.x += dx * rx + dy * ux
    this.focusPosition.y += dx * ry + dy * uy
    this.focusPosition.z += dx * rz + dy * uz
    this.throwNaN()
  }

  getDistance() {
    const fov = this.fov * Math.PI / 180
    const isPerspective = fov > this.fovEpsilon
    return isPerspective ? this.height * .5 / Math.tan(fov * .5) : -this.rangeMin
  }

  /**
   * NOTE: Not sure of this function. Does it do what it should do?
   */
  setDistance(value: number) {
    if (value <= 0) {
      throw new Error(`Invalid value (${value}).`)
    }
    const fov = this.fov * Math.PI / 180
    const isPerspective = fov > this.fovEpsilon
    const me = this.matrix.elements
    const fx = me[8], fy = me[9], fz = me[10]
    const tx = me[12], ty = me[13], tz = me[14]
    this.focusPosition.set(
      tx - fx * value,
      ty - fy * value,
      tz - fz * value)
    if (isPerspective) {
      // Compensate height with the new focus position (in perspective only).
      this.height = Math.tan(fov * .5) * value * 2
    }
    this.throwNaN()
  }

  // Some sugar?
  // Here it is:

  get perspective() {
    return this.fov * Math.PI / 180 / PERSPECTIVE_ONE
  }
  set perspective(value: number) {
    this.fov = value * PERSPECTIVE_ONE * 180 / Math.PI
  }

  get distance() {
    return this.getDistance()
  }
  set distance(value: number) {
    this.setDistance(value)
  }
}