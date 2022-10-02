import { Point } from '../../../geom'
import { DragOptions, handleDrag, isDragListening } from './drag'
import { handlePinch, isPinchListening, PinchOptions } from './pinch'
import { handlePointerWheel, isWheelListening, WheelOptions } from './wheel'

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
}>

const isTap = (downEvent: PointerEvent, upEvent: PointerEvent, maxDuration: number, maxDistance: number) => {
  const x = upEvent.x - downEvent.x
  const y = upEvent.y - downEvent.y
  return (
    (x * x) + (y * y) < maxDistance * maxDistance &&
    upEvent.timeStamp - downEvent.timeStamp < maxDuration * 1e3
  )
}

export const handlePointer = (element: HTMLElement | Window, options: Options & DragOptions & PinchOptions & WheelOptions) => {

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
  } = options

  let _downEvent: PointerEvent | null = null
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
    }
  }

  const _onPointerMoveOver = (event: PointerEvent) => {
    onMoveOver?.(event)
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
    _downEvent = event
    _movePoint.copy(event)
    _previousMovePoint.copy(event)

    window.addEventListener('pointermove', _onPointerMoveDown, { capture, passive })
    window.addEventListener('pointerup', _onPointerUp, { capture, passive })

    onDown?.(event, _downEvent)
  }

  const _onPointerMove = (event: PointerEvent) => {
    onMove?.(event)
  }

  const _onPointerUp = (event: PointerEvent) => {
    window.removeEventListener('pointermove', _onPointerMoveDown, { capture })
    window.removeEventListener('pointerup', _onPointerUp, { capture })
    onUp?.(event, _downEvent!)

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
    _downEvent = null
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

  const dragListener = isDragListening(options) ? handleDrag(element, options) : null
  const pinchListener = isPinchListening(options) ? handlePinch(element, options) : null
  const wheelListener = isWheelListening(options) ? handlePointerWheel(element, options) : null

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
    window.removeEventListener('pointerup', _onPointerUp, { capture })
    window.clearTimeout(_tapState.timeoutId)

    dragListener?.destroy()
    pinchListener?.destroy()
    wheelListener?.destroy()
  }

  return { destroy }
}
