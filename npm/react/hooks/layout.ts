import React from 'react'
import { Rectangle } from '../../../geom'
import { BoundsCallback, BoundsType, onResizeEnd, track, untrack } from '../../../dom/bounds'
import { computeOffsetBounds, computeLocalBounds } from "../../../dom/utils"
import { useComplexEffects } from '..'

const resolveRef = <T>(target: 'createRef' | React.RefObject<T>) => {
  if (target === 'createRef') {
    // that condition should never change during program execution, so we can perform a test here
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return React.useRef<T>(null)
  }
  return target
}

export function useBounds<T extends HTMLElement = HTMLElement>(
  target: 'createRef' | React.RefObject<T>,
  callback: BoundsCallback, 
  {
    alwaysRecalculate = false, // should recalculate on any render?
    boundsType = 'offset' as BoundsType,
  } = {},
) {
  const ref = resolveRef(target)

  React.useEffect(() => {
    const element = ref.current
    const safeCallback: BoundsCallback = (b, e) => ref.current && callback(b, e)

    if (element) {
      track(element, safeCallback, { boundsType })
      return () => {
        untrack(element, safeCallback)
      }
    }

    console.warn(`useBounds() is useless here, since the given ref is always null.`)
    // "callback" is not a reasonable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, alwaysRecalculate ? undefined : [ref])

  return ref
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

export function useParentBounds<T extends HTMLElement = HTMLElement>(
  target: 'createRef' | React.RefObject<T>,
  callback: BoundsCallback, 
  {
    parentSelector = '*' as string | string[],
    includeSelf = false,
    alwaysRecalculate = false, // should recalculate on any render?
    boundsType = 'offset' as BoundsType,
  } = {},
) {

  const ref = resolveRef(target)

  React.useEffect(() => {
    const element = Array.isArray(parentSelector) 
      ? mapFirst(parentSelector, str => parentQuerySelector(ref.current, str, { includeSelf }))
      : parentQuerySelector(ref.current, parentSelector, { includeSelf })

    if (element) {
      track(element, callback, { boundsType })
      return () => {
        untrack(element, callback)
      }
    }

    console.warn(`useParentBounds() is useless here, since the given ref is always null.`)
    // "callback" is not a reasonable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, alwaysRecalculate ? undefined : [target])

  return ref
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
  boundsType = 'offset' as BoundsType,
} = {}) {

  React.useEffect(() => {

    const element = resolveManyTarget(target)

    if (element) {
      track(element, callback, { boundsType })
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

const resolveBounds = (element: HTMLElement | Window, receiver: Rectangle = new Rectangle(), boundsType: BoundsType = 'client') => {
  if (element instanceof Window) {
    return receiver.set(0, 0, window.innerWidth, window.innerHeight)
  }

  if (boundsType === 'client') {
    receiver.copy(element.getBoundingClientRect())
  }
  else if (boundsType === 'local') {
    computeLocalBounds(element, receiver)
  }
  else {
    computeOffsetBounds(element, receiver)
  }

  return receiver
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
    boundsType = 'client' as BoundsType,
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
        resolveBounds(element1, bounds1, boundsType)
        resolveBounds(element2, bounds2, boundsType)
        Rectangle.intersection(bounds1, bounds2, intersection)
        if (intersection.equals(intersectionOld) === false) {
          const area = intersection.area
          const areaRatio1 = area / bounds1.area
          const areaRatio2 = area / bounds2.area
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


/**
 * Will invoke the callback with the bounds of the children, on the first time
 * and as soon as a child has been resized.
 * @returns 
 */
export function useChildrenBounds <T extends HTMLElement = HTMLElement>(
  target: 'createRef' | React.RefObject<T>,
  selectors: string[], 
  callback: (allBounds: Rectangle[], elements: HTMLElement[]) => void,
  {
    alwaysRecalculate = false, // should recalculate on any render?
    boundsType = 'offset' as BoundsType,
    querySelectorAll = false,
  } = {},
) {
  
  const ref = resolveRef<T>(target)

  useComplexEffects(function* () {
    const parent = ref.current!
    const elements = querySelectorAll
      ? [parent, ...selectors.map(str => parent.querySelector(str) as HTMLElement)]
      : [parent, ...selectors.map(str => [...parent.querySelectorAll(str)] as HTMLElement[])].flat()

    const allBounds = elements.map(() => new Rectangle())
    let resizeCount = 0
    const incrementResizeCount = () => resizeCount++
    const resetResizeCount = () => resizeCount = 0
    for (const [index, element] of elements.entries()) {
      yield track(element, bounds => {
        allBounds[index].copy(bounds)
        incrementResizeCount()
      }, { boundsType })
    }
    
    yield onResizeEnd(() => {
      if (resizeCount > 0) {
        resetResizeCount()
        callback(allBounds, elements)
      }
    })
    
  }, alwaysRecalculate ? 'always-recalculate' : [target, selectors])

  return ref
}