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
  const direction = Math.abs(x / y) > 1 ? 'horizontal' : 'vertical'
  return [start, direction] as [boolean, DragDirection]
}


export const handlePointerDrag = (element: HTMLElement | Window, options: DragOptions) => {

  const {
    capture = false,
    passive = true,

    onDownIgnore,

    dragDistanceThreshold = 10,
    dragDamping = .4,
    onDrag,
    onDragStart,
    onDragStop,
    onHorizontalDrag,
    onHorizontalDragStart,
    onHorizontalDragStop,
    onVerticalDrag,
    onVerticalDragStart,
    onVerticalDragStop,
  } = options

  let _downEvent: PointerEvent | null = null
  let _moveEvent: PointerEvent | TouchEvent | null = null
  const isTouch = () => _downEvent?.pointerType === 'touch'
  const _movePoint = new Point()
  const _previousMovePoint = new Point()
  let _isDown = false
  let _dragStart = false
  let _dragDirection: DragDirection = 'horizontal'
  let _onDownFrameId = -1
  const onDirectionalDrag = () => _dragDirection === 'horizontal' ? onHorizontalDrag : onVerticalDrag
  const onDirectionalDragStart = () => _dragDirection === 'horizontal' ? onHorizontalDragStart : onVerticalDragStart
  const onDirectionalDragStop = () => _dragDirection === 'horizontal' ? onHorizontalDragStop : onVerticalDragStop

  const _onPointerDown = (event: PointerEvent) => {
    if (onDownIgnore?.(event)) {
      return
    }

    _isDown = true
    _dragStart = false
    _downEvent = event
    _moveEvent = event
    _movePoint.copy(moveEventToPoint(event))
    _previousMovePoint.copy(moveEventToPoint(event))

    if (isTouch()) {
      window.addEventListener('touchmove', _onMoveDown, { capture, passive })
      window.addEventListener('touchend', _onMoveDownEnd, { capture, passive })
    } else {
      window.addEventListener('pointermove', _onMoveDown, { capture, passive })
      window.addEventListener('pointerup', _onMoveDownEnd, { capture, passive })
    }

    _onDownFrame()
  }

  const _onMoveDown = (event: TouchEvent | PointerEvent) => {
    _moveEvent = event
  }

  const _onDownFrame = () => {
    if (_isDown) {
      _onDownFrameId = window.requestAnimationFrame(_onDownFrame)
      if (_dragStart === false) {
        [_dragStart, _dragDirection] = dragHasStart(_downEvent!, _moveEvent!, dragDistanceThreshold)
        if (_dragStart) {
          // Drag Started!
          const info = getDragInfo(_downEvent!, _moveEvent!, _movePoint, _previousMovePoint, _dragDirection)
          onDragStart?.(info)
          onDirectionalDragStart()?.(info)
        }
      }
      if (_dragStart) {
        _previousMovePoint.copy(_movePoint)
        const p = moveEventToPoint(_moveEvent!)
        _movePoint.x += (p.x - _movePoint.x) * dragDamping
        _movePoint.y += (p.y - _movePoint.y) * dragDamping
        const info = getDragInfo(_downEvent!, _moveEvent!, _movePoint, _previousMovePoint, _dragDirection)
        onDrag?.(info)
        onDirectionalDrag()?.(info)
      }
    }
  }

  const _onMoveDownEnd = (event: TouchEvent | PointerEvent) => {
    if (isTouch()) {
      window.removeEventListener('touchmove', _onMoveDown, { capture })
      window.removeEventListener('touchend', _onMoveDownEnd, { capture })
    } else {
      window.removeEventListener('pointermove', _onMoveDown, { capture })
      window.removeEventListener('pointerup', _onMoveDownEnd, { capture })
    }
    window.cancelAnimationFrame(_onDownFrameId)
    if (_dragStart) {
      const info = getDragInfo(_downEvent!, event!, _movePoint, _previousMovePoint, _dragDirection)
      onDragStop?.(info)
      onDirectionalDragStop()?.(info)
    }
    _isDown = false
    _downEvent = null
    _dragStart = false
  }

  const target = element as HTMLElement // Fooling typescript.
  target.addEventListener('pointerdown', _onPointerDown, { capture, passive })
  const destroy = () => {
    target.removeEventListener('pointerdown', _onPointerDown, { capture })
    window.removeEventListener('touchmove', _onMoveDown, { capture })
    window.removeEventListener('touchend', _onMoveDownEnd, { capture })
    window.removeEventListener('pointermove', _onMoveDown, { capture })
    window.removeEventListener('pointerup', _onMoveDownEnd, { capture })
    window.cancelAnimationFrame(_onDownFrameId)
  }

  return { destroy }
}
