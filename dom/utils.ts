import { Rectangle } from '../geom'

/**
 * Compute the bounds of an HTMLElement. 
 * 
 * This IS NOT the same thing than `element.getBoundingClientRect()`, since
 * here transformation (style.transform) is deliberately ignored.
 */
export const computeBounds = (element: HTMLElement, receiver: Rectangle = new Rectangle()) => {
  let width = element.clientWidth, height = element.clientHeight

  if (!element) {
    return receiver.setDegenerate()
  }

  let x = 0, y = 0
  // loop with parent
  while (element.offsetParent) {
    x += element.offsetLeft + element.clientLeft - element.offsetParent.scrollLeft
    y += element.offsetTop + element.clientTop - element.offsetParent.scrollTop
    element = element.offsetParent as HTMLElement
  }
  // one last step
  x += element.offsetLeft + element.clientLeft
  y += element.offsetTop + element.clientTop

  return receiver.setDimensions(x, y, width, height)
}
