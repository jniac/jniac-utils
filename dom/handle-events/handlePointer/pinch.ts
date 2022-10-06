import { Point } from '../../../geom'
import { destroyDebugDisplay, updateDebugDisplay } from './pinch-debug'

type PinchState = {
  center: Point
  point0: Point
  point1: Point
  gap: Point
  gapMagnitude: number
  totalScale: number
  frameScale: number
  isFakePinch: boolean
}

type InternalPinchInfo = {
  frame: number
  current?: PinchState
  old?: PinchState
  start?: PinchState
}

export type PinchInfo = Required<InternalPinchInfo>

export type PinchOptions = Partial<{
  /** Should we use capture phase? */
  capture: boolean
  /** Are passive listeners wanted? */
  passive: boolean
  /** Hook that allows to ignore some down event (cancelling at the same time all other events that may follow otherwise (tap, drag etc.)). */
  onDownIgnore: (event: PointerEvent) => boolean
  /** For debug / test purpose. [Shift] key to pinch "in" from the current touch point. [Alt] key to pinch "out" (from the center). */
  fakePinch: boolean
  /** Display debug pinch helpers. */
  debugPinch: boolean

  onPinch: (info: PinchInfo) => void
  onPinchStart: (info: PinchInfo) => void
  onPinchStop: (info: PinchInfo) => void
}>

export const isPinchListening = (options: PinchOptions) => {
  return !!(
    options.onPinch
    ?? options.onPinchStart
    ?? options.onPinchStop
  )
}

export const handlePinch = (element: HTMLElement | Window, options: PinchOptions) => {
  const {
    capture = false,
    passive = true,
    fakePinch = true,
    debugPinch = false,
  } = options

  const info: InternalPinchInfo = { frame: 0 }
  let isPinch = false
  let isFakePinch = false
  let fakePinchStartPoint: Point | null = null
  let points: Point[] = []

  const update = (point0: Point, point1: Point, isFakePinch: boolean) => {
    info.old = info.current
    const center = Point.add(point0, point1).multiplyScalar(.5)
    const gap = Point.subtract(point1, point0)
    const gapMagnitude = gap.magnitude
    const totalScale = info.start ? gapMagnitude / info.start.gapMagnitude : 1
    const frameScale = info.old ? gapMagnitude / info.old.gapMagnitude : 1
    const state: PinchState = {
      point0,
      point1,
      center,
      gap,
      gapMagnitude,
      totalScale,
      frameScale,
      isFakePinch,
    }
    info.current = state
    if (!info.start) {
      info.start = state
      info.old = state
      options.onPinchStart?.(info as PinchInfo)
    }
    options.onPinch?.(info as PinchInfo)
    info.frame++
  }

  const stop = () => {
    options.onPinchStop?.(info as PinchInfo)
    info.frame = 0
    info.current = undefined
    info.old = undefined
    info.start = undefined
    fakePinchStartPoint = null
    destroyDebugDisplay()
  }

  const onPointerDown = (event: PointerEvent) => {
    if (fakePinch) {
      if (fakePinchStartPoint === null) {
        fakePinchStartPoint = event.altKey
          ? new Point(window.innerWidth / 2, window.innerHeight / 2)
          : new Point(event.clientX, event.clientY)
      }
    }
  }

  const onTouch = (event: TouchEvent) => {
    points = [...event.touches].map(touch => new Point(touch.clientX, touch.clientY))
    isPinch = points.length === 2
    isFakePinch = points.length === 1 && fakePinch && (event.shiftKey || event.altKey)
    if (points.length < 2 && info.current && info.current.isFakePinch === false) {
      stop()
    }
    if (points.length < 1 && info.current && info.current.isFakePinch) {
      stop()
    }
  }

  let frameId = -1
  const frameUpdate = () => {
    frameId = window.requestAnimationFrame(frameUpdate)

    // Regular pinch.
    if (isPinch) {
      update(points[0], points[1], false)
      if (debugPinch) {
        updateDebugDisplay(points[0], points[1])
      }
    }

    // Fake pinch.
    if (isFakePinch && fakePinchStartPoint !== null) {
      const [point0] = points
      const delta = point0.clone().subtract(fakePinchStartPoint)
      if (delta.sqMagnitude > 0) {
        const minimalMagnitude = 20
        const currentMagnitude = delta.magnitude
        const desiredMagnitude = Math.max(delta.magnitude, minimalMagnitude)
        delta.multiplyScalar(desiredMagnitude / currentMagnitude)
        const point0 = fakePinchStartPoint.clone().add(delta)
        const point1 = fakePinchStartPoint.clone().subtract(delta)
        update(point0, point1, true)
        updateDebugDisplay(point0, point1)
      }
    }
  }

  const target = element as HTMLElement // Fooling typescript.
  target.addEventListener('pointerdown', onPointerDown, { capture, passive })
  target.addEventListener('touchmove', onTouch, { capture, passive })
  target.addEventListener('touchend', onTouch, { capture, passive })
  frameId = window.requestAnimationFrame(frameUpdate)
  
  const destroy = () => {
    target.removeEventListener('pointerdown', onPointerDown, { capture })
    target.removeEventListener('touchmove', onTouch, { capture })
    target.removeEventListener('touchend', onTouch, { capture })
    window.cancelAnimationFrame(frameId)
  }

  return { destroy }
}
