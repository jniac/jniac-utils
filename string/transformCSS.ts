
type Replacer = {
  selector: (pattern: string) => string
  style: (pattern: string) => string
  comment: (pattern: string) => string
}

/**
 * For simple usage only.
 * 
 * Transform a "CSS" string through 3 kinds of match:
 * - "selector" (useful for prefix / transform selectors)
 * - "style" (the group of properties attached to a selector)
 * - "comment" (css comments)
 * 
 * usage:
 * ```
 * const s = transformCSS(`
 * \/* a comment *\/
 * .foo[class*="bar"] {
 *   color: red;
 *   mask-image: url(lol);
 * }`, {
 *   comment: () => '',
 *   selector: s => `.qux ${s}`,
 *   style: s => {
 *     const lines = s.slice(1, -1).split(';').map(def => {
 *       if (def.trim().startsWith('mask')) {
 *         return def + `;\n  -webkit-${def.trim()}`
 *       }
 *       return def
 *     })
 *     return `{${lines.join(';')}}`  
 *   },
 * })
 * console.log(s.trim())
 * ```
 * will print:
 * ```txt
 * .qux .foo[class*="bar"] {
 *   color: red;
 *   mask-image: url(lol);
 *   -webkit-mask-image: url(lol);
 * }
 * ```
 */
export const transformCSS = (str: string, replacer: Replacer) => {
  let index = -1
  let lastEndIndex = 0
  let bracketIndex = -1
  let commentIndex = -1
  let selectorIndex = -1
  let transformedStr = ''

  const replace = (startIndex: number, endIndex: number, insert: string) => {
    transformedStr += str.slice(lastEndIndex, startIndex) + insert
    lastEndIndex = endIndex
  }

  const {
    comment: commentReplacer,
    selector: selectorReplacer,
    style: styleReplacer,
  } = replacer

  while (++index < str.length) {
    const char = str[index]
    const nextChar = str[index + 1]

    if (/\s/.test(char)) {
      continue
    }

    if (char === '{') {
      if (selectorIndex !== -1) {
        if (selectorReplacer) {
          const endIndex = index
          const match = str.slice(selectorIndex, endIndex)
          replace(selectorIndex, endIndex, selectorReplacer(match))
        }
        selectorIndex = -1
      }

      bracketIndex = index
      continue
    }

    if (char === '}') {
      if (styleReplacer) {
        const endIndex = index + 1
        const match = str.slice(bracketIndex, endIndex)
        replace(bracketIndex, endIndex, styleReplacer(match))
      }
      bracketIndex = -1
      continue
    }

    if (char === '/' && nextChar === '*') {
      commentIndex = index
      continue
    }

    if (char === '*' && nextChar === '/') {
      index++ // move forward
      if (commentReplacer) {
        const endIndex = index + 1
        const match = str.slice(commentIndex, endIndex)
        replace(commentIndex, endIndex, commentReplacer(match))
      }
      commentIndex = -1
      continue
    }

    if (bracketIndex === -1 && commentIndex === -1 && selectorIndex === -1) {
      selectorIndex = index
    }
  }

  transformedStr += str.slice(lastEndIndex)

  return transformedStr
}
