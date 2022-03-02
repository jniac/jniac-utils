import React from 'react'

type DistanceInfo = { x: number, y: number, magnitude: number }

type PointerHandleOptions = {
  onDown?: (event: PointerEvent, downEvent: PointerEvent) => void
  onUp?: (event: PointerEvent, downEvent: PointerEvent) => void
  onMove?: (event: PointerEvent, downEvent: PointerEvent | null) => void
  onOver?: (event: PointerEvent) => void
  onOut?: (event: PointerEvent) => void
  onDrag?: (info: { distanceTotal: DistanceInfo, distanceDelta: DistanceInfo, event: PointerEvent, downEvent: PointerEvent }) => void
}

const getDistanceInfo = (A: PointerEvent, B: PointerEvent): DistanceInfo => {
  const x = B.x - A.x
  const y = B.y - A.y
  const magnitude = Math.sqrt(x * x + y * y)
  return { x, y, magnitude }
}

export const pointerHandle = (element: HTMLElement, options: PointerHandleOptions) => {

  const {
    onDown,
    onUp,
    onMove,
    onOver,
    onOut,
    onDrag,
  } = options

  let downEvent: PointerEvent | null = null
  let previousMoveEvent: PointerEvent | null = null

  const onPointerMove = (event: PointerEvent) => {
    onMove?.(event, downEvent)
    if (downEvent) {
      if (onDrag) {
        onDrag({
          distanceDelta: getDistanceInfo(event, previousMoveEvent!),
          distanceTotal: getDistanceInfo(event, downEvent),
          event,
          downEvent,
        })
      }
    }
    previousMoveEvent = event
  }
  const onPointerOver = (event: PointerEvent) => {
    onOver?.(event)
  }
  const onPointerOut = (event: PointerEvent) => {
    onOut?.(event)
  }
  const onPointerDown = (event: PointerEvent) => {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    downEvent = event
    previousMoveEvent = event
    onDown?.(event, downEvent)
  }
  const onPointerUp = (event: PointerEvent) => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    onUp?.(event, downEvent!)
    downEvent = null
  }
  element.addEventListener('pointerover', onPointerOver)
  element.addEventListener('pointerout', onPointerOut)
  element.addEventListener('pointerdown', onPointerDown)
  
  const destroy = () => {
    element.removeEventListener('pointerover', onPointerOver)
    element.removeEventListener('pointerout', onPointerOut)
    element.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointermove', onPointerMove)
  }

  return { destroy }
}

export function usePointerHandle(ref: React.RefObject<HTMLElement>, options: PointerHandleOptions) {

  React.useEffect(() => {

    const { destroy } = pointerHandle(ref.current!, options)
    return destroy

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}
