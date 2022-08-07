import React from 'react'
import { inverseLerp, inout, in4 } from '../../../math'
import { SwitchChildProps, Switch, Item, solveItem } from './Switch'
import './DivSwitch.css'

export const DivSwitch: React.FC<{
  index?: number
  items?: Item[]
  transitionDuration?: number
  debugDisplayAll?: boolean
} & React.HTMLAttributes<HTMLDivElement>> = ({
  index = 0, 
  items = [],
  transitionDuration = .8,
  debugDisplayAll = false,
  className = '',
  ...props
}) => {

    const mapItems = React.useMemo(() => (
      items.map(item => {
        const [Item, props] = solveItem(item)
        return React.forwardRef<HTMLDivElement, SwitchChildProps>(({ entering }, ref) => (
          <div ref={ref} className="Item" style={{ opacity: `${entering ? '0' : ''}` }}>
            <Item {...props}/>
          </div>
        ))
      })
      // items as dependencies is ok
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ), items)

    return (
      <div className={`DivSwitch ${className}`} {...props}>
        <Switch<HTMLDivElement>
          index={index}
          transitionDuration={transitionDuration}
          items={mapItems}
          debugDisplayAll={debugDisplayAll}
          onTransition={(entering, leaving, t) => {
            // Ensure to remove old class names when changes occurs quickly:
            entering?.classList.remove('leaving')
            leaving?.classList.remove('entering')
            // Transition update:
            if (t < 1) {
              entering?.classList.add('entering')
              leaving?.classList.add('leaving')
            }
            if (t === 1) {
              entering?.classList.remove('entering')
            }
            if (leaving) {
              const t1 = inverseLerp(0, 0.6, t)
              leaving.style.opacity = in4((1 - t1)).toFixed(2)
            }
            if (entering) {
              entering.style.opacity = t < 1 ? inout(t, 3, .3).toFixed(2) : ''
            }
          }}
        />
      </div>
    )
  }
