
// eslint-disable-next-line no-useless-escape
const isEmailRe = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
export const isEmail = (str: string) => isEmailRe.test(str)

export const firstWord = (str: string) => str.match(/\b.*\b/)?.[0] ?? ''

export const firstLine = (str: string) => str.match(/.*\n/)?.[0] ?? ''
