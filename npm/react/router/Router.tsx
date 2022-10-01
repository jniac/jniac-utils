import React from 'react'
import { getPathname } from '../../../router'

export const RouterContext = React.createContext({
  baseUrl: '' as string | RegExp,
  pathnameTransform: null as null | ((pathname: string) => string),
  getPathname: () => '' as string,
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

  const context = {
    baseUrl,
    pathnameTransform,
    getPathname: () => {
      const pathname = cleanPathname(getPathname().replace(baseUrl, ''))
      return pathnameTransform ? cleanPathname(pathnameTransform(pathname)) || '/' : pathname
    },
  }

  return (
    <RouterContext.Provider value={context}>
      {children}
    </RouterContext.Provider>
  )
}
