import { IPoint, Point } from 'some-utils/geom'

type DragInfo = { 
  total: Point
  delta: Point
  moveEvent: PointerEvent
  downEvent: PointerEvent
} 

type TapInfo = { 
  timeStamp: number
  point: Point
  downEvent: PointerEvent
  upEvent: PointerEvent
}

export type Options = Partial<{
  /** **`down`** callback. */
  onDown: (event: PointerEvent, downEvent: PointerEvent) => void
  /** Hook that allows to ignore some down event (cancelling at the same time all other events that may follow otherwise (tap, drag etc.)). */
  onDownIgnore: (event: PointerEvent) => boolean
  /** **`up`** callback. */
  onUp: (event: PointerEvent, downEvent: PointerEvent) => void
  /** **`move`** callback. */
  onMove: (event: PointerEvent, downEvent: PointerEvent | null) => void
  /** **`over`** callback. */
  onOver: (event: PointerEvent) => void
  /** **`out`** callback. */
  onOut: (event: PointerEvent) => void


  // TAP
  /** Max "*down*" duration for a couple of **`down`** / **`up`** events to be considered as a **`tap`**. 
   * @default 0.3 seconds */
  tapMaxDuration: number
  /** Max distance between a couple of **`down`** / **`up`** events to be considered as a **`tap`**. 
   * @default 10 pixels */
  tapMaxDistance: number
  /** Max duration between two **`taps`** to be considered as a **`multiple-tap`**
   * @default 0.3 seconds */
  multipleTapMaxInterval: number
  /** Should we wait `multipleTapMaxInterval` before resolve tap, in order to cancel previous "n-tap"?
   * @default true if (onDoubleTap || onTripleTap || onQuadrupleTap) else false */
  multipleTapCancelPreviousTap: boolean
  /** Single tap callback. */
  onTap: (tap: TapInfo) => void
  /** Double tap callback. */
  onDoubleTap: (tap: TapInfo) => void
  /** Triple tap callback. */
  onTripleTap: (tap: TapInfo) => void
  /** Quadruple tap callback! It's a lot of taps, isn't it? */
  onQuadrupleTap: (tap: TapInfo) => void

  // DRAG
  dragDistanceThreshold: number
  dragDamping: number
  onDragStart: (drag: DragInfo) => void
  onDragStop: (drag: DragInfo) => void
  onDrag: (drag: DragInfo) => void
}>

const getDragInfo = (downEvent: PointerEvent, moveEvent: PointerEvent, movePoint: IPoint, previousMovePoint: IPoint) => {
  return {
    delta: new Point().copy(movePoint).subtract(previousMovePoint),
    total: new Point().copy(movePoint).subtract(downEvent),
    moveEvent,
    downEvent,
  }
}

const dragHasStart = (downEvent: PointerEvent, moveEvent: PointerEvent, distanceThreshold: number) => {
  const x = moveEvent.x - downEvent.x
  const y = moveEvent.y - downEvent.y
  return (x * x) + (y * y) > distanceThreshold * distanceThreshold
}

const isTap = (downEvent: PointerEvent, upEvent: PointerEvent, maxDuration: number, maxDistance: number) => {
  const x = upEvent.x - downEvent.x
  const y = upEvent.y - downEvent.y
  return (
    (x * x) + (y * y) < maxDistance * maxDistance &&
    upEvent.timeStamp - downEvent.timeStamp < maxDuration * 1e3
  )
}

export const handlePointer = (element: HTMLElement, options: Options) => {

  const {
    onDown,
    onDownIgnore, 
    onUp, 
    onMove, 
    onOver, 
    onOut,

    // TAP
    tapMaxDuration = 0.3,
    tapMaxDistance = 10,
    multipleTapMaxInterval = 0.3,
    onTap,
    onDoubleTap,
    onTripleTap,
    onQuadrupleTap,
    multipleTapCancelPreviousTap = !!(onDoubleTap || onTripleTap || onQuadrupleTap),

    // DRAG
    dragDistanceThreshold = 10, 
    dragDamping = .4, 
    onDrag, 
    onDragStart, 
    onDragStop,
  } = options

  let downEvent: PointerEvent | null = null
  let moveEvent: PointerEvent | null = null
  const movePoint = new Point()
  const previousMovePoint = new Point()

  const tapState = {
    timeoutId: -1,
    tapCount: 0,
    taps: [] as TapInfo[]
  }

  const onPointerMove = (event: PointerEvent) => {
    onMove?.(event, downEvent)
    moveEvent = event
  }

  let isDown = false
  let onDownFrameId = -1
  let dragStart = false
  const onDownFrame = () => {
    if (onDrag && isDown) {
      onDownFrameId = window.requestAnimationFrame(onDownFrame)
      if (dragStart === false) {
        dragStart = dragHasStart(downEvent!, moveEvent!, dragDistanceThreshold)
        if (dragStart) {
          // Drag Started!
          onDragStart?.(getDragInfo(downEvent!, moveEvent!, movePoint, previousMovePoint))
        }
      }
      if (dragStart) {
        previousMovePoint.copy(movePoint)
        movePoint.x += (moveEvent!.x - movePoint.x) * dragDamping
        movePoint.y += (moveEvent!.y - movePoint.y) * dragDamping
        onDrag(getDragInfo(downEvent!, moveEvent!, movePoint, previousMovePoint))
      }
    }
  }

  const onPointerOver = (event: PointerEvent) => {
    onOver?.(event)
  }

  const onPointerOut = (event: PointerEvent) => {
    onOut?.(event)
  }

  const onPointerDown = (event: PointerEvent) => {
    if (onDownIgnore?.(event)) {
      return
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    isDown = true
    dragStart = false
    downEvent = event
    moveEvent = event
    movePoint.copy(event)
    previousMovePoint.copy(event)
    onDown?.(event, downEvent)
    onDownFrame()
  }

  const onPointerUp = (event: PointerEvent) => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.cancelAnimationFrame(onDownFrameId)
    onUp?.(event, downEvent!)
    if (dragStart) {
      onDragStop?.(getDragInfo(downEvent!, event!, movePoint, previousMovePoint))
    }
    const concernTap = (
      !!(onTap || onDoubleTap || onTripleTap || onQuadrupleTap)
      && isTap(downEvent!, event, tapMaxDuration, tapMaxDistance)
    )
    if (concernTap) {
      const currentTap: TapInfo = { 
        timeStamp: event.timeStamp, 
        point: new Point().copy(event),
        downEvent: downEvent!,
        upEvent: event,
      }

      const isMultiple = (
        tapState.taps.length > 0
        && currentTap.timeStamp - tapState.taps[tapState.taps.length - 1].timeStamp < multipleTapMaxInterval * 1e3)
      tapState.taps = isMultiple ? [...tapState.taps, currentTap] : [currentTap] 

      const resolve = () => {
        if (tapState.taps.length === 2) {
          onDoubleTap?.(currentTap)
        }
        if (tapState.taps.length === 3) {
          onTripleTap?.(currentTap)
        }
        if (tapState.taps.length === 4) {
          onQuadrupleTap?.(currentTap)
        }
        onTap?.(currentTap)
      }

      if (multipleTapCancelPreviousTap) {
        tapState.timeoutId = window.setTimeout(() => {
          if (tapState.taps[tapState.taps.length - 1] === currentTap) {
            resolve()
          }
        }, multipleTapMaxInterval * 1e3)
      }
      else {
        resolve()
      }
    }
    isDown = false
    downEvent = null
    dragStart = false
  }

  element.addEventListener('pointerover', onPointerOver)
  element.addEventListener('pointerout', onPointerOut)
  element.addEventListener('pointerdown', onPointerDown)

  const destroy = () => {
    element.removeEventListener('pointerover', onPointerOver)
    element.removeEventListener('pointerout', onPointerOut)
    element.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.cancelAnimationFrame(onDownFrameId)
    window.clearTimeout(tapState.timeoutId)
  }

  return { destroy }
}
