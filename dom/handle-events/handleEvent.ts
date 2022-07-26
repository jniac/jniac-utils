
type Key = keyof HTMLElementEventMap

type Options = Partial<{ 
  [key in Key]: (event: Event) => void
} & {
  passive: boolean
  capture: boolean
}>

export const handleEvent = (target: HTMLElement, options: Options) => {

  const {
    capture = false,
    passive = true,
  } = options

  for (const key in options) {
    target.addEventListener(key, (options as any)[key], { capture, passive })
  }

  const destroy = () => {
    for (const key in options) {
      target.removeEventListener(key, (options as any)[key], { capture })
    }
  }

  return { destroy }
}
