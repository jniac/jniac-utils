import React from 'react'
import { setUrl } from '../location'
import { RouterContext } from '../react/Router'

export const Link = React.forwardRef<HTMLAnchorElement, {
  to: string
} & React.HTMLAttributes<HTMLAnchorElement>>(({
  to, 
  children, 
  ...props
}, ref) => {
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
    <a {...props} ref={ref} href={to} onClick={onClick}>
      {children}
    </a>
  )
})
