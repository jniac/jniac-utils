import cssColors from 'some-utils/color/css-color.json'
import { TwoWayMap } from 'some-utils/collections/TwoWayMap'

/**
 * Returns an array with text and color argument for the web console (chrome / firefox).
 * 
 * https://developer.mozilla.org/en-US/docs/Web/API/console#Usage
 */
export const getColorArray = (message: string) => {
  const opening = '{'.charCodeAt(0) // 123
  const ending = '}'.charCodeAt(0) // 125
  const space = ' '.charCodeAt(0) // 32
  const hexColorRe = /^#([0-9a-fA-F]{3})|([0-9a-fA-F]{6})\b/
  const cssColorRe = /^\w+\b/

  // try to get a pair of colors (source + hexadecimal value)
  const getColorPair = (substring: string) => {
    const hex = hexColorRe.exec(substring)
    if (hex) {
      const color = hex[0]
      return [color, color] as [string, string]
    }

    const css = cssColorRe.exec(substring)
    if (css) {
      const str = css[0].toLowerCase()
      if (str in cssColors) {
        return [str, cssColors[str as keyof typeof cssColors]] as [string, string]
      }
    }
  }

  // search for the ending index (a inner counter is necessary to allow nested bracket pair). 
  const getEndingIndex = (startIndex: number) => {
    let count = 1
    for (let i = startIndex, max = message.length; i < max; i++) {
      const char = message.charCodeAt(i)
      if (char === opening) {
        count++
      }
      if (char === ending) {
        count--
        if (count === 0) {
          return i
        }
      }
    }
    return -1
  }

  // color register
  const colors = new Map<number, string>()
  const addColor = (color: string) => {
    const index = colors.size
    colors.set(index, color)
    return index
  }

  // map of chars & colors
  const messageChars = [] as number[]
  const messageColors = [] as number[]

  let index = 0

  let testColorIndex = -1
  let testEndingIndex = -1
  let testColorMatch = ''
  const testChar = (char: number) => {
    if (char === opening) {
      const colorPair = getColorPair(message.substring(index + 1))
      if (colorPair) {
        const [match, color] = colorPair
        testColorMatch = match
        if (message.charCodeAt(index + testColorMatch.length + 1) !== space) {
          return false
        }
        testColorIndex = addColor(color)
        testEndingIndex = getEndingIndex(index + match.length)
        if (testEndingIndex === -1) {
          throw new Error(`invalid string: could not find ending bracket ("${message}")`)
        }
        return true
      }
    }
    return false
  }

  // The tricky part: recursive loop with outer index.
  const colorLoop = (endingIndex: number, colorIndex: number) => {
    for (; index < endingIndex; index++) {
      const char = message.charCodeAt(index)
      if (testChar(char)) {
        index += testColorMatch.length + 2
        colorLoop(testEndingIndex, testColorIndex)
      }
      else {
        messageChars.push(char)
        messageColors.push(colorIndex)
      }
    }
  }

  colorLoop(message.length, -1)

  // The maps are computed, now compute the chunks.
  const chunksColor = [] as string[]
  const chunksString = [] as string[]

  index = 0
  let max = messageChars.length
  let security = 1000
  while (index < max && --security) {
    let currentColor = messageColors[index]
    let currentIndex = index + 1
    while (currentIndex < max && messageColors[currentIndex] === currentColor) {
      currentIndex++
    }
    chunksColor.push(currentColor === -1 ? '' : colors.get(currentColor)!)
    chunksString.push(String.fromCharCode(...messageChars.slice(index, currentIndex)))
    index = currentIndex
  }
  
  return [chunksString.map(s => `%c${s}`).join(''), ...chunksColor.map(c => c ? `color: ${c}` : '')]
}

export const consoleColor = (message: string) => {
  console.log(...getColorArray(message))
}

let chalkConsoleInitialized = false
export const chalkConsoleInit = () => {
  if (!chalkConsoleInitialized) {
    chalkConsoleInitialized = true
    
    const original = console.log
    console.log = (...args: any[]) => {
      if (args.length === 1 && typeof args[0] === 'string') {
        original(...getColorArray(args[0]))
      }
      else {
        original(...args)
      }
    }
  }
}

