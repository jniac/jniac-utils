import { Rectangle } from '../geom'

export const computeLocalBounds = (element: HTMLElement, receiver = new Rectangle()) => {
  return receiver.setDimensions(
    element.offsetLeft + element.clientLeft,
    element.offsetTop + element.clientTop,
    element.clientWidth, 
    element.clientHeight,
  )
}

/**
 * Compute the bounds of an HTMLElement. 
 * 
 * This IS NOT the same thing than `element.getBoundingClientRect()`, since
 * here transformation (style.transform) is deliberately ignored.
 */
export const computeOffsetBounds = (element: HTMLElement, receiver: Rectangle = new Rectangle()) => {
  const width = element.clientWidth, height = element.clientHeight

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
  // on last step after the last step...
  x += -(document.scrollingElement?.scrollLeft ?? 0)
  y += -(document.scrollingElement?.scrollTop ?? 0)

  return receiver.setDimensions(x, y, width, height)
}



export const isParentOf = (parent: any, child: any, {
  includeSelf = false,
} = {}) => {
  if (!parent) {
    return false
  }
  if (includeSelf === false) {
    child = child.parentElement
  }
  while (child) {
    if (child === parent) {
      return true
    }
    child = child.parentElement
  }
  return false
}

/**
 * Same as `querySelector()`, but going up the tree.
 */
export const parentQuerySelector = (element: any, selector: string, {
  includeSelf = false,
} = {}) => {
  if (!element) {
    return null
  }
  if (includeSelf === false) {
    element = element.parentElement
  }
  while(element) {
    if ((element as HTMLElement).matches(selector)) {
      return element as HTMLElement
    }
    element = (element as HTMLElement).parentElement
  }
  return null
}
