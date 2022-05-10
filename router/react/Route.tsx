import React from 'react'
import * as Animation from '../../Animation'
import { Observable, ObservableBoolean, ObservableNumber } from '../../observables'
import { useComplexEffects, useForceUpdate } from '../../react'
import { location } from '../location'
import { RouterContext } from './Router'

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
  routeProps: RouteProps
}

export const RouteStateContext = React.createContext<RouteState>(null!)

export interface RouteProps {
  path: StringMask
  excludePath?: StringMask
  search?: StringMask
  hash?: StringMask
  exact?: boolean
  strict?: boolean
  transitionDuration?: number
  children?: React.ReactNode
}

export const Route: React.FC<RouteProps> = ({
  path,
  excludePath,
  hash,
  search,
  exact = false,
  strict = false, // should consider the last slash? otherwise `/foo/` and `/foo` are considered as a same vlaue. cf express "strict" property
  transitionDuration = 0,
  children,
}) => {

  const { baseUrl } = React.useContext(RouterContext)

  const innerState = React.useMemo(() => ({
    visible: new ObservableBoolean(false),
    mounted: new ObservableBoolean(false),
  }), [])

  const state: RouteState = React.useMemo<RouteState>(() => ({
    transitionDuration,
    status: new Observable<RouteStatus>('invisible'),
    active: new ObservableBoolean(false),
    alpha: new ObservableNumber(0),

    // exposing routeProps to any child, for debugging purpose essentially
    routeProps: { path, excludePath, search, hash, exact, transitionDuration }
  // NOTE: be prudent with this
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  const forceUpdate = useForceUpdate({ waitNextFrame: true })

  useComplexEffects(function* () {
    
    // link the "status" and the inner "mounted" values 
    yield state.status.onChange(value => innerState.mounted.setValue(value !== 'invisible'))
    yield state.status.onChange(value => state.active.setValue(value === 'visible' || value === 'entering'))
    
    yield innerState.mounted.onChange(forceUpdate)
    yield innerState.visible.onChange(value => {
      if (transitionDuration === 0) {
        if (value) {
          state.status.setValue('visible')
          state.alpha.setValue(1)
        } else {
          state.status.setValue('invisible')
          state.alpha.setValue(0)
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

    const baseUrlRe = new RegExp(baseUrl ? `^/${baseUrl}` : '') // remove baseUrl from the current pathname
    const getPathname = () => {
      let str = location.pathname.value.replace(baseUrlRe, '')
      str = strict ? str : str.replace(/\/$/, '')
      return str || '/' // pathname must at least contain '/'
    }
    const isVisible = () => {
      const pathname = getPathname()
      const exclude = excludePath && compareString(pathname, excludePath, exact)
      return (!exclude 
        && compareString(pathname, path, exact)
        && (search === undefined || compareString(location.search.value, search))
        && (hash === undefined || compareString(location.hash.value, hash))
      )
    }

    yield location.href.onChange(() => {
      innerState.visible.setValue(() => {
        const visible = isVisible()
        console.log(path, {visible})
        return visible
      })
    }, { execute: true })

  }, [path, excludePath])

  console.log(innerState.mounted.value)

  if (innerState.mounted.value === false) {
    return null
  }

  return (
    <RouteStateContext.Provider value={{ ...state }}>
      {children}
    </RouteStateContext.Provider>
  )
}
