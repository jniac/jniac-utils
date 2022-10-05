import { Point } from 'some-utils/geom'

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
  /** For debug / test purpose. */
  fakePinchWithShiftKey: boolean
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

const updateDebugDisplay = (point0: Point, point1: Point) => {
  const createPin = (id: string, html: string) => {
    const div = document.createElement('div')
    div.id = id
    document.body.append(div)
    div.style.position = 'fixed'
    div.style.width = '32px'
    div.style.height = '32px'
    div.style.border = 'solid 2px #0006'
    div.style.borderRadius = '50%'
    div.style.transform = 'translate(-50%, -50%)'
    div.style.backgroundColor = '#fff6'
    div.style.display = 'flex'
    div.style.justifyContent = 'center'
    div.style.alignItems = 'center'
    div.innerHTML = html
    return div
  }
  const createCenter = (id: string) => {
    const div = document.createElement('div')
    div.id = id
    document.body.append(div)
    div.style.position = 'fixed'
    div.style.width = '16px'
    div.style.height = '16px'
    div.style.borderRadius = '50%'
    div.style.transform = 'translate(-50%, -50%)'
    div.style.backgroundColor = '#0006'
    return div
  }
  const id0 = 'handlePinch-debug-pin-0'
  const id1 = 'handlePinch-debug-pin-1'
  const id2 = 'handlePinch-debug-center'
  const pin0 = document.querySelector(`#${id0}`) as HTMLDivElement ?? createPin(id0, '0')
  const pin1 = document.querySelector(`#${id1}`) as HTMLDivElement ?? createPin(id1, '1')
  const center = document.querySelector(`#${id2}`) as HTMLDivElement ?? createCenter(id2)
  pin0.style.left = `${point0.x}px`
  pin0.style.top = `${point0.y}px`
  pin1.style.left = `${point1.x}px`
  pin1.style.top = `${point1.y}px`
  center.style.left = `${(point0.x + point1.x) / 2}px`
  center.style.top = `${(point0.y + point1.y) / 2}px`
}

const destroyDebugDisplay = () => {
  const id0 = 'handlePinch-debug-pin-0'
  const id1 = 'handlePinch-debug-pin-1'
  const id2 = 'handlePinch-debug-center'
  document.querySelector(`#${id0}`)?.remove()
  document.querySelector(`#${id1}`)?.remove()
  document.querySelector(`#${id2}`)?.remove()
}

export const handlePinch = (element: HTMLElement | Window, options: PinchOptions) => {
  const {
    capture = false,
    passive = true,
    fakePinchWithShiftKey = true,
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
  const onTouch = (event: TouchEvent) => {
    points = [...event.touches].map(touch => new Point(touch.clientX, touch.clientY))
    isPinch = points.length === 2
    isFakePinch = points.length === 1 && fakePinchWithShiftKey && event.shiftKey
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
    if (isFakePinch) {
      const [point0] = points
      if (fakePinchStartPoint === null) {
        fakePinchStartPoint = new Point(window.innerWidth / 2, window.innerHeight / 2)
      }
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
  target.addEventListener('touchmove', onTouch, { capture, passive })
  target.addEventListener('touchend', onTouch, { capture, passive })
  frameId = window.requestAnimationFrame(frameUpdate)
  const destroy = () => {
    target.removeEventListener('touchmove', onTouch, { capture })
    target.removeEventListener('touchend', onTouch, { capture })
    window.cancelAnimationFrame(frameId)
  }
  return { destroy }
}
