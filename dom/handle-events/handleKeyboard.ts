
type Code = 
| 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight'
| 'LetterA' | 'LetterB' | 'LetterC' | 'LetterD' | 'LetterE' | 'LetterF' | 'LetterG' | 'LetterH' | 'LetterI' | 'LetterJ' | 'LetterK' | 'LetterL' | 'LetterM' | 'LetterN' | 'LetterO' | 'LetterP' | 'LetterQ' | 'LetterR' | 'LetterS' | 'LetterT' | 'LetterU' | 'LetterV' | 'LetterW' | 'LetterX' | 'LetterY' | 'LetterZ'

type Mask = '*' | Code | Code[] | RegExp

type Listener = [
  Mask,
  ((event: KeyboardEvent) => void) | null | undefined,
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

export const handleKeyboard = ({
  element = document.body,
  onDown,
}: Options) => {

  const onKeyPress = (event: KeyboardEvent): void => {
    const { code, key } = event
    console.log(key)
    if (onDown) {
      const letter = code.startsWith('Key') ? `Letter${key.toUpperCase()}` : ''
      for (const [mask, callback] of onDown) {
        const match = (
          testMask(mask, code) || 
          testMask(mask, key) || 
          testMask(mask, letter)
        )
        if (match) {
          callback?.(event)
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