import { Destroyable } from './types'

export type PressInfo = {
  target: HTMLElement
  clientX: number
  clientY: number
}

export type PressOptions = Partial<{
  /** Should we use capture phase? */
  capture: boolean
  /** Are passive listeners wanted? */
  passive: boolean
  /** Hook that allows to ignore some down event (cancelling at the same time all other events that may follow otherwise (tap, drag etc.)). */
  onDownIgnore: (event: PointerEvent) => boolean

  onPressStart: (info: PressInfo) => void
  onPressStop: (info: PressInfo) => void
}>

export const isPressListening = (options: PressOptions) => {
  return !!(
    options.onPressStart
    ?? options.onPressStop
  )
}

export const handlePress =(element: HTMLElement | Window, options: PressOptions): Destroyable => {
  const {
    capture = false,
    passive = true,    
  } = options

  let downEvent: PointerEvent | null = null
  let info: PressInfo | null = null

  const onPointerDown = (event: PointerEvent): void => {
    if (options.onDownIgnore?.(event)) {
      return
    }

    downEvent = event
    info = {
      target: downEvent.target as HTMLElement,
      clientX: downEvent.clientX,
      clientY: downEvent.clientY,
    }
    options.onPressStart?.(info)
    window.addEventListener('pointerup', onPointerUp, { capture })
  }
  
  const onPointerUp = (event: PointerEvent): void => {
    options.onPressStop?.(info!)
    downEvent = null
    info = null
  }
  
  const target = element as HTMLElement // Fooling typescript.
  target.addEventListener('pointerdown', onPointerDown, { capture, passive })
  
  const destroy = () => {
    target.removeEventListener('pointerdown', onPointerDown, { capture })
    window.removeEventListener('pointerup', onPointerUp, { capture })
  }

  return { destroy }
}
