import React from 'react'
import { getPathname } from '../../../router'

export const RouterContext = React.createContext({
  baseUrl: '',
  getPathname: () => '' as string,
})

export const Router: React.FC<{
  baseUrl?: string
  children?: React.ReactNode
}> = ({
  baseUrl = '',
  children,
}) => {

  const context = {
    baseUrl,
    getPathname: () => {
      return getPathname().replace(baseUrl, '')
    },
  }

  return (
    <RouterContext.Provider value={context}>
      {children}
    </RouterContext.Provider>
  )
}
