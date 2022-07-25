import { IPoint, Point } from '../../geom'

type DragDirection = 'horizontal' | 'vertical'
type DragInfo = { 
  total: Point
  delta: Point
  moveEvent: PointerEvent
  downEvent: PointerEvent
  direction: DragDirection
} 

type TapInfo = { 
  timeStamp: number
  point: Point
  downEvent: PointerEvent
  upEvent: PointerEvent
}

export type Options = Partial<{

  /** Should we use capture phase? */
  capture: boolean
  /** Are passive listeners wanted? */
  passive: boolean

  /** **`down`** callback. */
  onDown: (event: PointerEvent, downEvent: PointerEvent) => void
  /** Hook that allows to ignore some down event (cancelling at the same time all other events that may follow otherwise (tap, drag etc.)). */
  onDownIgnore: (event: PointerEvent) => boolean
  /** **`up`** callback. */
  onUp: (event: PointerEvent, downEvent: PointerEvent) => void
  /** **`move when down`** callback. */
  onMove: (event: PointerEvent) => void
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
  /** Context menu? The right click! */
  onContextMenu: (event: PointerEvent) => void


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
  onHorizontalDragStart: (drag: DragInfo) => void
  onHorizontalDragStop: (drag: DragInfo) => void
  onHorizontalDrag: (drag: DragInfo) => void
  onVerticalDragStart: (drag: DragInfo) => void
  onVerticalDragStop: (drag: DragInfo) => void
  onVerticalDrag: (drag: DragInfo) => void
}>

const getDragInfo = (downEvent: PointerEvent, moveEvent: PointerEvent, movePoint: IPoint, previousMovePoint: IPoint, direction: DragDirection): DragInfo => {
  return {
    delta: new Point().copy(movePoint).subtract(previousMovePoint),
    total: new Point().copy(movePoint).subtract(downEvent),
    moveEvent,
    downEvent,
    direction,
  }
}

const dragHasStart = (downEvent: PointerEvent, moveEvent: PointerEvent, distanceThreshold: number) => {
  const x = moveEvent.x - downEvent.x
  const y = moveEvent.y - downEvent.y
  const start = (x * x) + (y * y) > distanceThreshold * distanceThreshold
  const direction = Math.abs(x / y) > 1 ? 'horizontal' : 'vertical'
  return [start, direction] as [boolean, DragDirection]
}

const isTap = (downEvent: PointerEvent, upEvent: PointerEvent, maxDuration: number, maxDistance: number) => {
  const x = upEvent.x - downEvent.x
  const y = upEvent.y - downEvent.y
  return (
    (x * x) + (y * y) < maxDistance * maxDistance &&
    upEvent.timeStamp - downEvent.timeStamp < maxDuration * 1e3
  )
}

export const handlePointer = (element: HTMLElement | Window, options: Options) => {

  const {
    capture = false,
    passive = true,

    onDown,
    onDownIgnore, 
    onUp,
    onMove,
    onMoveDown,
    onMoveOver,
    onOver, 
    onOut,
    onEnter,
    onLeave,
    onContextMenu,

    // TAP
    tapMaxDuration = .3,
    tapMaxDistance = 10,
    tapPostCallbackMinInterval = .4,
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
    onHorizontalDrag,
    onHorizontalDragStart,
    onHorizontalDragStop,
    onVerticalDrag,
    onVerticalDragStart,
    onVerticalDragStop,
  } = options

  let _downEvent: PointerEvent | null = null
  let _moveEvent: PointerEvent | null = null
  const _movePoint = new Point()
  const _previousMovePoint = new Point()

  const _tapState = {
    timeoutId: -1,
    tapCount: 0,
    taps: [] as TapInfo[],
    lastCallbackTimestamp: -1,
  }

  const _onPointerMoveDown = (event: PointerEvent) => {
    if (_downEvent?.pointerId === event.pointerId) {
      onMoveDown?.(event, _downEvent)
      _moveEvent = event
    }
  }

  const _onPointerMoveOver = (event: PointerEvent) => {
    onMoveOver?.(event)
  }

  let _isDown = false
  let _onDownFrameId = -1
  const _dragListening = !!(onDrag || onHorizontalDrag || onVerticalDrag 
    || onDragStart || onHorizontalDragStart || onVerticalDragStart
    || onDragStop || onHorizontalDragStop || onVerticalDragStop)
  let _dragStart = false
  let _dragDirection: DragDirection = 'horizontal'
  const onDownFrame = () => {
    if (_dragListening && _isDown) {
      _onDownFrameId = window.requestAnimationFrame(onDownFrame)
      if (_dragStart === false) {
        [_dragStart, _dragDirection] = dragHasStart(_downEvent!, _moveEvent!, dragDistanceThreshold)
        if (_dragStart) {
          // Drag Started!
          const info = getDragInfo(_downEvent!, _moveEvent!, _movePoint, _previousMovePoint, _dragDirection)
          onDragStart?.(info)
          if (_dragDirection === 'horizontal') {
            onHorizontalDragStart?.(info)
          }
          else {
            onVerticalDragStart?.(info)
          }
        }
      }
      if (_dragStart) {
        _previousMovePoint.copy(_movePoint)
        _movePoint.x += (_moveEvent!.x - _movePoint.x) * dragDamping
        _movePoint.y += (_moveEvent!.y - _movePoint.y) * dragDamping
        const info = getDragInfo(_downEvent!, _moveEvent!, _movePoint, _previousMovePoint, _dragDirection)
        onDrag?.(info)
        if (_dragDirection === 'horizontal') {
          onHorizontalDrag?.(info)
        }
        else {
          onVerticalDrag?.(info)
        }
      }
    }
  }

  const _onPointerOver = (event: PointerEvent) => {
    onOver?.(event)
  }

  const _onPointerOut = (event: PointerEvent) => {
    onOut?.(event)
  }

  const _onPointerEnter = (event: PointerEvent) => {
    window.addEventListener('pointermove', _onPointerMoveOver, { capture, passive })
    onEnter?.(event)
  }

  const _onPointerLeave = (event: PointerEvent) => {
    window.removeEventListener('pointermove', _onPointerMoveOver, { capture })
    onLeave?.(event)
  }

  const _onPointerDown = (event: PointerEvent) => {
    if (onDownIgnore?.(event)) {
      return
    }
    window.addEventListener('pointermove', _onPointerMoveDown, { capture, passive })
    window.addEventListener('pointerup', onPointerUp, { capture, passive })
    _isDown = true
    _dragStart = false
    _downEvent = event
    _moveEvent = event
    _movePoint.copy(event)
    _previousMovePoint.copy(event)
    onDown?.(event, _downEvent)
    onDownFrame()
  }

  const _onPointerMove = (event: PointerEvent) => {
    onMove?.(event)
  }

  const onPointerUp = (event: PointerEvent) => {
    window.removeEventListener('pointermove', _onPointerMoveDown, { capture })
    window.removeEventListener('pointerup', onPointerUp, { capture })
    window.cancelAnimationFrame(_onDownFrameId)
    onUp?.(event, _downEvent!)
    if (_dragStart) {
      const info = getDragInfo(_downEvent!, event!, _movePoint, _previousMovePoint, _dragDirection)
      onDragStop?.(info)
      if (_dragDirection === 'horizontal') {
        onHorizontalDragStop?.(info)
      }
      else {
        onVerticalDragStop?.(info)
      }
    }

    // TAP:
    const concernTap = (
      !!(onTap || onDoubleTap || onTripleTap || onQuadrupleTap)
      && (event.timeStamp - _tapState.lastCallbackTimestamp) > tapPostCallbackMinInterval * 1e3
      && isTap(_downEvent!, event, tapMaxDuration, tapMaxDistance))

    if (concernTap) {
      const currentTap: TapInfo = { 
        timeStamp: event.timeStamp, 
        point: new Point().copy(event),
        downEvent: _downEvent!,
        upEvent: event,
      }

      const isMultiple = (
        _tapState.taps.length > 0
        && currentTap.timeStamp - _tapState.taps[_tapState.taps.length - 1].timeStamp < multipleTapMaxInterval * 1e3)
      _tapState.taps = isMultiple ? [..._tapState.taps, currentTap] : [currentTap] 

      const resolve = () => {
        const call = (callback: (tap: TapInfo) => void) => {
          callback(currentTap)
          _tapState.lastCallbackTimestamp = currentTap.timeStamp
        }
        switch (_tapState.taps.length) {
          case 1: onTap && call(onTap); break
          case 2: onDoubleTap && call(onDoubleTap); break
          case 3: onTripleTap && call(onTripleTap); break
          case 4: onQuadrupleTap && call(onQuadrupleTap); break
        }
      }

      const higherCallbackExists = (() => {
        switch (_tapState.taps.length) {
          case 1: return !!(onDoubleTap || onTripleTap || onQuadrupleTap)
          case 2: return !!(onTripleTap || onQuadrupleTap)
          case 3: return !!(onQuadrupleTap)
          default: return false
        }
      })()

      if (multipleTapCancelPreviousTap && higherCallbackExists) {
        _tapState.timeoutId = window.setTimeout(() => {
          const lastTap = _tapState.taps[_tapState.taps.length - 1]
          if (lastTap === currentTap) {
            resolve()
          }
        }, multipleTapMaxInterval * 1e3)
      }
      else {
        resolve()
      }
    }
    _isDown = false
    _downEvent = null
    _dragStart = false
  }

  const _onContextMenu = (event: any) => {
    onContextMenu?.(event)
  }

  const target = element as HTMLElement // Fooling typescript.
  target.addEventListener('pointerover', _onPointerOver, { capture, passive })
  target.addEventListener('pointerout', _onPointerOut, { capture, passive })
  target.addEventListener('pointerenter', _onPointerEnter, { capture, passive })
  target.addEventListener('pointerleave', _onPointerLeave, { capture, passive })
  target.addEventListener('pointerdown', _onPointerDown, { capture, passive })
  target.addEventListener('pointermove', _onPointerMove, { capture, passive })
  target.addEventListener('contextmenu', _onContextMenu, { capture, passive })
  
  const destroy = () => {
    target.removeEventListener('pointerover', _onPointerOver, { capture })
    target.removeEventListener('pointerout', _onPointerOut, { capture })
    target.removeEventListener('pointerenter', _onPointerEnter, { capture })
    target.removeEventListener('pointerleave', _onPointerLeave, { capture })
    target.removeEventListener('pointerdown', _onPointerDown, { capture })
    target.removeEventListener('pointermove', _onPointerMove, { capture })
    target.removeEventListener('contextmenu', _onContextMenu, { capture })
    window.removeEventListener('pointermove', _onPointerMoveOver, { capture })
    window.removeEventListener('pointermove', _onPointerMoveDown, { capture })
    window.removeEventListener('pointerup', onPointerUp, { capture })
    window.cancelAnimationFrame(_onDownFrameId)
    window.clearTimeout(_tapState.timeoutId)
  }

  return { destroy }
}
