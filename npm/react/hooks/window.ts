import React from 'react'
import { Rectangle } from '../../../geom'
import { useForceUpdate } from './utils'

type Options = Partial<{
  execute: 'immediate' | 'next-frame',
}>

export const useWindow = ({
  execute = 'immediate',
}: Options = {}) => {
  const rectangle = React.useMemo(() => new Rectangle(window.innerWidth, window.innerHeight), [])
  const forceUpdate = useForceUpdate({ waitNextFrame: execute === 'next-frame' })
  React.useEffect(() => {
    const update = () => {
      rectangle.set(0, 0, window.innerWidth, window.innerHeight)
      forceUpdate()
    }
    const onResize = () => {
      if (execute === 'immediate') {
       update()
      }
      else {
        requestAnimationFrame(update)
      }
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute])
  return rectangle
}