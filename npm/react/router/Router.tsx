import React, { useMemo } from 'react'
import { getPathname, setUrl } from '../../../router'
import { digest } from '../../../math/prng/digest'

let downPointerEvent: PointerEvent | null = null
window.addEventListener('pointerdown', event => downPointerEvent = event, { capture: true })

export const RouterContext = React.createContext({
  /** 
   * The current base url. 
   */
  baseUrl: '' as string | RegExp,

  /** 
   * Can't remember the usage of this... But should be useful nuh? 
   */
  pathnameTransform: null as null | ((pathname: string) => string),

  /** 
   * Get... the pathname. 
   */
  getPathname: () => '' as string,

  /** 
   * Change the current url, according to the "base url". 
   */
  go: (to: string) => { },

  /** 
   * Kind of alias of "go()": return the binded "go" function:
   * ```
   * const myLink = link('/foo')
   * // is equivalent to
   * const myLink = () => go('/foo')
   * ```
   */
  link: (to: string) => () => { },
})

const cleanPathname = (value: string) => {
  return value.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
}

type Props = {
  // NOTE: Why RegExp here???
  baseUrl?: string | RegExp
  pathnameTransform?: null | ((pathname: string) => string),
  children?: React.ReactNode
  redirections?: Record<string, string | string[]>
}

export const Router = ({
  baseUrl = '',
  pathnameTransform = null,
  children,
  redirections = {},
}: Props) => {
  // Ensure baseUrl starts with "/"
  if (typeof baseUrl === 'string') {
    if (baseUrl.length > 0) {
      if (baseUrl.startsWith('/') === false) {
        baseUrl = '/' + baseUrl
      }
    }
  }

  const solveBaseUrl = () => {
    if (baseUrl instanceof RegExp) {
      const [realBaseUrl] = getPathname().match(baseUrl)!
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
    let pathname = cleanPathname(getPathname().replace(baseUrl, ''))
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
    const url = new URL(pathname, window.location.href)
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
        setUrl(to)
      }
    }
  }
  const link = (to: string, { reload = false } = {}) => () => go(to, { reload })
  const context = {
    get baseUrl() { return solveBaseUrl() },
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
