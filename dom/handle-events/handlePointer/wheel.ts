import { VectorVariable } from 'some-utils/variables'

const toXYZ = ([x, y, z]: number[] | Float32Array | Float64Array) => ({ x, y, z })

export type WheelFrameInfo = {
  deltaTime: number
  velocity: { x: number, y: number, z: number }
  velocityOld: { x: number, y: number, z: number }
  event: WheelEvent
}

export type WheelOptions = Partial<{

  /** Should we use capture phase? */
  capture: boolean
  /** Are passive listeners wanted? */
  passive: boolean

  /** Should we ignore those wheel events? */
  onWheelIgnore: (event: WheelEvent) => boolean

  onWheel: (event: WheelEvent) => void
  onWheelStart: () => void
  onWheelStop: () => void

  onWheelFrame: (info: WheelFrameInfo) => void
}>

export const isWheelListening = (options: WheelOptions) => {
  return !!(
    options.onWheel
    ?? options.onWheelStart
    ?? options.onWheelStop
    ?? options.onWheelFrame
  )
}

export const handlePointerWheel = (element: HTMLElement | Window, options: WheelOptions) => {

  const {
    capture = false,
    passive = true,

    onWheelIgnore,
    
    onWheel,
    onWheelStart,
    onWheelStop,

    onWheelFrame,
  } = options

  const _rawVelocity = new VectorVariable([0, 0, 0], { size: 5 })
  const _averageVelocity = new VectorVariable([0, 0, 0], { size: 100, derivativeCount: 2 })
  const _velocity = { x: 0, y: 0, z: 0 }

  let _wheelEvent: WheelEvent | null = null

  const _onWheel = (event: WheelEvent) => {
    // Skip ignored event.
    if (onWheelIgnore && onWheelIgnore(event) === true) {
      return
    }
    const deltaTime = (event.timeStamp - (_wheelEvent?.timeStamp ?? 0)) / 1e3
    // Skip invalid deltaTimes that lead to NaN values.
    if (deltaTime <= 0) {
      return
    }
    if (_wheelEvent === null) {
      onWheelStart?.()
    }
    _wheelEvent = event
    onWheel?.(event)
    _velocity.x = event.deltaX / deltaTime
    _velocity.y = event.deltaY / deltaTime
    _velocity.z = event.deltaZ / deltaTime
  }

  let _onWheelFrameId = -1, _onWheelFrameTimestamp = 0
  const _onWheelFrame = (timestamp: number) => {
    _onWheelFrameId = window.requestAnimationFrame(_onWheelFrame)

    _rawVelocity.setNewValue([_velocity.x, _velocity.y, _velocity.z])
    _averageVelocity.setNewValue(_rawVelocity.average)

    if (_wheelEvent === null) {
      return
    }

    const deltaTime = (timestamp - _onWheelFrameTimestamp) / 1e3
    _onWheelFrameTimestamp = timestamp
    const wheelEventAge = timestamp - _wheelEvent.timeStamp
    if (wheelEventAge > 80) {
      _velocity.x = 0
      _velocity.y = 0
      _velocity.z = 0
      _wheelEvent = null
      onWheelStop?.()
    }

    if (_wheelEvent === null) {
      return
    }

    const velocity = toXYZ(_averageVelocity.value)
    const velocityOld = toXYZ(_averageVelocity.getValue(1))
    onWheelFrame?.({ deltaTime, velocity, velocityOld, event: _wheelEvent })
  }



  // Subscription

  const target = element as HTMLElement // Fooling typescript.

  target.addEventListener('wheel', _onWheel, { capture, passive })
  _onWheelFrameId = window.requestAnimationFrame(_onWheelFrame)

  const destroy = () => {
    target.addEventListener('wheel', _onWheel, { capture, passive })
    window.cancelAnimationFrame(_onWheelFrameId)
  }

  return { destroy }
}
