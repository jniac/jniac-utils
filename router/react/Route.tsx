import React from 'react'
import * as Animation from 'utils/Animation'
import { Observable, ObservableBoolean, ObservableNumber } from 'utils/observables'
import { useComplexEffects, useForceUpdate } from 'utils/react'
import { location } from '../location'

export type PathMask = 
  | string
  | RegExp
  | ((path: string) => boolean)
  | PathMask[]

export const comparePath: (path: string, mask: PathMask, exact: boolean) => boolean = (
  path, mask, exact,
) => {
  if (Array.isArray(mask)) {
    return mask.some(submask => comparePath(path, submask, exact))
  }
  if (typeof mask === 'function') {
    return mask(path)
  }
  if (mask instanceof RegExp) {
    return mask.test(path)
  }
  if (mask === '*') {
    return true
  }
  return (exact 
    ? path === mask
    : path.startsWith(mask)
  )
}

export type RouteStatus = 'entering' | 'leaving' | 'visible' | 'invisible'

/**
 * RouteState gives the opportunity of changing transition duration via React.Context
 */
interface RouteState {
  transitionDuration: number
  status: Observable<RouteStatus>
  active: ObservableBoolean
  alpha: ObservableNumber
}

export const RouteStateContext = React.createContext<RouteState>(null!)

export interface RouteProps {
  path: PathMask
  excludePath?: PathMask
  exact?: boolean
  transitionDuration?: number
}

export const Route: React.FC<RouteProps> = ({
  path,
  excludePath,
  exact = false,
  transitionDuration = 0,
  children,
}) => {

  const innerState = React.useMemo(() => ({
    visible: new Observable<boolean>(false),
    mounted: new Observable<boolean>(false),
  }), [])

  const state: RouteState = React.useMemo<RouteState>(() => ({
    transitionDuration,
    status: new Observable<RouteStatus>('invisible'),
    active: new ObservableBoolean(false),
    alpha: new ObservableNumber(1),
  // NOTE: be prudent with this
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  const forceUpdate = useForceUpdate()

  useComplexEffects(function* () {
    
    const isVisible = (pathname: string) => {
      const exclude = excludePath && comparePath(pathname, excludePath, exact)
      const visible = !exclude && comparePath(pathname, path, exact)
      return visible
    }

    // link the "status" and the inner "mounted" values 
    yield state.status.onChange(value => innerState.mounted.setValue(value !== 'invisible'))
    yield state.status.onChange(value => state.active.setValue(value === 'visible' || value === 'entering'))
    
    yield innerState.mounted.onChange(forceUpdate)
    yield innerState.visible.onChange(value => {
      if (transitionDuration === 0) {
        if (value) {
          state.status.setValue('visible')
        } else {
          state.status.setValue('invisible')
        }
      } else {
        if (value) {
          state.status.setValue('entering')
          Animation.tween(state.alpha, transitionDuration, {
            from: { value: 0 },
            to: { value: 1 },
            ease: 'out3',
            onComplete: () => state.status.setValue('visible'),
          })
        } else {
          state.status.setValue('leaving')
          Animation.tween(state.alpha, transitionDuration, {
            from: { value: 1 },
            to: { value: 0 },
            ease: 'out3',
            onComplete: () => state.status.setValue('invisible'),
          })
        }
      }
    })

    yield location.pathname.onChange(value => {
      innerState.visible.setValue(isVisible(value))
    }, { execute: true })

  }, [path, excludePath])

  if (innerState.mounted.value === false) {
    return null
  }

  return (
    <RouteStateContext.Provider value={{ ...state }}>
      {children}
    </RouteStateContext.Provider>
  )
}
