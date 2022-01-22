
export const waitSeconds = (seconds = 1) => new Promise(resolve => setTimeout(resolve, seconds * 1e3))

/**
 * 
 * @param date 
 * @param offset 
 * @returns 
 */
export const getLocalISOString = (
  date = new Date(), 
  offset = date.getTimezoneOffset(),
) => {
  const offsetAbs = Math.abs(offset)
  const isoString = new Date(date.getTime() - offset * 60 * 1000).toISOString()
  const hh = String(Math.floor(offsetAbs / 60)).padStart(2, '0')
  const mm = String(offsetAbs % 60).padStart(2, '0')
  return `${isoString.slice(0, -1)}${offset > 0 ? '-' : '+'}${hh}:${mm}`
}
