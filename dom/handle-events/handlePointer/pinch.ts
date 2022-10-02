import { Point } from 'some-utils/geom'

type PinchState = {
  center: Point
  point0: Point
  point1: Point
  gap: Point
  gapMagnitude: number
  totalScale: number
  frameScale: number
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
  } = options
  const info: InternalPinchInfo = { frame: 0 }
  const update = (point0: Point, point1: Point) => {
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
    }
    info.current = state
    if (!info.start) {
      console.log('start')
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
  }
  const onTouchMove = (event: TouchEvent) => {
    const points = [...event.touches].map(touch => new Point(touch.clientX, touch.clientY))
    if (points.length === 2) {
      update(points[0], points[1])
    }
    if (points.length < 2 && info.current) {
      stop()
    } 
  }
  const target = element as HTMLElement // Fooling typescript.
  target.addEventListener('touchmove', onTouchMove, { capture, passive })
  target.addEventListener('touchend', onTouchMove, { capture, passive })
  const destroy = () => {
    target.removeEventListener('touchmove', onTouchMove, { capture })
    target.removeEventListener('touchend', onTouchMove, { capture })
  }
  return { destroy }
}
