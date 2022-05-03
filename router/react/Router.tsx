import React from 'react'

export const RouterContext = React.createContext({
  baseUrl: ''
})

export const Router: React.FC<{
  baseUrl?: string
  children?: React.ReactNode
}> = ({
  baseUrl = '',
  children,
}) => {
  return (
    <RouterContext.Provider value={{ baseUrl }}>
      {children}
    </RouterContext.Provider>
  )
}
