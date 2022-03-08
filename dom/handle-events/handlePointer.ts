import { IPoint, Point } from 'some-utils/geom'

type DragInfo = { 
  total: Point
  delta: Point
  moveEvent: PointerEvent
  downEvent: PointerEvent
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
  onTap: () => void

  // DRAG
  dragDistanceThreshold: number
  dragDamping: number
  onDragStart: (info: DragInfo) => void
  onDragStop: (info: DragInfo) => void
  onDrag: (info: DragInfo) => void
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

const isTap = (downEvent: PointerEvent, upEvent: PointerEvent, maxDuration: number) => {
  return upEvent.timeStamp - downEvent.timeStamp < maxDuration * 1e3
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
    onTap,

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
    if (onTap && isTap(downEvent!, event, tapMaxDuration)) {
      onTap()
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
