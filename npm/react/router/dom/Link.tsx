import React from 'react'
import { setUrl } from '../../../../router/location'
import { RouterContext } from '../Router'

export const Link = React.forwardRef<HTMLAnchorElement, {
  to: string
  reload?: boolean
} & React.HTMLAttributes<HTMLAnchorElement>>(({
  to,
  reload = false,
  children, 
  ...props
}, ref) => {
  const { baseUrl } = React.useContext(RouterContext)
  const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    
    e.preventDefault()

    if (baseUrl && to.startsWith('/')) {
      // baseUrl injection
      const pathname = `/${baseUrl}${to}`
      if (reload) {
        const url = (window.location.origin + pathname.substring(1))
        window.open(url, '_self')
      }
      else {
        setUrl(pathname)
      }
    } 
    
    else {
      setUrl(to)
    }
  }
  return (
    <a {...props} ref={ref} href={to} onClick={onClick}>
      {children}
    </a>
  )
})
