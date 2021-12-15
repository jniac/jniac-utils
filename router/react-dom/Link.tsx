import React from 'react'
import { setUrl } from '../location'
import { RouterContext } from '../react/Router'

export const Link: React.FC<{
  to: string
} & React.HTMLAttributes<HTMLAnchorElement>> = ({
  to, 
  children, 
  ...props
}) => {
  const { baseUrl } = React.useContext(RouterContext)
  const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    if (baseUrl && to.startsWith('/')) {
      // baseUrl injection
      setUrl(`/${baseUrl}${to}`)
    } else {
      setUrl(to)
    }
  }
  return (
    <a {...props} href={to} onClick={onClick}>
      {children}
    </a>
  )
}
