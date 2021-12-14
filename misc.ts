
export const waitSeconds = (seconds = 1) => new Promise(resolve => setTimeout(resolve, seconds * 1e3))
