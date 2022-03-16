
export const stringMax = (str: string, maxLength = 100, {
  pattern = '...',
} = {}) => {
  const { length } = str
  if (length < maxLength) {
    return str
  }
  const ending = `${pattern} (${length.toString(10)})`
  return str.slice(0, maxLength - ending.length) + ending
}

// eslint-disable-next-line no-useless-escape
const isEmailRe = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
export const isEmail = (str: string) => isEmailRe.test(str)
