import { ElementType, useRef, useMemo, useState } from 'react'
import { Animation, AnimationInstance } from '../../../Animation'
import { Observable } from '../../../observables'
import { useComplexEffects } from '../hooks'

export type SwitchChildProps = { 
  entering?: boolean
  leaving?: boolean
}

export type Props<T> = {
  index?: number
  items?: ElementType[]
  itemProps?: Record<string, any>
  transitionDuration?: number
  onTransition?: (entering: T | null, leaving: T | null, progress: number, animation: AnimationInstance) => void
  debugDisplayAll?: boolean
}

export const Switch = <T extends unknown>({
  index = 0,
  items = [],
  itemProps = {},
  transitionDuration = 0.8,
  debugDisplayAll = false,
  onTransition,
}: Props<T>) => {

  const ref1 = useRef<T>(null)
  const ref2 = useRef<T>(null)

  const indexObs = useMemo(() => new Observable(-1), [])
  const inverseObs = useMemo(() => new Observable(false), [])
  indexObs.setValue(index)

  const hasChanged = indexObs.hasChanged && indexObs.valueOld !== -1
  if (hasChanged) {
    inverseObs.setValue(!inverseObs.value)
  }
  const [transition, setTransition] = useState(false)

  useComplexEffects(function* () {
    yield indexObs.onChange(() => {
      setTransition(true)
      const inverse = inverseObs.value
      const [entering, leaving] = inverse ? [ref1, ref2] : [ref2, ref1]
      Animation.duringWithTarget(indexObs, { duration: transitionDuration, immediate: true }, animation => {
        onTransition?.(entering.current, leaving.current, animation.progress, animation)
      }).onComplete(() => {
        setTransition(false)
      })
    })
  }, [])

  // NOTE:
  // When inverse === true, Content2 is entering / displayed, otherwise it's Content1

  const inverse = inverseObs.value
  const render1 = !inverse || transition
  const render2 = inverse || transition
  const index1 = !inverse ? indexObs.value : indexObs.valueOld
  const index2 = inverse ? indexObs.value : indexObs.valueOld
  const Content1 = items[index1]
  const Content2 = items[index2]

  if (debugDisplayAll) {
    return (
      <>{items.map((Item, index) => {
        return (
          <Item key={index} {...itemProps} />
        )
      })}</>
    )
  }

  return (
    <>
      {(render1 && Content1) && (
        <Content1 
          ref={ref1}
          key={index1}
          {...itemProps}
          entering={transition && !inverse}
          leaving={transition && inverse}
        />
      )}
      {(render2 && Content2) && (
        <Content2
          ref={ref2}
          key={index2}
          {...itemProps}
          entering={transition && inverse}
          leaving={transition && !inverse}
        />
      )}
    </>
  )
}

