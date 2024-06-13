
type Key = keyof HTMLElementEventMap

type Options = Partial<{
  [key in Key]: (event: Event) => void
} & {
  passive: boolean
  capture: boolean
} & {
  // Allowing custom events: 
  [key: string]: (event: Event) => void
}>

export const handleEvent = (target: HTMLElement | Window, options: Options) => {

  const {
    capture = false,
    passive = true,
    ...rest
  } = options

  for (const key in rest) {
    target.addEventListener(key, (options as any)[key], { capture, passive })
  }

  const destroy = () => {
    for (const key in rest) {
      target.removeEventListener(key, (options as any)[key], { capture })
    }
  }

  return { destroy }
}
