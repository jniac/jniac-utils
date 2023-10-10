
export type StringMask =
  | string
  | RegExp
  | ((path: string) => boolean)
  | StringMask[]

/**
 * ```
 * strStartsWith('foo', 'foo') // true
 * strStartsWith('foo/bar', 'foo') // true
 * strStartsWith('fooz', 'foo') // false
 * ```
 */
const strStartsWith = (str: string, mask: string): boolean => {
  if (str.startsWith(mask) === false) {
    return false
  }
  const char = str.charAt(mask.length)
  return char === '' || char === '/'
}
 
export const compareString: (str: string, mask: StringMask, exact?: boolean) => boolean = (
  str, mask, exact = true,
) => {

  if (Array.isArray(mask)) {
    return mask.some(submask => compareString(str, submask, exact))
  }

  if (typeof mask === 'function') {
    return mask(str)
  }

  if (mask instanceof RegExp) {
    return mask.test(str)
  }

  if (mask === '*' && str.length > 0) {
    return true
  }
  
  return (exact
    ? str === mask
    : strStartsWith(str, mask)
  )
}
