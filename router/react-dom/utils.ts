
export const onFrame = (callback: () => void, { frameCount = Infinity } = {}) => {
  let id = -1, frame = 0
  const loop = () => {
    if (++frame < frameCount) {
      id = window.requestAnimationFrame(loop)
    }
    callback()
  }
  loop()
  const destroy = () => {
    window.cancelAnimationFrame(id)
  }
  return { destroy }
}

export const onFrameOrResize = (callback: () => void, { frameCount = 20 } = {}) => {
  let id = -1, frame = 0, scheduled = false
  const loop = () => {
    if (++frame < frameCount) {
      id = window.requestAnimationFrame(loop)
      scheduled = true
    } else {
      scheduled = false
    }
    callback()
  }
  const onResize = () => scheduled ? (frame = 0) : loop()
  loop()
  window.addEventListener('resize', onResize)
  const destroy = () => {
    window.removeEventListener('resize', onResize)
    window.cancelAnimationFrame(id)
  }
  return { destroy }
}


export const getScrollingParentElement = (element: HTMLElement | null) => {
  element = element?.parentElement ?? null
  while (element) {
    if (element.scrollHeight > element.clientHeight) {
      return element
    }
    element = element.parentElement
  }
  return document.scrollingElement ?? document.body
}

/**
 * Safari iOS proof utility. 
 * In Safari iOS, even if the parent scrolling element is the <html> tag, the 
 * value of "document.scrollingElement" remains the same whatever the size of 
 * the window could be. Eg: 
 *  - document.scrollingElement.clientHeight -> 664
 *  - window.innerHeight -> 745
 * Wait but why???
 */
export const getScrollingParentElementHeight = (element: HTMLElement | null) => {
  const parentElement = getScrollingParentElement(element)
  if (parentElement === document.firstElementChild || parentElement === document.body) {
    return window.innerHeight
  }
  return parentElement.clientHeight
}
