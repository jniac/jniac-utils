import React from 'react'
import { isClick } from '../../../../dom'
import { RouterContext } from '../Router'

export const Link = React.forwardRef<HTMLAnchorElement, {
  to: string
  reload?: boolean
  /** Should we prevent the navigation and let the callbacks do the job? Default is false. */
  preventNavigation?: boolean
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  onLink?: () => void
} & React.HTMLAttributes<HTMLAnchorElement>>(({
  to,
  reload = false,
  preventNavigation = false,
  onClick,
  onLink,
  children,
  ...props
}, ref) => {
  const { baseUrl, go } = React.useContext(RouterContext)
  const _onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isClick()) {
      event.preventDefault()
      go(to)
      onClick?.(event)
      onLink?.()
    }
  }
  return (
    <a {...props} ref={ref} href={`${baseUrl}${to}`} onPointerUp={_onClick}>
      {children}
    </a>
  )
})
