// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import { useEffect } from 'react'
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

type TimeHandlerCallbackOptions = Partial<{
  /** The bigger, the later. Default is 0. */
  order: number
  /** Frames to skip to save computations. Default is 0. */
  skip: number
}>

class TimeHandler {
  #frame = 0
  #time = 0
  #timeOld = 0
  #deltaTime = 0
  #callbacks = new OrderSet<(time: TimeHandler) => void>()
  #timeScale = 1
  #broken = false
  get frame() { return this.#frame }
  get time() { return this.#time }
  get timeOld() { return this.#timeOld }
  get deltaTime() { return this.#deltaTime }
  get timeScale() { return this.#timeScale }
  update(deltaTime: number, timeScale: number) {
    if (this.#broken === false) {
      deltaTime *= timeScale
      const freezed = deltaTime === 0 && this.#time === this.#timeOld
      if (freezed === false) {
        this.#timeScale = timeScale
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
  }
  onFrame(options: TimeHandlerCallbackOptions, callback: (time: TimeHandler) => void): { destroy: () => void }
  onFrame(callback: (time: TimeHandler) => void): { destroy: () => void }
  onFrame(...args: any[]) {
    // @ts-ignore
    return this.onChange(...args)
  }
  onChange(options: TimeHandlerCallbackOptions, callback: (time: TimeHandler) => void): { destroy: () => void }
  onChange(callback: (time: TimeHandler) => void): { destroy: () => void }
  onChange(...args: any[]) {
    const resolveArgs = (): [TimeHandlerCallbackOptions, (time: TimeHandler) => void] => {
      if (args.length === 1) {
        return [{}, args[0]]
      } else if (args.length === 2) {
        return args as any
      } else {
        throw new Error('Oups')
      }
    }
    const [{ order = 0, skip = 0 }, callback] = resolveArgs()
    const finalCallback = skip <= 0 ? callback : () => {
      if (this.#frame % (skip + 1) === 0) {
        callback(this)
      }
    }
    this.#callbacks.add(order, finalCallback)
    const destroy = () => {
      this.#callbacks.delete(order, finalCallback)
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

  useEffect(() => {

    let lastRenderRequestTime = 0
    const innerContinuousRequestSet = new Set<string>()

    let animationFrameId = -1, msOld = -1
    const animationFrame = (ms: number) => {
      animationFrameId = window.requestAnimationFrame(animationFrame)
      const deltaTime = (ms - msOld) / 1e3
      msOld = ms
      appTime.update(deltaTime, 1)

      // Prevent auto pause if any continuous request
      if (requestContinuousAnimationSet.size > 0 || innerContinuousRequestSet.size > 0) {
        lastRenderRequestTime = appTime.time
      }

      const elapsed = appTime.time - lastRenderRequestTime
      const timeScale = inout3(1 - inverseLerp(timeBeforeFade, timeBeforeFade + fadeDuration, elapsed))

      time.update(deltaTime, timeScale)
    }

    const firstFrame = (ms: number) => {
      animationFrameId = window.requestAnimationFrame(animationFrame)
      const deltaTime = 1 / 60
      msOld = ms - deltaTime
      appTime.update(deltaTime, 1)
      time.update(deltaTime, 1)
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