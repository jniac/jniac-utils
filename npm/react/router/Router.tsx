import React from 'react'
import { getPathname, setUrl } from '../../../router'

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
  const go = (to: string, { reload = false, newTab = downPointerEvent?.metaKey || downPointerEvent?.ctrlKey } = {}) => {
    if (baseUrl && to.startsWith('/')) {
      // "baseUrl" injection.
      to = baseUrl + to
    }
    const url = new URL(to, window.location.href).href
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
