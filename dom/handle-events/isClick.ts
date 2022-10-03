

let downEvent: PointerEvent | null = null
let upEvent: PointerEvent | null = null
let previousUpEvent: PointerEvent | null = null
let downCount = 0, upCount = 0, touchCount = 0

window.addEventListener('pointerdown', event => {
  if (downCount === upCount) {
    downEvent = event
    touchCount = 0
  }
  downCount++
}, { capture: true, passive: true })

window.addEventListener('pointerup', event => {
  upCount++
  touchCount++
  if (downCount === upCount) {
    previousUpEvent = upEvent
    upEvent = event
  }
}, { capture: true, passive: true })

/**
 * Returns true if the last user interaction was a "click".
 * 4 parameters help to determine if a combination of down & up events are a "click": 
 * - `maxTouchCount`: How many touches could make the user? Default: 1
 * - `maxDuration`: How much time may have passed between the down & the up event? Default: .3s.
 * - `maxDistance`: How many pixels between the down and the up point? Default: 5px
 * - `minInterval`: How much time may have passed since the previous "up" event? Default: .3s.
 * 
 * NOTE: Precedence is critical here. "isClick()" will likely be called on "up" events 
 * ("mouseup", "click", "pointerup", "touchend"). When called "isClick" must have 
 * its state ready. To do so, we use here "pointer" events because "pointer" events 
 * are triggered before "mouse" & "touch" events. The "capture" flag helps to execute
 * local listeners before any other ones.
 */
export const isClick = ({
  maxTouchCount = 1,
  maxDuration = .3,
  maxDistance = 5,
  minInterval = .3,
} = {}): boolean => {
  if (downEvent === null || upEvent === null) {
    return false
  }
  const tooMuchTouch = touchCount > maxTouchCount
  if (tooMuchTouch) {
    return false
  }
  const downDuration = upEvent.timeStamp - downEvent.timeStamp
  const durationTooLong = downDuration > maxDuration * 1e3
  if (durationTooLong) {
    return false
  }
  const sinceLastUp = upEvent.timeStamp - (previousUpEvent?.timeStamp ?? 0)
  const intervalTooShort = sinceLastUp < minInterval * 1e3
  if (intervalTooShort) {
    return false
  }
  const x = upEvent.clientX - downEvent.clientX
  const y = upEvent.clientY - downEvent.clientY
  const distanceSq = x * x + y * y
  const distanceTooBig = distanceSq > maxDistance * maxDistance
  if (distanceTooBig) {
    return false
  }
  return true
}
