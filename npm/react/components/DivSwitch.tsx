import React from 'react'
import { inverseLerp, inout, in4 } from '../../../math'
import { SwitchChildProps, Switch } from './Switch'
import './DivSwitch.css'

export const DivSwitch: React.FC<{
  index?: number
  items?: React.ElementType[]
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
      items.map(Item => React.forwardRef<HTMLDivElement, SwitchChildProps>(({ entering }, ref) => (
        <div ref={ref} className="Item" style={{ opacity: `${entering ? '0' : ''}` }}>
          <Item />
        </div>
      )))
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
