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
}

export type Options = Partial<{
  onDown: (event: PointerEvent, downEvent: PointerEvent) => void
  onDownIgnore: (event: PointerEvent) => boolean
  onUp: (event: PointerEvent, downEvent: PointerEvent) => void
  onMove: (event: PointerEvent, downEvent: PointerEvent | null) => void
  onOver: (event: PointerEvent) => void
  onOut: (event: PointerEvent) => void


  // TAP
  tapMaxDuration: number
  tapMaxDistance: number
  multipleTapMaxInterval: number
  onTap: (tap: TapInfo) => void
  onDoubleTap: (tap: TapInfo) => void
  onTripleTap: (tap: TapInfo) => void
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
    if ((onTap || onDoubleTap || onTripleTap || onQuadrupleTap) && isTap(downEvent!, event, tapMaxDuration, tapMaxDistance)) {
      const tap: TapInfo = { 
        timeStamp: event.timeStamp, 
        point: new Point().copy(event),
      }
      const isMultiple = (
        tapState.taps.length > 0 && 
        tap.timeStamp - tapState.taps[tapState.taps.length - 1].timeStamp < multipleTapMaxInterval * 1e3
      )
      if (isMultiple) {
        tapState.taps.push(tap)
      }
      else {
        tapState.taps = [tap]
      }
      if (tapState.taps.length === 2) {
        onDoubleTap?.(tap)
      }
      if (tapState.taps.length === 3) {
        onTripleTap?.(tap)
      }
      if (tapState.taps.length === 4) {
        onQuadrupleTap?.(tap)
      }
      onTap?.(tap)
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
  }

  return { destroy }
}
