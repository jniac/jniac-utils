// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import React from 'react'
// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import { useThree } from '@react-three/fiber'
import { inout3, inverseLerp } from 'some-utils/math'

class TimeHandler {
  #frame = 0
  #time = 0
  #timeOld = 0
  #deltaTime = 0
  #callbacks = new Set<(time: TimeHandler) => void>()
  get frame() { return this.#frame }
  get time() { return this.#time }
  get timeOld() { return this.#timeOld }
  get deltaTime() { return this.#deltaTime }
  update(deltaTime: number) {
    this.#deltaTime = deltaTime
    this.#timeOld = this.#time
    this.#time += deltaTime
    this.#frame++
    for (const callback of this.#callbacks)
      callback(this)
  }
  onChange(callback: (time: TimeHandler) => void) {
    this.#callbacks.add(callback)
    const destroy = () => {
      this.#callbacks.delete(callback)
    }
    return { destroy }
  }
  passThrough(threshold: number) {
    return this.#timeOld < threshold && this.#time >= threshold
  }
}

export const appTime = new TimeHandler()
export const time = new TimeHandler()

export const AnimationFrame: React.FC<{
  timeBeforeFade?: number
  fadeDuration?: number
}> = ({
  timeBeforeFade = 30,
  fadeDuration = 1,
}) => {
  const { invalidate } = useThree()

  React.useEffect(() => {

    let lastRenderRequestTime = 0

    let animationFrameId = -1, msOld = -1
    const animationFrame = (ms: number) => {
      animationFrameId = window.requestAnimationFrame(animationFrame)
      const deltaTime = (ms - msOld) / 1e3
      msOld = ms
      appTime.update(deltaTime)

      const elapsed = appTime.time - lastRenderRequestTime
      const timeScale = inout3(1 - inverseLerp(timeBeforeFade, timeBeforeFade + fadeDuration, elapsed))

      if (timeScale > 0) {
        time.update(deltaTime * timeScale)
        invalidate()
      }
    }
    
    const firstFrame = (ms: number) => {
      animationFrameId = window.requestAnimationFrame(animationFrame)
      const deltaTime = 1 / 60
      msOld = ms - deltaTime
      appTime.update(deltaTime)
      time.update(deltaTime)
    }
    animationFrameId = window.requestAnimationFrame(firstFrame)

    const onInteraction = () => lastRenderRequestTime = appTime.time
    window.addEventListener('pointermove', onInteraction, { capture: true })
    window.addEventListener('touchstart', onInteraction, { capture: true })
    window.addEventListener('touchmove', onInteraction, { capture: true })
    window.addEventListener('touchend', onInteraction, { capture: true })
    window.addEventListener('pointerdown', onInteraction, { capture: true })
    window.addEventListener('pointerup', onInteraction, { capture: true })
    window.addEventListener('keydown', onInteraction, { capture: true })
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('pointermove', onInteraction, { capture: true })
      window.removeEventListener('touchstart', onInteraction, { capture: true })
      window.removeEventListener('touchmove', onInteraction, { capture: true })
      window.removeEventListener('touchend', onInteraction, { capture: true })
      window.removeEventListener('pointerdown', onInteraction, { capture: true })
      window.removeEventListener('pointerup', onInteraction, { capture: true })
      window.removeEventListener('keydown', onInteraction, { capture: true })
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeBeforeFade, fadeDuration])

  return null
}