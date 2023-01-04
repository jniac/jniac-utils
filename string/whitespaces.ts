
export const replaceLineLeadingSpaces = (str: string, pattern: string, { failSilently = false } = {}) => {
  const lines = str.split('\n').filter(line => /\S/.test(line))
  if (lines.length === 0) {
    return ''
  }
  const [leadingSpaces] = lines[0].match(/^\s+/)!
  for (let index = 0, max = lines.length; index < max; index++) {
    const line = lines[index]
    if (line.startsWith(leadingSpaces)) {
      lines[index] = line.substring(leadingSpaces.length)
    } else {
      if (failSilently === false) {
        throw new Error(`Invalid string! Line #${index} does not start with "${leadingSpaces}" (leading spaces).`)
      }
    }
  }
  return lines.join('\n')
}

export const removeLineLeadingSpaces = (str: string, { failSilently = false } = {}) => {
  return replaceLineLeadingSpaces(str, '', { failSilently })
}