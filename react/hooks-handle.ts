import React from 'react'
import { IPoint, Point } from 'some-utils/geom'

type DistanceInfo = { x: number, y: number, magnitude: number }

type PointerHandleOptions = Partial<{
  onDown: (event: PointerEvent, downEvent: PointerEvent) => void
  onUp: (event: PointerEvent, downEvent: PointerEvent) => void
  onMove: (event: PointerEvent, downEvent: PointerEvent | null) => void
  onOver: (event: PointerEvent) => void
  onOut: (event: PointerEvent) => void
  onDrag: (info: { distanceTotal: DistanceInfo, distanceDelta: DistanceInfo, moveEvent: IPoint, downEvent: IPoint }) => void
  dragDistanceThreshold: number
  dragDamping: number
}>

const getDistanceInfo = (A: IPoint, B: IPoint): DistanceInfo => {
  const x = B.x - A.x
  const y = B.y - A.y
  const magnitude = Math.sqrt(x * x + y * y)
  return { x, y, magnitude }
}
const getDragInfo = (downEvent: IPoint, moveEvent: IPoint, previousMovePoint: IPoint) => {
  return {
    distanceDelta: getDistanceInfo(moveEvent, previousMovePoint),
    distanceTotal: getDistanceInfo(moveEvent, downEvent),
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
  let previousMovePoint = new Point()
  
  const onPointerMove = (event: PointerEvent) => {
    onMove?.(event, downEvent)
    moveEvent = event
  }

  let isDown = false
  let onDownFrameId = -1
  let dragStart = false
  const onDownFrame = () => {
    if (isDown) {
      onDownFrameId = window.requestAnimationFrame(onDownFrame)
      dragStart ||= dragHasStart(downEvent!, moveEvent!, dragDistanceThreshold)
      if (dragStart && onDrag) {
        onDrag(getDragInfo(downEvent!, moveEvent!, previousMovePoint!))
        previousMovePoint.x += (moveEvent!.x - previousMovePoint.x) * dragDamping
        previousMovePoint.y += (moveEvent!.y - previousMovePoint.y) * dragDamping
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
