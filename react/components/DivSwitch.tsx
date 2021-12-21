import React from 'react'
import * as Animation from '../../Animation'
import * as MathUtils from '../../math'
import { SwitchChildProps, Switch } from './Switch'
import './DivSwitch.css'

export const DivSwitch: React.FC<{
  index?: number
  items?: React.ElementType[]
  duration?: number
}> = ({
  index = 0, items = [], duration = 0.8,
}) => {

    const mapItems = React.useMemo(() => (
      items.map(Item => React.forwardRef<HTMLDivElement, SwitchChildProps>(({ entering }, ref) => (
        <div ref={ref} className="DivSwitch Item" style={{ opacity: `${entering ? 0 : 1}` }}>
          <Item />
        </div>
      )))
      // items as dependencies is ok
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ), items)

    return (
      <Switch<HTMLDivElement>
        index={index}
        duration={duration}
        items={mapItems}
        onTransition={(entering, leaving, t) => {
          if (t < 1) {
            entering?.classList.add('entering')
            leaving?.classList.add('leaving')
          }
          if (t === 1) {
            entering?.classList.remove('entering')
          }
          if (leaving) {
            const t1 = MathUtils.inverseLerp(0, 0.6, t)
            leaving.style.opacity = Animation.easing.in4((1 - t1)).toFixed(2)
          }
          if (entering) {
            entering.style.opacity = MathUtils.inout(t, 3, .3).toFixed(2)
          }
        }}
      />
    )
  }
