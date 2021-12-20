import { Register } from '../collections'
import { Rectangle } from '../geom'
import { computeBounds } from './utils'

export type BoundsCallback = (bounds: Rectangle, element: HTMLElement) => void

interface BoundsOptions {
  usingBoundingClientRect: boolean
}

const allCallbacks = new Register<HTMLElement, BoundsCallback>()
const allOptions = new Map<BoundsCallback, BoundsOptions>()
const allBounds = new Map<HTMLElement, { offset: Rectangle, client: Rectangle }>()
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const element = entry.target as HTMLElement
    const { offset, client } = allBounds.get(element)!
    // NOTE: `entry.contentRect` is ignored, since we are dealing with global left / top (window space)
    computeBounds(element, offset)
    client.copy(element.getBoundingClientRect())
    const callbacks = allCallbacks.get(element)!
    for (const callback of callbacks) {
      const { usingBoundingClientRect } = allOptions.get(callback)!
      callback(usingBoundingClientRect ? client : offset, element)
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

export const track = (
  element: HTMLElement | Window, 
  callback: BoundsCallback, 
  options: BoundsOptions = { usingBoundingClientRect: false },
) => {

  if (element instanceof Window) {
    return trackWindow(callback)
  }

  allCallbacks.add(element, callback)
  allOptions.set(callback, options)
  const current = allBounds.get(element)
  if (current === undefined) {
    resizeObserver.observe(element)
    allBounds.set(element, { offset: new Rectangle(), client: new Rectangle() })
  } else {
    // NOTE: (very important) callback should be called once here because the 
    // element is already tracked/observed and the resizeObserver wont be triggered.
    const { usingBoundingClientRect } = options
    const { client, offset } = current
    callback(usingBoundingClientRect ? client : offset, element)
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
  allOptions.delete(callback)
}
