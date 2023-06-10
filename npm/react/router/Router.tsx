import React, { useMemo } from 'react'
import { location as windowLocation } from '../../../router'
import { digest } from '../../../math/prng/digest'
import { Location } from '../../../router'

let downPointerEvent: PointerEvent | null = null
window.addEventListener('pointerdown', event => downPointerEvent = event, { capture: true })

type RouterContextType = {
  /**
   * The baseURL. A RegExp may allow here to handle url with locales eg (domain.com/en/my-route, domain.com/fr/my-route)=,
   */
  baseUrl: string | RegExp
  /**
   * The location object
   */
  location: Location

  /** 
   * Can't remember the usage of this... But should be useful nuh? 
   */
  pathnameTransform: null | ((pathname: string) => string),

  /** 
   * Get... the pathname. 
   */
  getPathname: () => string,

  /** 
   * Change the current url, according to the "base url". 
   */
  go: (to: string) => void,

  /** 
   * Kind of alias of "go()": return the binded "go" function:
   * ```
   * const myLink = link('/foo')
   * // is equivalent to
   * const myLink = () => go('/foo')
   * ```
   */
  link: (to: string) => (() => void),  
}

export const RouterContext = React.createContext<RouterContextType>(null!)

const cleanPathname = (value: string) => {
  return value.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
}

/**
 * Ensure baseUrl starts with "/" (only if the string's length > 0)
 */
const ensureHeadingSlash = (value: string) => {
  if (value.length > 0) {
    if (value.startsWith('/') === false) {
      return `/${value}`
    } else {
      return value
    }
  } else {
    return ''
  }
}

type Props = Partial<{
  /**
   * RegExp is here to handle locales in url (cf RouterContextType)
   */
  baseUrl: string | RegExp
  pathnameTransform: null | ((pathname: string) => string),
  children: React.ReactNode
  redirections: Record<string, string | string[]>
  location: Location
}>

export const Router = (props: Props) => {
  const {
    baseUrl: baseUrlProp = '',
    pathnameTransform = null,
    children,
    redirections = {},
    location = windowLocation,
  } = props

  const baseUrl = typeof baseUrlProp === 'string' ? ensureHeadingSlash(baseUrlProp) : baseUrlProp

  const solveBaseUrl = () => {
    if (baseUrl instanceof RegExp) {
      const [realBaseUrl] = location.pathname.value.match(baseUrl)!
      return realBaseUrl
    } else {
      return baseUrl
    }
  }

  const applyRedirection: (pathname: string) => [pathname: string, redirected: boolean] = useMemo(() => {
    return pathname => {
      let redirected = false
      for (const [finalRoute, value] of Object.entries(redirections)) {
        const routes = Array.isArray(value) ? value : [value]
        for (const route of routes) {
          if (pathname === route) {
            redirected = true
            pathname = finalRoute
          }
        }
      }
      return [pathname, redirected]
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, digest(redirections)])

  const routerGetPathname = ({ useRedirection = true } = {}) => {
    let pathname = cleanPathname(location.pathname.value.replace(baseUrl, ''))
    pathname = pathnameTransform ? cleanPathname(pathnameTransform(pathname)) || '/' : pathname
    if (useRedirection) {
      [pathname] = applyRedirection(pathname)
    }
    return pathname
  }

  const computeUrl = (pathname: string, {
    keepHash = false,
    keepSearch = false,
    keepAll = false,
  } = {}) => {
    if (baseUrl && pathname.startsWith('/')) {
      // "baseUrl" injection.
      pathname = solveBaseUrl() + pathname
    }
    const url = new URL(pathname, window.location.origin)
    if (keepSearch || keepAll) {
      url.search = window.location.search
    }
    if (keepHash || keepAll) {
      url.hash = window.location.hash
    }
    return url.href
  }

  // Redirection: Rewrite the location.
  useMemo(() => {
    const rawPathname = routerGetPathname({ useRedirection: false })
    const redirectPathname = routerGetPathname({ useRedirection: true })
    if (rawPathname !== redirectPathname) {
      const url = computeUrl(redirectPathname, { keepAll: true })
      window.history.pushState(null, '', url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, digest(redirections)])

  const go = (to: string, { reload = false, newTab = downPointerEvent?.metaKey || downPointerEvent?.ctrlKey } = {}) => {
    const url = computeUrl(to)
    if (reload) {
      window.open(url, '_self')
    } else {
      if (newTab) {
        window.open(url, '_blank')
      } else {
        location.update(to)
      }
    }
  }
  const link = (to: string, { reload = false } = {}) => () => go(to, { reload })
  const context: RouterContextType = {
    get baseUrl() { return solveBaseUrl() },
    location,
    pathnameTransform,
    getPathname: routerGetPathname,
    go,
    link,
  }

  return (
    <RouterContext.Provider value={context}>
      {children}
    </RouterContext.Provider>
  )
}
