import React from 'react'
import { setUrl } from '../location'

export const Link: React.FC<{
  to: string
} & React.HTMLAttributes<HTMLAnchorElement>> = ({
  to, 
  children, 
  ...props
}) => {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    setUrl(to)
  }
  return (
    <a {...props} href={to} onClick={onClick}>
      {children}
    </a>
  )
}
