import React from 'react'
import { Rectangle } from '../geom'

type BoundsCallback = (bounds: Rectangle, element: HTMLElement) => void

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
    const callbacks = allCallbacks.get(element)!
    const { width, height } = entry.contentRect
    const x = element.offsetLeft
    const y = element.offsetTop
    bounds.set({ x, y, width, height })
    for (const callback of callbacks) {
      callback(bounds, element)
    }
  }
})
const track = (element: HTMLElement, callback: BoundsCallback) => {
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
const untrack = (element: HTMLElement, callback: BoundsCallback) => {
  const remainingCallbacksCount = allCallbacks.remove(element, callback)
  if (remainingCallbacksCount === 0) {
    // NOTE: (very important) unobserve only if there are no more callbacks, since
    // a single element could be observed multiple times, we should not blind them all.
    resizeObserver.unobserve(element)
    allBounds.delete(element)
  }
}

export const useBounds = (target: React.RefObject<HTMLElement>, callback: BoundsCallback) => {
  React.useEffect(() => {
    const element = target.current

    if (element) {
      track(element, callback)
      return () => {
        untrack(element, callback)
      }
    }

    console.warn(`useBounds() is useless here, since the given ref is always null.`)
    // "callback" is not a reasonable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
}

const parentQuerySelector = (element: HTMLElement | null | undefined, parentSelector: string, {
  includeSelf = false,
} = {}) => {
  if (includeSelf === false) {
    element = element?.parentElement
  }

  while (element) {
    if (element.matches(parentSelector)) {
      return element
    }
    element = element.parentElement
  }
  
  return null
}

/**
 * Returns the first mapped item that is not "falsy" (null or undefined)
 */
 const mapFirst = <T, U>(items: T[], map: (item: T) => U) => {
  for (const item of items) {
    const value = map(item)
    if (value !== null && value !== undefined) {
      return value
    }
  }
}

export const useParentBounds = (target: React.RefObject<HTMLElement>, callback: BoundsCallback, {
  parentSelector = '*' as string | string[],
  includeSelf = false,
} = {}) => {

  React.useEffect(() => {
    const element = Array.isArray(parentSelector) 
      ? mapFirst(parentSelector, str => parentQuerySelector(target.current, str, { includeSelf }))
      : parentQuerySelector(target.current, parentSelector, { includeSelf })

    if (element) {
      track(element, callback)
      return () => {
        untrack(element, callback)
      }
    }

    console.warn(`useParentBounds() is useless here, since the given ref is always null.`)
    // "callback" is not a reasonable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
}

export const useAnyBounds = (target: React.RefObject<HTMLElement> | HTMLElement | string | string[], callback: BoundsCallback) => {

  React.useEffect(() => {
    const element = (
      typeof target === 'string' ? document.querySelector(target) as HTMLElement : 
      Array.isArray(target) ? mapFirst(target, str => document.querySelector(str) as HTMLElement) :
      target instanceof HTMLElement ? target : 
      target.current
    )

    if (element) {
      track(element, callback)
      return () => {
        untrack(element, callback)
      }
    }
  
    console.warn(`useAnyBounds() is useless here, since the given ref is always null.`)
    // "callback" is not a reasonable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
}
