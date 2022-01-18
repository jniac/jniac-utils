import React from 'react'
import * as Animation from '../../Animation'
import { Observable } from '../../observables'
import { useComplexEffects } from '../hooks'

export interface SwitchChildProps { 
  entering?: boolean
  leaving?: boolean
}

export interface SwitchProps<T> {
  index?: number
  items?: React.ElementType[]
  transitionDuration?: number
  onTransition?: (entering: T | null, leaving: T | null, progress: number) => void
  debugDisplayAll?: boolean
}

export const Switch = <T extends unknown>({
  index = 0,
  items = [],
  transitionDuration = 0.8,
  debugDisplayAll = false,
  onTransition,
}: SwitchProps<T>) => {

  const ref1 = React.useRef<T>(null)
  const ref2 = React.useRef<T>(null)

  const indexObs = React.useMemo(() => new Observable(-1), [])
  const inverseObs = React.useMemo(() => new Observable(false), [])
  indexObs.setValue(index)

  const hasChanged = indexObs.hasChanged && indexObs.valueOld !== -1
  if (hasChanged) {
    inverseObs.setValue(!inverseObs.value)
  }
  const [transition, setTransition] = React.useState(false)

  useComplexEffects(function* () {
    yield indexObs.onChange(() => {
      setTransition(true)
      const inverse = inverseObs.value
      const [entering, leaving] = inverse ? [ref1, ref2] : [ref2, ref1]
      Animation.duringWithTarget(indexObs, { duration: transitionDuration, immediate: true }, ({ progress }) => {
        onTransition?.(entering.current, leaving.current, progress)
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
      <>{items.map((Item, index) => <Item key={index} />)}</>
    )
  }

  return (
    <>
      {(render1 && Content1) && (
        <Content1 
          ref={ref1}
          entering={transition && !inverse}
          leaving={transition && inverse}
        />
      )}
      {(render2 && Content2) && (
        <Content2
          ref={ref2}
          entering={transition && inverse}
          leaving={transition && !inverse}
        />
      )}
    </>
  )
}
