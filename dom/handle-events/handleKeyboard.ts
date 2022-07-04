
type Code = 
| 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight'
| 'Space' 
| 'Escape' | 'Enter'
| 'Meta' | 'Control' | 'Shift'
| 'MetaLeft' | 'ControlLeft' | 'ShiftLeft'
| 'MetaRight' | 'ControlRight' | 'ShiftRight'
| 'LetterA' | 'LetterB' | 'LetterC' | 'LetterD' | 'LetterE' | 'LetterF' | 'LetterG' | 'LetterH' | 'LetterI' | 'LetterJ' | 'LetterK' | 'LetterL' | 'LetterM' | 'LetterN' | 'LetterO' | 'LetterP' | 'LetterQ' | 'LetterR' | 'LetterS' | 'LetterT' | 'LetterU' | 'LetterV' | 'LetterW' | 'LetterX' | 'LetterY' | 'LetterZ'
| 'KeyA' | 'KeyB' | 'KeyC' | 'KeyD' | 'KeyE' | 'KeyF' | 'KeyG' | 'KeyH' | 'KeyI' | 'KeyJ' | 'KeyK' | 'KeyL' | 'KeyM' | 'KeyN' | 'KeyO' | 'KeyP' | 'KeyQ' | 'KeyR' | 'KeyS' | 'KeyT' | 'KeyU' | 'KeyV' | 'KeyW' | 'KeyX' | 'KeyY' | 'KeyZ'

type Mask = '*' | Code | Code[] | RegExp

type Listener = [
  Mask,
  ((info: KeyboardInfo) => void) | null | undefined,
]

type Options = Partial<{
  element: HTMLElement
  onDown: Listener[]
}>

const testMask = (mask: Mask, str: string) => {
  if (mask === '*') {
    return true
  }
  if (mask instanceof RegExp) {
    return mask.test(str)
  }
  if (Array.isArray(mask)) {
    mask.includes(str as Code)
  }
  return mask === str
}

export interface KeyboardInfo {
  event: KeyboardEvent
}

export const handleKeyboard = ({
  element = document.body,
  onDown,
}: Options) => {

  const onKeyPress = (event: KeyboardEvent): void => {
    const { code, key } = event
    const info = { event }
    if (onDown) {
      const letter = code.startsWith('Key') ? `Letter${key.toUpperCase()}` : ''
      for (const [mask, callback] of onDown) {
        const match = (
          testMask(mask, code) || 
          testMask(mask, key) || 
          testMask(mask, letter)
        )
        if (match) {
          callback?.(info)
        }
      }
    }
  }

  element.addEventListener('keydown', onKeyPress)
  
  const destroy = () => {    
    element.removeEventListener('keydown', onKeyPress)
  }

  return { destroy }
}