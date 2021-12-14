import React from 'react'
import * as Animation from '../../Animation'
import { Observable, ObservableBoolean, ObservableNumber } from '../../observables'
import { useComplexEffects, useForceUpdate } from '../../react'
import { location } from '../location'

export type StringMask = 
  | string
  | RegExp
  | ((path: string) => boolean)
  | StringMask[]

export const compareString: (str: string, mask: StringMask, exact?: boolean) => boolean = (
  str, mask, exact = true,
) => {
  if (Array.isArray(mask)) {
    return mask.some(submask => compareString(str, submask, exact))
  }
  if (typeof mask === 'function') {
    return mask(str)
  }
  if (mask instanceof RegExp) {
    return mask.test(str)
  }
  if (mask === '*' && str.length > 0) {
    return true
  }
  return (exact 
    ? str === mask
    : str.startsWith(mask)
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
  path: StringMask
  excludePath?: StringMask
  search?: StringMask
  hash?: StringMask
  exact?: boolean
  transitionDuration?: number
}

export const Route: React.FC<RouteProps> = ({
  path,
  excludePath,
  hash,
  search,
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

    const isVisible = () => {
      const exclude = excludePath && compareString(location.pathname.value, excludePath, exact)
      return (!exclude 
        && compareString(location.pathname.value, path, exact)
        && (search === undefined || compareString(location.search.value, search))
        && (hash === undefined || compareString(location.hash.value, hash))
      )
    }

    yield location.href.onChange(() => {
      innerState.visible.setValue(isVisible())
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
