import React from 'react'
import { IPoint, Point } from 'some-utils/geom'

type PointerHandleOptions = Partial<{
  onDown: (event: PointerEvent, downEvent: PointerEvent) => void
  onUp: (event: PointerEvent, downEvent: PointerEvent) => void
  onMove: (event: PointerEvent, downEvent: PointerEvent | null) => void
  onOver: (event: PointerEvent) => void
  onOut: (event: PointerEvent) => void
  onDrag: (info: { total: Point, delta: Point, moveEvent: PointerEvent, downEvent: PointerEvent }) => void
  dragDistanceThreshold: number
  dragDamping: number
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


export const pointerHandle = (element: HTMLElement, options: PointerHandleOptions) => {

  const {
    onDown,
    onUp,
    onMove,
    onOver,
    onOut,
    onDrag,
    dragDistanceThreshold = 10,
    dragDamping = .1,
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
      dragStart ||= dragHasStart(downEvent!, moveEvent!, dragDistanceThreshold)
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

export function usePointerHandle(ref: React.RefObject<HTMLElement>, options: PointerHandleOptions) {

  React.useEffect(() => {

    const { destroy } = pointerHandle(ref.current!, options)
    return destroy

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}
