import React from 'react'
import { Rectangle } from '../geom'
import { BoundsCallback, track, untrack } from '../dom/bounds'
import { computeBounds } from "../dom/utils"


export function useBounds(target: React.RefObject<HTMLElement>, callback: BoundsCallback, {
  alwaysRecalculate = false, // should recalculate on any render?
  usingBoundingClientRect = false,
} = {}) {
  React.useEffect(() => {
    const element = target.current
    const safeCallback: BoundsCallback = (b, e) => target.current && callback(b, e)

    if (element) {
      track(element, safeCallback, { usingBoundingClientRect })
      return () => {
        untrack(element, safeCallback)
      }
    }

    console.warn(`useBounds() is useless here, since the given ref is always null.`)
    // "callback" is not a reasonable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, alwaysRecalculate ? undefined : [target])
}

export function useWindowBounds(callback: BoundsCallback, {
  alwaysRecalculate = false, // should recalculate on any render?
} = {}) {
  React.useEffect(() => {
    const bounds = new Rectangle()
    const update = () => {
      bounds.set(window.innerWidth, window.innerHeight)
      callback(bounds, document.body)
    }
    update()
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
    }

    // "callback" is not a reasonable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, alwaysRecalculate ? undefined : [])
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

export function useParentBounds(target: React.RefObject<HTMLElement>, callback: BoundsCallback, {
  parentSelector = '*' as string | string[],
  includeSelf = false,
  alwaysRecalculate = false, // should recalculate on any render?
  usingBoundingClientRect = false,
} = {}) {

  React.useEffect(() => {
    const element = Array.isArray(parentSelector) 
      ? mapFirst(parentSelector, str => parentQuerySelector(target.current, str, { includeSelf }))
      : parentQuerySelector(target.current, parentSelector, { includeSelf })

    if (element) {
      track(element, callback, { usingBoundingClientRect })
      return () => {
        untrack(element, callback)
      }
    }

    console.warn(`useParentBounds() is useless here, since the given ref is always null.`)
    // "callback" is not a reasonable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, alwaysRecalculate ? undefined : [target])
}

type AnyTarget = 
  | React.RefObject<HTMLElement> 
  | HTMLElement 
  | Window 
  | string 

type ManyTarget = AnyTarget | AnyTarget[]

const resolveAnyTarget = (target: AnyTarget) => (
  target instanceof Window ? target :
  target instanceof HTMLElement ? target :
  typeof target === 'string' ? document.querySelector(target) as HTMLElement :
  target.current
)

const resolveManyTarget = (target: ManyTarget) => (
  Array.isArray(target) 
    ? mapFirst(target, item => resolveAnyTarget(item)) ?? null
    : resolveAnyTarget(target)
)

export function useAnyBounds(target: ManyTarget, callback: BoundsCallback, {
  alwaysRecalculate = false, // should recalculate on any render?
  usingBoundingClientRect = false,
} = {}) {

  React.useEffect(() => {

    const element = resolveManyTarget(target)

    if (element) {
      track(element, callback, { usingBoundingClientRect })
      return () => {
        untrack(element, callback)
      }
    }
    
    // "fail" case
    console.warn(`useAnyBounds() is useless here, since the given ref is always resolved to null.`)

    // "callback" is not a reasonable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, alwaysRecalculate ? undefined : [target])
}

const resolveBounds = (element: HTMLElement | Window, receiver: Rectangle = new Rectangle(), usingBoundingClientRect = false) => {
  if (element instanceof Window) {
    return receiver.set(0, 0, window.innerWidth, window.innerHeight)
  }

  return (usingBoundingClientRect
    ? receiver.copy(element.getBoundingClientRect())
    : computeBounds(element, receiver))
}

export function useIntersectionBounds(
  target1: ManyTarget,
  target2: ManyTarget,
  callback: (intersection: Rectangle, info: { 
    element1: HTMLElement | Window,
    element2: HTMLElement | Window,
    bounds1: Rectangle,
    bounds2: Rectangle,
    areaRatio1: number,
    areaRatio2: number,
  }) => void,
  {
    alwaysRecalculate = false, // should recalculate on any render?
    usingBoundingClientRect = true,
  } = {},
) {

  React.useEffect(() => {

    const element1 = resolveManyTarget(target1)
    const element2 = resolveManyTarget(target2)

    if (element1 && element2) {
      const bounds1 = new Rectangle()
      const bounds2 = new Rectangle()
      const intersection = new Rectangle()
      const intersectionOld = new Rectangle().setDegenerate()

      let id = -1
      const loop = () => {
        id = window.requestAnimationFrame(loop)
        resolveBounds(element1, bounds1, usingBoundingClientRect)
        resolveBounds(element2, bounds2, usingBoundingClientRect)
        Rectangle.intersection(bounds1, bounds2, intersection, { degenerate: false })
        if (intersection.equals(intersectionOld) === false) {
          const area = intersection.area()
          const areaRatio1 = area / bounds1.area()
          const areaRatio2 = area / bounds2.area()
          callback(intersection, { element1, element2, bounds1, bounds2, areaRatio1, areaRatio2 })
          intersectionOld.copy(intersection)
        }
      }
      loop()

      return () => {
        window.cancelAnimationFrame(id)
      }
    }

    // "fail" case
    console.warn(`useAnyBounds() is useless here, since at least one of the two targets resolves to null`)

    // "callback" is not a reasonable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, alwaysRecalculate ? undefined : [target1, target2])
}
