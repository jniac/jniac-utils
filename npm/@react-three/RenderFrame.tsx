// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import { useEffect } from 'react'
// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import { useThree } from '@react-three/fiber'
import { AnimationFrame, time } from '../react/time'

export const RenderFrame = ({
  order = 10000,
  ...props
}: {
  order?: number
} & Parameters<typeof AnimationFrame>[0]) => {
  const three = useThree()

  useEffect(() => {
    const { destroy } = time.onFrame({ order }, () => {
      three.gl.render(three.scene, three.camera)
    })
    return destroy
  }, [three, order])
  
  return (
    <AnimationFrame {...props} />
  )
}
