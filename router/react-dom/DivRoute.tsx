import React from 'react'
import { useComplexEffects, safeClassName } from '../../react'
import { Route, RouteProps, RouteStateContext } from '../react/Route'
import { getScrollingParentElement, getScrollingParentElementHeight, onFrameOrResize } from './utils'
import { manageOverlayScroll } from './manageOverlayScroll'
import './DivRoute.css'

interface DivProps {
  overlay?: boolean
  overlayBackgroundColor?: string
}
const Div: React.FC<DivProps & React.HTMLAttributes<HTMLDivElement>> = ({
  overlay,
  overlayBackgroundColor,
  children,

  className,
  ...props
}) => {
  
  const state = React.useContext(RouteStateContext)
  const divRef = React.useRef<HTMLDivElement>(null)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  useComplexEffects(function* () {

    // Adding status to the Route classlist.
    // This is important for things such as remove pointer events on "leaving" phase.
    yield state.status.onChange((value, { valueOld }) => {
      const div = divRef.current
      if (div) {
        div.classList.add(value)
        div.classList.remove(valueOld)
      }
    }, { execute: true })

    // Setting the opacity
    yield state.alpha.onChange(value => {
      const div = divRef.current
      if (div) {
        if (value < 1) {
          div.style.setProperty('opacity', value.toFixed(2))
        } else {
          div.style.removeProperty('opacity')
        }
      }
    })

    if (overlay) {
      if (overlayBackgroundColor) {
        divRef.current!.style.backgroundColor = overlayBackgroundColor
      }

      const wrapper = wrapperRef.current!
      const scrollingElement = getScrollingParentElement(wrapper)
      // Resize and place the wrapper according to the current scroll and window states.
      yield onFrameOrResize(() => {
        const y = scrollingElement.scrollTop
        wrapper.style.top = `${y}px`
        wrapper.style.height = `${getScrollingParentElementHeight(wrapper)}px`
      }, { frameCount: 600 })
      yield manageOverlayScroll(wrapper)
    }

  }, [overlay])

  return (
    <div ref={divRef} className={safeClassName('DivRoute', { overlay })}>
      <div ref={wrapperRef} className={safeClassName('Wrapper', className)} {...props}>
        {children}
      </div>
    </div>
  )
}

export const DivRoute: React.FC<RouteProps & DivProps & React.HTMLAttributes<HTMLDivElement>> = ({ 
  
  // RouteProps
  path, 
  excludePath,
  exact,
  transitionDuration,
  
  // DivProps + HTMLDivElement
  ...props
}) => (
  <Route {...{ path, excludePath, exact, transitionDuration }}>
    <Div {...props} />
  </Route>
)
