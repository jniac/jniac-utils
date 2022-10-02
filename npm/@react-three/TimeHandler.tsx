// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import { ThreeAnimationFrame } from './ThreeAnimationFrame'
import { time, appTime, cancelContinuousAnimation, requestContinuousAnimation } from '../react'

// Backward compatibility.
// NOTE: TimeHandler no longer depends on @react-three/fiber and is now exported 
// from `some-utils/npm/react`. But older projects may import `some-utils/npm/@react-three`
// so here every exports are re-exported from the new url (`some-utils/npm/react`) 
// with on notable exception: AnimationFrame is a re-export of ThreeAnimationFrame.
export {
  ThreeAnimationFrame as AnimationFrame,
  time,
  appTime,
  cancelContinuousAnimation,
  requestContinuousAnimation,
}
