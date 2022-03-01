import React from 'react'

type PointerHandleOptions = {
  onDown?: (event: PointerEvent, downEvent: PointerEvent) => void
  onUp?: (event: PointerEvent, downEvent: PointerEvent) => void
  onMove?: (event: PointerEvent, downEvent: PointerEvent | null) => void
  onOver?: (event: PointerEvent) => void
  onOut?: (event: PointerEvent) => void
  onDrag?: (info: { dx: number, dy: number, distance: number, event: PointerEvent, downEvent: PointerEvent }) => void
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

  const onPointerMove = (event: PointerEvent) => {
    onMove?.(event, downEvent)
    if (downEvent) {
      if (onDrag) {
        const dx = event.x - downEvent.x
        const dy = event.y - downEvent.y
        onDrag({
          dx, 
          dy,
          distance: Math.sqrt(dx * dx + dy * dy),
          event,
          downEvent,
        })
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
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    downEvent = event
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
