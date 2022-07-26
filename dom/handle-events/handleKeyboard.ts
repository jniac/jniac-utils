
type Code =
  | 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight'
  | 'Space'
  | 'Escape' | 'Enter'
  | 'Meta' | 'Control' | 'Shift'
  | 'MetaLeft' | 'ControlLeft' | 'ShiftLeft'
  | 'MetaRight' | 'ControlRight' | 'ShiftRight'
  | 'LetterA' | 'LetterB' | 'LetterC' | 'LetterD' | 'LetterE' | 'LetterF' | 'LetterG' | 'LetterH' | 'LetterI' | 'LetterJ' | 'LetterK' | 'LetterL' | 'LetterM' | 'LetterN' | 'LetterO' | 'LetterP' | 'LetterQ' | 'LetterR' | 'LetterS' | 'LetterT' | 'LetterU' | 'LetterV' | 'LetterW' | 'LetterX' | 'LetterY' | 'LetterZ'
  | 'KeyA' | 'KeyB' | 'KeyC' | 'KeyD' | 'KeyE' | 'KeyF' | 'KeyG' | 'KeyH' | 'KeyI' | 'KeyJ' | 'KeyK' | 'KeyL' | 'KeyM' | 'KeyN' | 'KeyO' | 'KeyP' | 'KeyQ' | 'KeyR' | 'KeyS' | 'KeyT' | 'KeyU' | 'KeyV' | 'KeyW' | 'KeyX' | 'KeyY' | 'KeyZ'

type ListenerMask = '*' | Code | Code[] | RegExp
type ListenerCallback = ((info: KeyboardInfo) => void) | null | undefined

type ListenerOptions = Partial<{
  priority: number
}>

type ShortListener = [
  ListenerMask,
  ListenerCallback,
]
type FullListener = [
  ListenerMask,
  ListenerOptions,
  ListenerCallback,
]
type Listener = ShortListener | FullListener
const isFullListener = (listener: Listener): listener is FullListener => listener.length === 3
const toFullListener = (listener: Listener): FullListener => {
  if (isFullListener(listener)) {
    const [mask, options, callback] = listener
    return [mask, options, callback]
  } else {
    const [mask, callback] = listener
    return [mask, {}, callback]
  }
}

type Options = Partial<{
  element: HTMLElement
  onDown: Listener[]
  onUp: Listener[]
}>

const testMask = (mask: ListenerMask, str: string) => {
  if (mask === '*') {
    return true
  }
  if (mask instanceof RegExp) {
    return mask.test(str)
  }
  if (Array.isArray(mask)) {
    return mask.includes(str as Code)
  }
  return mask === str
}

export interface KeyboardInfo {
  event: KeyboardEvent
  capture: () => void
}


type GlobalListener = {
  id: number
  element: HTMLElement
  listeners: Listener[]
}
let globalListenerCount = 0
const downGlobalListeners: GlobalListener[] = []
const upGlobalListeners: GlobalListener[] = []

document.documentElement.addEventListener('keydown', event => {
  const { code, key } = event
  let canceled = false
  const capture = () => canceled = true
  const info = { event, capture }
  const letter = code.startsWith('Key') ? `Letter${key.toUpperCase()}` : ''
  const callbacks: { callback: ListenerCallback, priority: number }[] = []

  for (const { element, listeners } of downGlobalListeners) {
    if (element.contains(event.target as Node) === false) {
      continue
    }

    for (const listener of listeners) {
      const [mask, { priority = 0 }, callback] = toFullListener(listener)
      const match = (
        testMask(mask, code) ||
        testMask(mask, key) ||
        testMask(mask, letter)
      )
      if (match) {
        callbacks.push({ callback, priority })
      }
    }
  }

  callbacks.sort((A, B) => B.priority - A.priority)

  for (const { callback } of callbacks) {
    callback?.(info)
    if (canceled) {
      break
    }
  }
})

export const handleKeyboard = ({
  element = document.body,
  onDown,
  onUp,
}: Options) => {

  const down = (() => {
    if (onDown) {
      const downGlobalListener: GlobalListener = {
        id: globalListenerCount++,
        element,
        listeners: onDown
      }
      downGlobalListeners.push(downGlobalListener)
      return downGlobalListener
    }
    return null
  })()

  const up = (() => {
    if (onUp) {
      const upGlobalListener: GlobalListener = {
        id: globalListenerCount++,
        element,
        listeners: onUp
      }
      upGlobalListeners.push(upGlobalListener)
      return upGlobalListener
    }
    return null
  })()

  const destroy = () => {
    if (down) {
      const index = downGlobalListeners.indexOf(down)
      downGlobalListeners.splice(index, 1)
    }
    if (up) {
      const index = upGlobalListeners.indexOf(up)
      upGlobalListeners.splice(index, 1)
    }
  }

  return { destroy }
}