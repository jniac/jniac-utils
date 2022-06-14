import React from 'react'
import { setPathname } from '../../../../router/location'
import { RouterContext } from '../Router'

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
      setPathname(`/${baseUrl}${to}`)
    } else {
      setPathname(to)
    }
  }
  return (
    <a {...props} ref={ref} href={to} onClick={onClick}>
      {children}
    </a>
  )
})
