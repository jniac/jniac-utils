import { Rectangle } from '../geom'
import { computeBounds } from './utils'

export type BoundsCallback = (bounds: Rectangle, element: HTMLElement) => void

/**
 * Associates one html element with one or several callbacks (set).
 */
class CallbackMap extends Map<HTMLElement, Set<BoundsCallback>> {

  add(element: HTMLElement, callback: BoundsCallback) {
    const create = (element: HTMLElement) => {
      const set = new Set<BoundsCallback>()
      this.set(element, set)
      return set
    }
    const set = this.get(element) ?? create(element)
    set.add(callback)
  }

  remove(element: HTMLElement, callback: BoundsCallback) {
    const set = this.get(element)
    if (set) {
      set.delete(callback)
      if (set.size === 0) {
        this.delete(element)
      }
      return set.size
    }
    return -1
  }
}

const allBounds = new Map<HTMLElement, Rectangle>()
const allCallbacks = new CallbackMap()
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const element = entry.target as HTMLElement
    const bounds = allBounds.get(element)!
    // NOTE: `entry.contentRect` is ignored, since we are using global left / top (window space)
    computeBounds(element, bounds)
    const callbacks = allCallbacks.get(element)!
    for (const callback of callbacks) {
      callback(bounds, element)
    }
  }
})

// NOTE: As it is convenient to consider the window as an HTMLElement (eg: observing
// bounds intersection between window and an element), `windowBounds` allow to track
// not only HTMLElement, but also 'window'.
const windowBounds = new Rectangle().set(window.innerWidth, window.innerHeight)
const windowCallbacks = new Set<BoundsCallback>()
const windowOnResize = () => {
  windowBounds.width = window.innerWidth
  windowBounds.height = window.innerHeight
}
export const trackWindow = (callback: BoundsCallback) => {
  if (windowCallbacks.size === 0) {
    window.addEventListener('resize', windowOnResize)
  }
  windowCallbacks.add(callback)
  callback(windowBounds, document.body)
}
export const untrackWindow = (callback: BoundsCallback) => {
  const success = windowCallbacks.delete(callback)
  if (success && windowCallbacks.size === 0) {
    window.addEventListener('resize', windowOnResize)
  }
}

export const track = (element: HTMLElement | Window, callback: BoundsCallback) => {

  if (element instanceof Window) {
    return trackWindow(callback)
  }

  allCallbacks.add(element, callback)
  const currentBounds = allBounds.get(element)
  if (currentBounds === undefined) {
    resizeObserver.observe(element)
    allBounds.set(element, new Rectangle())
  } else {
    // NOTE: (very important) callback should be called once here because the 
    // element is already tracked/observed and the resizeObserver wont be triggered.
    callback(currentBounds, element)
  }
}

export const untrack = (element: HTMLElement | Window, callback: BoundsCallback) => {
  
  if (element instanceof Window) {
    return untrackWindow(callback)
  }

  const remainingCallbacksCount = allCallbacks.remove(element, callback)
  if (remainingCallbacksCount === 0) {
    // NOTE: (very important) unobserve only if there are no more callbacks, since
    // a single element could be observed multiple times, we should not blind them all.
    resizeObserver.unobserve(element)
    allBounds.delete(element)
  }
}
