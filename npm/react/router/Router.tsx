import React from 'react'
import { getPathname, setUrl } from '../../../router'

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
  go: (to: string) => {},

  /** 
   * Kind of alias of "go()": return the binded "go" function:
   * ```
   * const myLink = link('/foo')
   * // is equivalent to
   * const myLink = () => go('/foo')
   * ```
   */
  link: (to: string) => () => {},
})

const cleanPathname = (value: string) => {
  return value.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
}

type Props = {
  // NOTE: Why RegExp here???
  baseUrl?: string | RegExp
  pathnameTransform?: null | ((pathname: string) => string),
  children?: React.ReactNode
}

export const Router = ({
  baseUrl = '',
  pathnameTransform = null,
  children,
}: Props) => {

  // Ensure baseUrl starts with "/"
  if (typeof baseUrl === 'string') {
    if (baseUrl.length > 0) {
      if (baseUrl.startsWith('/') === false) {
        baseUrl = '/' + baseUrl
      }
    }
  }

  const routerGetPathname = () => {
    const pathname = cleanPathname(getPathname().replace(baseUrl, ''))
    return pathnameTransform ? cleanPathname(pathnameTransform(pathname)) || '/' : pathname
  }
  const go = (to: string, { reload = false } = {}) => {
    if (baseUrl && to.startsWith('/')) {
      // "baseUrl" injection.
      to = baseUrl + to
    }  
    if (reload) {
      const url = (window.location.origin + to.substring(1))
      window.open(url, '_self')
    } else {
      setUrl(to)
    }
  }
  const link = (to: string, { reload = false } = {}) => () => go(to, { reload })
  const context = {
    baseUrl,
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
