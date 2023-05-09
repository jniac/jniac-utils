export const tokenize = (str: string): string[] => {
  const currentToken: string[] = []
  const tokens: string[] = []
  const previous = {
    capital: false,
    whitespace: false,
  }
  for (let i = 0, max = str.length; i < max; i++) {
    const char = str[i]
    const capital = /[A-Z]/.test(char)
    const whitespace = /\s/.test(char)
    const end = (capital && previous.capital === false)
      || (whitespace && previous.whitespace === false)
    if (end && currentToken.length > 0) {
      tokens.push(currentToken.join(''))
      currentToken.length = 0
    }
    if (whitespace === false) {
      currentToken.push(char)
    }
    previous.capital = capital
    previous.whitespace = whitespace
  }
  if (currentToken.length > 0) {
    tokens.push(currentToken.join(''))
    currentToken.length = 0
  }
  return tokens
}

export const pascalCase = (str: string) => {
  return tokenize(str).map(v => `${v[0].toUpperCase()}${v.substring(1)}`).join('')
}

export const constantCase = (str: string) => {
  return tokenize(str).map(v => v.toUpperCase()).join('_')
}
