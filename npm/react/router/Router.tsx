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

export const Router: React.FC<{
  baseUrl?: string | RegExp
  pathnameTransform?: null | ((pathname: string) => string),
  children?: React.ReactNode
}> = ({
  baseUrl = '',
  pathnameTransform = null,
  children,
}) => {

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
