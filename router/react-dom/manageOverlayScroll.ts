// This is tricky. 
// If the scroll is at any bounds (top or bottom) prevent scrolling, 
// otherwise let it scroll over beethoven. 
// Inspired by https://stackoverflow.com/a/41601290/4696005
// One difference nonetheless, not the least: preventing occurs only if it was 
// decided at the very first frame, since it is not authorized to stop scroll 
// after it begins.
export const manageOverlayScroll = (element: HTMLElement) => {
  const touch = {
    startClientY: 0, 
    count: 0, 
    shouldPrevent: false,
  }

  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      touch.startClientY = event.touches[0].clientY
      touch.count = 0
    }
  }

  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      const dy = event.touches[0].clientY - touch.startClientY

      if (touch.count === 0) {
        if (dy > 0) {
          touch.shouldPrevent = element.scrollTop === 0
        } else {
          touch.shouldPrevent = element.scrollTop === element.scrollHeight - element.clientHeight
        }
      }

      if (touch.shouldPrevent) {
        event.preventDefault()
      }

      touch.count++
    }
  }

  const onWheel = (event: WheelEvent) => {
    if (event.deltaY < 0) {
      if (element.scrollTop === 0) {
        event.preventDefault()
      }
    } else {
      if (element.scrollTop === element.scrollHeight - element.clientHeight) {
        event.preventDefault()
      }
    }
  }
  
  element.addEventListener('touchstart', onTouchStart)
  element.addEventListener('touchmove', onTouchMove)
  element.addEventListener('wheel', onWheel)
  
  const destroy = () => {
    element.removeEventListener('touchstart', onTouchStart)
    element.removeEventListener('touchmove', onTouchMove)
    element.removeEventListener('wheel', onWheel)
  }

  return { destroy }
}
