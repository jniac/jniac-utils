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
  /** **`move when down`** callback. */
  onMoveDown: (event: PointerEvent, downEvent: PointerEvent | null) => void
  /** **`move when over`** callback. */
  onMoveOver: (event: PointerEvent) => void
  /** **`over`** callback. */
  onOver: (event: PointerEvent) => void
  /** **`out`** callback. */
  onOut: (event: PointerEvent) => void
  /** **`enter`** callback. */
  onEnter: (event: PointerEvent) => void
  /** **`leave`** callback. */
  onLeave: (event: PointerEvent) => void


  // TAP
  /** Max *"down"* duration for a couple of **`down`** / **`up`** events to be considered as a **`tap`**. 
   * @default 0.3 seconds */
  tapMaxDuration: number
  /** Max distance between a couple of **`down`** / **`up`** events to be considered as a **`tap`**. 
   * @default 10 pixels */
  tapMaxDistance: number
  /** Min interval after a *"caught"* **`tap`** (with a callback) before start considering any new **`tap`**
   * @default 0.3 seconds */
  tapPostCallbackMinInterval: number
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
    onMoveDown,
    onMoveOver,
    onOver, 
    onOut,
    onEnter,
    onLeave,

    // TAP
    tapMaxDuration = .3,
    tapMaxDistance = 10,
    tapPostCallbackMinInterval = 1,
    multipleTapMaxInterval = .4,
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
    taps: [] as TapInfo[],
    lastCallbackTimestamp: -1,
  }

  const onPointerMoveDown = (event: PointerEvent) => {
    onMoveDown?.(event, downEvent)
    moveEvent = event
  }

  const onPointerMoveOver = (event: PointerEvent) => {
    onMoveOver?.(event)
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

  const onPointerEnter = (event: PointerEvent) => {
    window.addEventListener('pointermove', onPointerMoveOver)
    onEnter?.(event)
  }

  const onPointerLeave = (event: PointerEvent) => {
    window.removeEventListener('pointermove', onPointerMoveOver)
    onLeave?.(event)
  }

  const onPointerDown = (event: PointerEvent) => {
    if (onDownIgnore?.(event)) {
      return
    }
    window.addEventListener('pointermove', onPointerMoveDown)
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
    window.removeEventListener('pointermove', onPointerMoveDown)
    window.removeEventListener('pointerup', onPointerUp)
    window.cancelAnimationFrame(onDownFrameId)
    onUp?.(event, downEvent!)
    if (dragStart) {
      onDragStop?.(getDragInfo(downEvent!, event!, movePoint, previousMovePoint))
    }

    // TAP:
    const concernTap = (
      !!(onTap || onDoubleTap || onTripleTap || onQuadrupleTap)
      && (event.timeStamp - tapState.lastCallbackTimestamp) > tapPostCallbackMinInterval * 1e3
      && isTap(downEvent!, event, tapMaxDuration, tapMaxDistance))

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
        const call = (callback: (tap: TapInfo) => void) => {
          callback(currentTap)
          tapState.lastCallbackTimestamp = currentTap.timeStamp
        }
        switch (tapState.taps.length) {
          case 1: onTap && call(onTap); break
          case 2: onDoubleTap && call(onDoubleTap); break
          case 3: onTripleTap && call(onTripleTap); break
          case 4: onQuadrupleTap && call(onQuadrupleTap); break
        }
      }

      const higherCallbackExists = (() => {
        switch (tapState.taps.length) {
          case 1: return !!(onDoubleTap || onTripleTap || onQuadrupleTap)
          case 2: return !!(onTripleTap || onQuadrupleTap)
          case 3: return !!(onQuadrupleTap)
          default: return false
        }
      })()

      if (multipleTapCancelPreviousTap && higherCallbackExists) {
        tapState.timeoutId = window.setTimeout(() => {
          const lastTap = tapState.taps[tapState.taps.length - 1]
          if (lastTap === currentTap) {
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
  element.addEventListener('pointerenter', onPointerEnter)
  element.addEventListener('pointerleave', onPointerLeave)
  element.addEventListener('pointerdown', onPointerDown)

  const destroy = () => {
    element.removeEventListener('pointerover', onPointerOver)
    element.removeEventListener('pointerout', onPointerOut)
    element.removeEventListener('pointerenter', onPointerEnter)
    element.removeEventListener('pointerleave', onPointerLeave)
    element.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMoveOver)
    window.removeEventListener('pointermove', onPointerMoveDown)
    window.removeEventListener('pointerup', onPointerUp)
    window.cancelAnimationFrame(onDownFrameId)
    window.clearTimeout(tapState.timeoutId)
  }

  return { destroy }
}
