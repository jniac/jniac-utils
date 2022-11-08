import { ElementType, HTMLAttributes, useMemo, forwardRef } from 'react'
import { inverseLerp, inout, in4 } from '../../../math'
import { SwitchChildProps, Switch } from './Switch'
import './DivSwitch.css'

type Props = {
  index?: number
  items?: ElementType[]
  itemProps?: Record<string, any>
  transitionDuration?: number
  debug?: string
  debugDisplayAll?: boolean
} & HTMLAttributes<HTMLDivElement>

export const DivSwitch = ({
  index = 0,
  items = [],
  itemProps = {},
  transitionDuration = .8,
  debugDisplayAll = false,
  className = '',
  debug,
  ...props
}: Props) => {

  const mapItems = useMemo(() => {
    return items.map(Item => {
      return forwardRef<HTMLDivElement, SwitchChildProps>((props, ref) => {
        return (
          <div ref={ref} className="Item" style={{ opacity: `${props.entering ? '0' : ''}` }}>
            <Item {...props} />
          </div>
        )
      })
    })
    // items as dependencies is ok
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, items)

  return (
    <div className={`DivSwitch ${className}`} {...props}>
      <Switch<HTMLDivElement>
        index={index}
        transitionDuration={transitionDuration}
        items={mapItems}
        itemProps={itemProps}
        debugDisplayAll={debugDisplayAll}
        onTransition={(entering, leaving, t, animation) => {
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
