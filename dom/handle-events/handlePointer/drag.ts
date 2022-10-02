import { Point } from '../../../geom'


export type DragDirection = 'horizontal' | 'vertical'

export type DragInfo = {
  total: Point
  delta: Point
  moveEvent: PointerEvent | TouchEvent
  downEvent: PointerEvent
  direction: DragDirection
}

export type DragOptions = Partial<{
  /** Should we use capture phase? */
  capture: boolean
  /** Are passive listeners wanted? */
  passive: boolean
  /** Hook that allows to ignore some down event (cancelling at the same time all other events that may follow otherwise (tap, drag etc.)). */
  onDownIgnore: (event: PointerEvent) => boolean

  dragDistanceThreshold: number
  dragDamping: number
  onDragStart: (drag: DragInfo) => void
  onDragStop: (drag: DragInfo) => void
  onDrag: (drag: DragInfo) => void
  onHorizontalDragStart: (drag: DragInfo) => void
  onHorizontalDragStop: (drag: DragInfo) => void
  onHorizontalDrag: (drag: DragInfo) => void
  onVerticalDragStart: (drag: DragInfo) => void
  onVerticalDragStop: (drag: DragInfo) => void
  onVerticalDrag: (drag: DragInfo) => void
}>

export const isDragListening = (options: DragOptions) => {
  return !!(
    options.onDragStart
    ?? options.onDragStop
    ?? options.onDrag
    ?? options.onHorizontalDragStart
    ?? options.onHorizontalDragStop
    ?? options.onHorizontalDrag
    ?? options.onVerticalDragStart
    ?? options.onVerticalDragStop
    ?? options.onVerticalDrag
  )
}

const getDragInfo = (
  downEvent: PointerEvent, 
  moveEvent: PointerEvent | TouchEvent, 
  movePoint: Point, 
  previousMovePoint: Point, 
  direction: DragDirection,
): DragInfo => {
  return {
    delta: new Point().copy(movePoint).subtract(previousMovePoint),
    total: new Point().copy(movePoint).subtract(moveEventToPoint(downEvent)),
    moveEvent,
    downEvent,
    direction,
  }
}

const moveEventToPoint = (moveEvent: PointerEvent | TouchEvent) => {
  if (moveEvent instanceof PointerEvent) {
    return new Point(moveEvent.clientX, moveEvent.clientY)
  } else {
    return new Point(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY)
  }
}

const dragHasStart = (downEvent: PointerEvent, moveEvent: PointerEvent | TouchEvent, distanceThreshold: number) => {
  const p = moveEventToPoint(moveEvent)
  const x = p.x - downEvent.clientX
  const y = p.y - downEvent.clientY
  const start = (x * x) + (y * y) > distanceThreshold * distanceThreshold
  const direction: DragDirection = Math.abs(x / y) > 1 ? 'horizontal' : 'vertical'
  return [start, direction] as const
}


export const handlePointerDrag = (element: HTMLElement | Window, options: DragOptions) => {

  const {
    capture = false,
    passive = true,
    dragDistanceThreshold = 10,
    dragDamping = .7,
  } = options

  let downEvent: PointerEvent | null = null
  let moveEvent: PointerEvent | TouchEvent | null = null
  const isTouch = () => downEvent?.pointerType === 'touch'
  const movePoint = new Point()
  const previousMovePoint = new Point()
  let isDown = false
  let dragStart = false
  let dragDirection: DragDirection = 'horizontal'
  let onDownFrameId = -1
  const onDirectionalDrag = () => dragDirection === 'horizontal' ? options.onHorizontalDrag : options.onVerticalDrag
  const onDirectionalDragStart = () => dragDirection === 'horizontal' ? options.onHorizontalDragStart : options.onVerticalDragStart
  const onDirectionalDragStop = () => dragDirection === 'horizontal' ? options.onHorizontalDragStop : options.onVerticalDragStop

  const onPointerDown = (event: PointerEvent) => {
    if (options.onDownIgnore?.(event)) {
      return
    }

    isDown = true
    dragStart = false
    downEvent = event
    moveEvent = event
    movePoint.copy(moveEventToPoint(event))
    previousMovePoint.copy(moveEventToPoint(event))

    if (isTouch()) {
      window.addEventListener('touchmove', onMoveDown, { capture, passive })
      window.addEventListener('touchend', onMoveDownEnd, { capture, passive })
    } else {
      window.addEventListener('pointermove', onMoveDown, { capture, passive })
      window.addEventListener('pointerup', onMoveDownEnd, { capture, passive })
    }

    onDownFrame()
  }

  const onMoveDown = (event: TouchEvent | PointerEvent) => {
    moveEvent = event
  }

  const onDownFrame = () => {
    if (isDown) {
      onDownFrameId = window.requestAnimationFrame(onDownFrame)

      // Do not trigger "end" on multi touch if some touch still exists.
      if (moveEvent instanceof TouchEvent) {
        if (moveEvent.touches.length > 1) {
          const [touch] = moveEvent.touches
          movePoint.set(touch.clientX, touch.clientY)
          return
        }
      }

      if (dragStart === false) {
        [dragStart, dragDirection] = dragHasStart(downEvent!, moveEvent!, dragDistanceThreshold)
        if (dragStart) {
          // Drag Started!
          const info = getDragInfo(downEvent!, moveEvent!, movePoint, previousMovePoint, dragDirection)
          options.onDragStart?.(info)
          onDirectionalDragStart()?.(info)
        }
      }
      if (dragStart) {
        previousMovePoint.copy(movePoint)
        const p = moveEventToPoint(moveEvent!)
        movePoint.x += (p.x - movePoint.x) * dragDamping
        movePoint.y += (p.y - movePoint.y) * dragDamping
        const info = getDragInfo(downEvent!, moveEvent!, movePoint, previousMovePoint, dragDirection)
        options.onDrag?.(info)
        onDirectionalDrag()?.(info)
      }
    }
  }

  const onMoveDownEnd = (event: TouchEvent | PointerEvent) => {
    if (isTouch()) {
      if ((event as TouchEvent).touches.length > 0) {
        return
      }
      window.removeEventListener('touchmove', onMoveDown, { capture })
      window.removeEventListener('touchend', onMoveDownEnd, { capture })
    } else {
      window.removeEventListener('pointermove', onMoveDown, { capture })
      window.removeEventListener('pointerup', onMoveDownEnd, { capture })
    }
    window.cancelAnimationFrame(onDownFrameId)
    if (dragStart) {
      const info = getDragInfo(downEvent!, moveEvent!, movePoint, previousMovePoint, dragDirection)
      options.onDragStop?.(info)
      onDirectionalDragStop()?.(info)
    }
    isDown = false
    downEvent = null
    dragStart = false
  }

  const target = element as HTMLElement // Fooling typescript.
  target.addEventListener('pointerdown', onPointerDown, { capture, passive })
  const destroy = () => {
    target.removeEventListener('pointerdown', onPointerDown, { capture })
    window.removeEventListener('touchmove', onMoveDown, { capture })
    window.removeEventListener('touchend', onMoveDownEnd, { capture })
    window.removeEventListener('pointermove', onMoveDown, { capture })
    window.removeEventListener('pointerup', onMoveDownEnd, { capture })
    window.cancelAnimationFrame(onDownFrameId)
  }

  return { destroy }
}
