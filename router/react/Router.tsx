import React from 'react'

export const RouterContext = React.createContext({
  baseUrl: ''
})

export const Router: React.FC<{
  baseUrl?: string
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
