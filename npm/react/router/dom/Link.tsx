import React from 'react'
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
  const { go } = React.useContext(RouterContext)
  const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    go(to)
  }
  return (
    <a {...props} ref={ref} href={to} onClick={onClick}>
      {children}
    </a>
  )
})
