// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import { useEffect } from 'react'
// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import { useThree } from '@react-three/fiber'
import { AnimationFrame, time } from '../react/time'

export const ThreeAnimationFrame = (props: Parameters<typeof AnimationFrame>[0]) => {
  const { invalidate } = useThree()
  useEffect(() => {
    const { destroy } = time.onChange(() => invalidate())
    return destroy
  }, [invalidate])
  return (
    <AnimationFrame {...props} />
  )
}
