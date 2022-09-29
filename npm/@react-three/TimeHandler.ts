// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import { useEffect } from 'react'
// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import { useThree } from '@react-three/fiber'
import { inout3, inverseLerp } from '../../math'
import { OrderSet } from '../../collections'



const requestContinuousAnimationSet = new Set<number>()
let requestContinuousAnimationCount = 0
export const requestContinuousAnimation = () => {
  const id = requestContinuousAnimationCount++
  requestContinuousAnimationSet.add(id)
  return id
}
export const cancelContinuousAnimation = (id: number) => {
  return requestContinuousAnimationSet.delete(id)
}

class TimeHandler {
  #frame = 0
  #time = 0
  #timeOld = 0
  #deltaTime = 0
  #callbacks = new OrderSet<(time: TimeHandler) => void>()
  #broken = false
  get frame() { return this.#frame }
  get time() { return this.#time }
  get timeOld() { return this.#timeOld }
  get deltaTime() { return this.#deltaTime }
  update(deltaTime: number) {
    if (this.#broken === false) {
      this.#deltaTime = deltaTime
      this.#timeOld = this.#time
      this.#time += deltaTime
      this.#frame++
      try {
        for (const callback of this.#callbacks.values()) {
          callback(this)
        }
      } catch (error) {
        console.error(`TimeHandler caught an error. Break incoming loops.`)
        console.error(error)
        this.#broken = true
      }
    }
  }
  onChange(options: { order: number }, callback: (time: TimeHandler) => void): { destroy: () => void }
  onChange(callback: (time: TimeHandler) => void): { destroy: () => void }
  onChange(...args: any[]) {
    const resolveArgs = (): [{ order: number }, (time: TimeHandler) => void] => {
      if (args.length === 1) {
        return [{ order: 0 }, args[0]]
      } else if (args.length === 2) {
        return args as any
      } else {
        throw new Error('Oups')
      }
    }
    const [{ order }, callback] = resolveArgs()
    this.#callbacks.set(order, callback)
    const destroy = () => {
      this.#callbacks.delete(order, callback)
    }
    return { destroy }
  }
  passThrough(threshold: number) {
    return this.#timeOld < threshold && this.#time >= threshold
  }
}

export const appTime = new TimeHandler()
export const time = new TimeHandler()

type AnimationFrameProps = {
  timeBeforeFade?: number
  fadeDuration?: number
}

export const AnimationFrame = ({
  timeBeforeFade = 30,
  fadeDuration = 1,
}: AnimationFrameProps) => {
  const { invalidate } = useThree()

  useEffect(() => {

    let lastRenderRequestTime = 0
    const innerContinuousRequestSet = new Set<string>()

    let animationFrameId = -1, msOld = -1
    const animationFrame = (ms: number) => {
      animationFrameId = window.requestAnimationFrame(animationFrame)
      const deltaTime = (ms - msOld) / 1e3
      msOld = ms
      appTime.update(deltaTime)

      // Prevent auto pause if any continuous request
      if (requestContinuousAnimationSet.size > 0 || innerContinuousRequestSet.size > 0) {
        lastRenderRequestTime = appTime.time
      }

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
    window.addEventListener('popstate', onInteraction, { capture: true })
    window.addEventListener('wheel', onInteraction, { capture: true })
    window.addEventListener('keydown', onInteraction, { capture: true })

    // continuous request / release
    const onKeyDown = (event: KeyboardEvent) => innerContinuousRequestSet.add(event.code)
    const onKeyUp = (event: KeyboardEvent) => innerContinuousRequestSet.delete(event.code)
    const onPointerDown = (event: PointerEvent) => innerContinuousRequestSet.add(`${event.pointerType}-${event.pointerId}`)
    const onPointerUp = (event: PointerEvent) => innerContinuousRequestSet.delete(`${event.pointerType}-${event.pointerId}`)
    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('keyup', onKeyUp, { capture: true })
    window.addEventListener('pointerdown', onPointerDown, { capture: true })
    window.addEventListener('pointerup', onPointerUp, { capture: true })

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('pointermove', onInteraction, { capture: true })
      window.removeEventListener('touchstart', onInteraction, { capture: true })
      window.removeEventListener('touchmove', onInteraction, { capture: true })
      window.removeEventListener('touchend', onInteraction, { capture: true })
      window.removeEventListener('pointerdown', onInteraction, { capture: true })
      window.removeEventListener('pointerup', onInteraction, { capture: true })
      window.removeEventListener('popstate', onInteraction, { capture: true })
      window.removeEventListener('wheel', onInteraction, { capture: true })
      window.removeEventListener('keydown', onInteraction, { capture: true })

      // continuous request / release
      window.removeEventListener('keypress', onKeyDown, { capture: true })
      window.removeEventListener('keyup', onKeyUp, { capture: true })
      window.removeEventListener('pointerdown', onPointerDown, { capture: true })
      window.removeEventListener('pointerup', onPointerUp, { capture: true })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeBeforeFade, fadeDuration])

  return null
}