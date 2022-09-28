import { Euler, Matrix4, PerspectiveCamera, Vector3 } from 'three'

const _vector = new Vector3()
const _matrix = new Matrix4()

const PERSPECTIVE_ONE = .8

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

const defaultOptions: Options = {
  rangeMin: -100,
  rangeMax: 1000,
  nearMin: .01,
  farMax: 1e5,
  fovEpsilon: .02,
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

  height = 4
  rangeMin = defaultOptions.rangeMin
  rangeMax = defaultOptions.rangeMax
  nearMin = defaultOptions.nearMin
  farMax = defaultOptions.farMax
  fovEpsilon = defaultOptions.fovEpsilon
  focusPosition = new Vector3()

  // Cache take some lines:
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

  update() {
    const dirty = this.#computeCacheChanges()

    if (dirty) {
      // Compute the "focus position" changes, from the "position" change.
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

  getDistance() {
    const fov = this.fov * Math.PI / 180
    const isPerspective = fov > this.fovEpsilon
    return isPerspective ? this.height / 2 / Math.tan(fov / 2) : -this.rangeMin
  }

  // Some sugar?
  // Here it is:

  get perspective() {
    return this.fov * Math.PI / 180 / PERSPECTIVE_ONE
  }
  set perspective(value: number) {
    this.fov = value * PERSPECTIVE_ONE * 180 / Math.PI
    this.updateVertigoCamera()
  }
  
  get distance() {
    return this.getDistance()
  }
}