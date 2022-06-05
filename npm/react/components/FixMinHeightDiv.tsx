import React from 'react'
import { useParentBounds } from '../hooks-layout'

// NOTE: Not very sure of that component pertinence.

export const FixMinHeightDiv = React.forwardRef<HTMLDivElement, {
  parentSelector: string | string[]
  debug?: boolean
} & React.HTMLAttributes<HTMLDivElement>>(({
  parentSelector,
  style = {},
  debug = false,
  ...props
}, outerRef) => {
  const divRef = React.useRef<HTMLDivElement>(null)

  useParentBounds(divRef, bounds => {
    if (divRef.current) {
      divRef.current.style.minHeight = `${bounds.height}px`
    }
    if (debug) {
      console.log(parentSelector, bounds)
    }
  }, {
    parentSelector,
  })

  React.useEffect(() => {
    if(outerRef) {
      if (typeof outerRef === 'function') {
        outerRef(divRef.current)
      } else {
        outerRef!.current = divRef.current
      }
    }
  })

  return (
    <div ref={divRef} {...props}/>
  )
})
