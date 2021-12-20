import React from 'react'

type Callback = (event: PointerEvent) => void
type ClickCallback = (event: PointerEvent, downEvent: PointerEvent) => void
type UsePointerHandleOptions = {
  onDown?: ClickCallback
  onUp?: ClickCallback
  onMove?: ClickCallback
  onOver?: Callback
  onOut?: Callback
}
export function usePointerHandle(ref: React.RefObject<HTMLElement>, options: UsePointerHandleOptions) {

  React.useEffect(() => {
    const element = ref.current!
    const {
      onDown,
      onUp,
      onMove,
      onOver,
      onOut,
    } = options

    let downEvent: PointerEvent | null = null
  
    const onPointerMove = (event: PointerEvent) => {
      onMove?.(event, downEvent!)
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

    return destroy

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}
