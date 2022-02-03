export const isObject = (x: any) => x !== null && typeof x === 'object'
export const isPlainObjectOrArray = (x: any) => isObject(x) && (x.constructor === Object || x.constructor === Array)
