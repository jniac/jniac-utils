import { Register } from '../collections'
import { Rectangle } from '../geom'
import { computeOffsetBounds, computeLocalBounds } from './utils'

type BoundsCallback<T extends HTMLElement = HTMLElement> = (bounds: Rectangle, element: T) => void
type BoundsType = 'local' | 'client' | 'offset'
interface BoundsOptions {
  boundsType?: BoundsType
}

const allCallbacks = new Register<HTMLElement, BoundsCallback>()
const allOptions = new Map<BoundsCallback, BoundsOptions>()
const allBounds = new Map<HTMLElement, { local: Rectangle, offset: Rectangle, client: Rectangle }>()
const onResizeEndCallbacks = new Set<() => void>()
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    // NOTE: `entry.contentRect` is ignored, since we are dealing with global left / top (window space)
    const element = entry.target as HTMLElement
    const { local, offset, client } = allBounds.get(element)!
    computeLocalBounds(element, local)
    computeOffsetBounds(element, offset)
    client.copy(element.getBoundingClientRect())
    const callbacks = allCallbacks.get(element)!
    for (const callback of callbacks) {
      const { boundsType } = allOptions.get(callback)!
      const bounds = boundsType === 'local' ? local : boundsType === 'client' ? client : offset
      callback(bounds, element)
    }
  }
  for (const callback of onResizeEndCallbacks) {
    callback()
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
const trackWindow = (callback: BoundsCallback) => {
  if (windowCallbacks.size === 0) {
    window.addEventListener('resize', windowOnResize)
  }
  windowCallbacks.add(callback)
  callback(windowBounds, document.body)
}
const untrackWindow = (callback: BoundsCallback) => {
  const success = windowCallbacks.delete(callback)
  if (success && windowCallbacks.size === 0) {
    window.addEventListener('resize', windowOnResize)
  }
}

const track = (
  element: HTMLElement | Window,
  callback: BoundsCallback,
  options: BoundsOptions = {},
) => {

  if (element instanceof Window) {
    trackWindow(callback)
    return () => untrackWindow(callback)
  }

  allCallbacks.add(element, callback)
  allOptions.set(callback, options)
  const current = allBounds.get(element)
  if (current === undefined) {
    resizeObserver.observe(element)
    allBounds.set(element, { local: new Rectangle(), offset: new Rectangle(), client: new Rectangle() })
  } else {
    // NOTE: (very important) callback should be called once here because the 
    // element is already tracked/observed and the resizeObserver wont be triggered.
    const { local, offset, client } = current
    const { boundsType } = options
    const bounds = boundsType === 'local' ? local : boundsType === 'client' ? client : offset
    callback(bounds, element)
  }

  const destroy = () => untrack(element, callback)
  return { destroy }
}

const untrack = (element: HTMLElement | Window, callback: BoundsCallback) => {

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

const onResizeEnd = (callback: () => void) => {
  onResizeEndCallbacks.add(callback)
  const destroy = () => {
    onResizeEndCallbacks.delete(callback)
  }
  return { destroy }
}

export type {
  BoundsCallback,
  BoundsType,
}

export {
  trackWindow,
  untrackWindow,
  track,
  untrack,
  onResizeEnd,
}

export {
  // using the common keyword "handle":
  track as handleBounds,
  Rectangle,
}
