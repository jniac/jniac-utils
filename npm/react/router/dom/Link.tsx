import React from 'react'
import { isClick } from '../../../../dom'
import { RouterContext } from '../Router'

export const Link = React.forwardRef<HTMLAnchorElement, {
  to: string
  reload?: boolean
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
} & React.HTMLAttributes<HTMLAnchorElement>>(({
  to,
  reload = false,
  onClick,
  children,
  ...props
}, ref) => {
  const { go } = React.useContext(RouterContext)
  const _onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isClick()) {
      event.preventDefault()
      go(to)
      onClick?.(event)
    }
  }
  return (
    <a {...props} ref={ref} href={to} onClick={_onClick}>
      {children}
    </a>
  )
})
