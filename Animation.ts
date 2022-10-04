
const clamp01 = (x: number) => x < 0 ? 0 : x > 1 ? 1 : x
const clamp = (x: number, min = 0, max = 1) => x < min ? min : x > max ? max : x
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const nothing = [][Symbol.iterator]()





// EASINGS >

// CUBIC-BEZIER >

const cubic01 = (x2: number, x3: number, t: number) => {
  const ti = 1 - t
  const t2 = t * t
  return (
    + 3 * ti * ti  * t * x2
    + 3 * ti * t2 * x3
    + t2 * t
  )
}

export const cubic01SearchT = (
  x2: number,
  x3: number,
  x: number,
  iterations = 6,
  precision = 0.0001,
  lowerT = 0,
  upperT = 1,
  lowerX = 0,
  upperX = 1,
) => {
  if (x <= precision) {
    return 0
  }
  if (x >= 1 - precision) {
    return 1
  }

  let diffX = 0, currentX = 0, currentT = 0
  for (let i = 0; i < iterations; i++) {
    currentT = (lowerT + upperT) / 2
    currentX = cubic01(x2, x3, currentT)
    diffX = x - currentX
    if (Math.abs(diffX) <= precision) {
      return currentT
    }
    if (diffX < 0) {
      upperT = currentT
      upperX = currentX
    } else {
      lowerT = currentT
      lowerX = currentX
    }
  }

  // return the final linear interpolation between lower and upper bounds
  return lowerT + (upperT - lowerT) * (x - lowerX) / (upperX - lowerX)
}

export const solveCubicEasing = (x1: number, y1: number, x2: number, y2: number, x: number, iterations?: number, precision?: number) => {
  const t = cubic01SearchT(x1, x2, x, iterations, precision)
  const y = cubic01(y1, y2, t)
  return y
}

// CUBIC-BEZIER <



export const easings = (() => {
  const clamp01 = (x: number) => x < 0 ? 0 : x > 1 ? 1 : x
  const linear = clamp01
  const in1 = clamp01
  const in2 = (x: number) => clamp01(x * x)
  const in3 = (x: number) => clamp01(x * x * x)
  const in4 = (x: number) => clamp01(x * x * x * x)
  const in5 = (x: number) => clamp01(x * x * x * x * x)
  const in6 = (x: number) => clamp01(x * x * x * x * x * x)
  const out1 = clamp01
  const out2 = (x: number) => clamp01(1 - (x = 1 - x) * x)
  const out3 = (x: number) => clamp01(1 - (x = 1 - x) * x * x)
  const out4 = (x: number) => clamp01(1 - (x = 1 - x) * x * x * x)
  const out5 = (x: number) => clamp01(1 - (x = 1 - x) * x * x * x * x)
  const out6 = (x: number) => clamp01(1 - (x = 1 - x) * x * x * x * x * x)
  const inout1 = clamp01
  const inout2 = (x: number) => clamp01(x < .5 ? 2 * x * x : 1 - 2 * (x = 1 - x) * x)
  const inout3 = (x: number) => clamp01(x < .5 ? 4 * x * x * x : 1 - 4 * (x = 1 - x) * x * x)
  const inout4 = (x: number) => clamp01(x < .5 ? 8 * x * x * x * x : 1 - 8 * (x = 1 - x) * x * x * x)
  const inout5 = (x: number) => clamp01(x < .5 ? 16 * x * x * x * x * x : 1 - 16 * (x = 1 - x) * x * x * x * x)
  const inout6 = (x: number) => clamp01(x < .5 ? 32 * x * x * x * x * x * x : 1 - 32 * (x = 1 - x) * x * x * x * x * x)
  const inout = (x: number, p: number = 3, i: number = 0.5) => {
    return (x < 0 ? 0 : x > 1 ? 1 : x < i
      ? 1 / Math.pow(i, p - 1) * Math.pow(x, p)
      : 1 - 1 / Math.pow(1 - i, p - 1) * Math.pow(1 - x, p)
    )
  }
  return {
    linear,
    in1, in2, in3, in4, in5, in6,
    out1, out2, out3, out4, out5, out6,
    inout1, inout2, inout3, inout4, inout5, inout6,
    inout,
  }
})()

const getEase = (ease: EaseDeclaration) => {

  if (typeof ease === 'function') {
    return ease
  }

  if (typeof ease === 'string') {
    if (ease.startsWith('cubic-bezier')) {
      const [x1, y1, x2, y2] = ease
        .slice(13, -1)
        .split(/\s*,\s*/)
        .map(s => parseFloat(s))
      return (x: number) => solveCubicEasing(x1, y1, x2, y2, x)
    }
    else if (ease in easings) {
      return easings[ease as keyof typeof easings]
    }
  }

  return easings.linear
}

const easeMap = new Map<EaseDeclaration, (x: number) => number>()
const getMemoizedEase = (ease: EaseDeclaration) => {
  let value = easeMap.get(ease)
  if (value === undefined) {
    value = getEase(ease)
    easeMap.set(ease, value)
  }
  return value
}

// EASINGS <





// OBJECT >

/**
 * Clone a value. If value is an object will return a shallow clone.
 * Used by tween().
 */
 const cloneValue = <T = any>(value: T) => {
  if (value && typeof value === 'object') {
    const clone = new (value as any).constructor()
    for (const key in value) {
      clone[key] = value[key]
    }
    return clone
  }
  return value
}

export const lerpObject = (receiver: any, a: any, b: any, t: number) => {
  for (const key in a) {
    const va = a[key]
    const vb = b[key]
    // some props may not be numeric, (ex: new THREE.Euler(0, 1, 2, 'XYZ'))
    switch (typeof va) {
      case 'number': {
        receiver[key] = lerp(va, vb, t)
        break
      }

      case 'object': {
        lerpObject(receiver[key], va, vb, t)
        break
      }
    }
  }
}

// OBJECT <





let time = 0
let timeOld = 0
let deltaTime = 0
let frame = 0

type AnimationCallback = (animation: AnimationInstance) => any

class CallbackMap extends Map<AnimationInstance, Set<AnimationCallback>> {

  add(animation: AnimationInstance, cb: AnimationCallback) {
    const create = (animation: AnimationInstance) => {
      const set = new Set<AnimationCallback>()
      this.set(animation, set)
      return set
    }
    const set = this.get(animation) ?? create(animation)
    set.add(cb)
  }

  getAndDelete(animation: AnimationInstance) {
    const set = this.get(animation)
    if (set) {
      this.delete(animation)
    }
    return set
  }
}

const destroyCallbacks = new CallbackMap()
const startCallbacks = new CallbackMap()
const completeCallbacks = new CallbackMap()
const frameCallbacks = new CallbackMap()
const nextFrameCallbacks = new CallbackMap()

let count = 0
class AnimationInstance {

  id = count++
  startTime = time
  startFrame = frame
  timeScale = 1
  paused = false
  time = 0
  timeOld = 0
  deltaTime = 0
  duration = Infinity
  autoDestroy = true // autoDestroy on complete?
  destroyed = false
  frame = 0
  
  get normalizedTime() { return clamp(this.time, 0, this.duration) }
  get progress() { return clamp(this.time / this.duration, 0, 1) }
  get progressOld() { return clamp(this.timeOld / this.duration, 0, 1) }
  get global() { return info }
  get complete() { return this.time >= this.duration }
  get completeOld() { return this.timeOld >= this.duration }

  destroy: () => AnimationInstance
  
  constructor(cb?: AnimationCallback) {
    // destroy must be binded
    this.destroy = () => {
      if (this.destroyed === false) {
        destroyedAnimations.add(this)
        this.destroyed = true
      }
      return this
    }
    this.onFrame(cb)
    addAnimation(this)
  }

  passedThrough(threshold = {} as number | { time?: number, progress?: number, frame?: number }) {
    const { time, progress = undefined, frame = undefined } = typeof threshold === 'number' ? { time: threshold } : threshold
    if (time !== undefined) {
      return this.time >= time && this.timeOld < time
    }
    if (progress !== undefined) {
      return this.progress >= progress && this.progressOld < progress
    }
    if (frame !== undefined) {
      return this.frame === frame
    }
    return false
  }

  pause() {
    this.paused = true
    return this
  }

  /**
   * Play the animation (on next tick), from the current time, or from the given params.
   * @param param 
   */
  play({ time, progress } = {} as { time?: number, progress?: number }) {
    
    this.paused = false

    // NOTE: time is modified here, but without "jumps".
    // Any effects will happen on next tick.
    if (progress !== undefined) {
      time = progress * this.duration
    }
    if (time !== undefined) {
      this.time = time
    }

    return this
  }

  playOneFrame() {

    this.play()
      .waitNextFrame()
      ?.then(() => this.pause())

    return this
  }

  setTime(value: number) {
    if (value !== this.time) {
      // NOTE: A clamp is required here.
      updateAnimation(this, value)
    }
    return this
  }

  setProgress(value: number) {
    return this.setTime(clamp01(value) * this.duration)
  }

  triggerFrameCallbacks() {
    for (const cb of frameCallbacks.get(this) ?? nothing) {
      cb(this)
    }
    return this
  }

  onStart(cb?: AnimationCallback) {
    if (this.destroyed === false && cb) {
      startCallbacks.add(this, cb)
    }
    return this
  }

  onFrame(cb?: AnimationCallback) {
    if (this.destroyed === false && cb) {
      frameCallbacks.add(this, cb)
    }
    return this
  }

  // alias
  onProgress(cb?: AnimationCallback) {
    return this.onFrame(cb)
  }

  onComplete(cb?: AnimationCallback) {
    if (this.destroyed === false && cb) {
      completeCallbacks.add(this, cb)
    }
    return this
  }

  onDestroy(cb?: AnimationCallback) {
    if (this.destroyed === false && cb) {
      destroyCallbacks.add(this, cb)
    }
    return this
  }
  
  waitDestroy() {
    if (this.destroyed) {
      return null
    }
    return new Promise<AnimationInstance>(resolve => destroyCallbacks.add(this, resolve))
  }
  
  waitCompletion() {
    if (this.destroyed || this.complete) {
      return null
    }
    return new Promise<AnimationInstance>(resolve => completeCallbacks.add(this, resolve))
  }
  
  waitNextFrame() {
    if (this.destroyed) {
      return null
    }
    return new Promise<AnimationInstance>(resolve => nextFrameCallbacks.add(this, resolve))
  }
  
  async *waitFrames(): AsyncGenerator<AnimationInstance, void, unknown> {
    while(await this.waitNextFrame()) {
      yield this
    }
  }

  async *[Symbol.asyncIterator]() {
    yield* this.waitFrames()
  }
}

const animations = new Set<AnimationInstance>()
const newAnimations = new Set<AnimationInstance>()
const destroyedAnimations = new Set<AnimationInstance>()
const BREAK = Symbol('Animation.BREAK')

const addAnimation = (animation: AnimationInstance) => {
  (updating ? newAnimations : animations).add(animation)
}

const updateAnimation = (animation: AnimationInstance, animationTime: number) => {
  animation.timeOld = animation.time
  animation.time = animationTime
  animation.deltaTime = animationTime - animation.timeOld
  if (animation.time >= 0) {
    let done = false
    if (animation.frame === 0) {
      for (const cb of startCallbacks.get(animation) ?? nothing) {
        done = (cb(animation) === BREAK) || done
      }
    }
    animation.frame += 1
    for (const cb of frameCallbacks.get(animation) ?? nothing) {
      done = (cb(animation) === BREAK) || done
    }
    for (const cb of nextFrameCallbacks.getAndDelete(animation) ?? nothing) {
      done = (cb(animation) === BREAK) || done
    }
    if (animation.complete && animation.completeOld === false) {
      for (const cb of completeCallbacks.get(animation) ?? nothing) {
        cb(animation)
      }
    }
    if (animation.autoDestroy && (done || animation.complete)) {
      animation.destroy()
    }
  }
}

const destroyAnimation = (animation: AnimationInstance) => {
  animations.delete(animation)
  frameCallbacks.delete(animation)
  nextFrameCallbacks.delete(animation)
  const set = destroyCallbacks.getAndDelete(animation)
  if (set) {
    for (const cb of set) {
      cb(animation)
    }
  }
}

let updating = false
const update = (_deltaTime: number) => {
  deltaTime = _deltaTime
  timeOld = time
  time = time + deltaTime
  frame++

  updating = true
  for (const animation of animations) {
    if (animation.destroyed === false && animation.paused === false) {
      const animationTime = animation.time + deltaTime * animation.timeScale
      updateAnimation(animation, animationTime)
    }
  }
  for (const animation of destroyedAnimations) {
    destroyAnimation(animation)
  }
  destroyedAnimations.clear()
  for (const animation of newAnimations) {
    animations.add(animation)
  }
  updating = false
}

let autoUpdate = true
let msOld = 0, msDelta = 0
const _innerLoop = (ms: number): void => {
  if (autoUpdate) {
    window.requestAnimationFrame(_innerLoop)
  
    msDelta = ms - msOld
    msOld = ms
  
    update(msDelta / 1e3)
  }
}

window.requestAnimationFrame(ms => {
  msOld = ms
  _innerLoop(ms)
})

const breakAutoUpdate = () => {
  autoUpdate = false
}


// API:

/**
 * Small utility to handle animation with target.
 * 
 * When an animation is "set()", it automatically checks for a previous and, if so, destroy it.
 */
class AnimationMap {
  map = new Map<any, AnimationInstance>()
  get(target: any) {
    return this.map.get(target)
  }
  set(target: any, animation: AnimationInstance) {
    this.map.get(target)?.destroy()
    this.map.set(target, animation)
    animation.onDestroy(() => {
      // IMPORTANT: check that animation has not been overrided before delete it
      if (this.map.get(target) === animation) {
        this.map.delete(target)
      }
    })
    return animation
  }
}
const loop = (cb: AnimationCallback) => new AnimationInstance(cb)

const loopMap = new AnimationMap()
const loopWithTarget = (target: any, cb: AnimationCallback) => {
  return loopMap.set(target, loop(cb))
}
const loopCancelTarget = (target: any) => {
  loopMap.get(target)?.destroy()
}

type AnimationParam = 
  | { duration: number, delay?: number, immediate?: boolean, paused?: boolean, autoDestroy?: boolean }
  | [number, number?, boolean?]
  | number

const fromAnimationParam = (timingParam: AnimationParam) => {
  if (typeof timingParam === 'number') {
    return { duration: timingParam, delay: 0 }
  }
  if (Array.isArray(timingParam)) {
    const [duration, delay, immediate] = timingParam
    return { duration, delay, immediate }
  }
  return timingParam
}

const during = (timing: AnimationParam, cb?: AnimationCallback) => {
  
  const animation = new AnimationInstance(cb)
  
  const { 
    duration, 
    delay = 0, 
    immediate = false, 
    paused = false,
    autoDestroy = true,
  } = fromAnimationParam(timing)
  
  animation.duration = duration
  animation.paused = paused
  animation.time = -delay
  animation.autoDestroy = autoDestroy
  
  if (immediate) {
    cb?.(animation)
  }

  return animation
}

const duringMap = new AnimationMap()
const duringWithTarget = (target: any, timing: AnimationParam, cb: AnimationCallback = () => {}) => {
  return duringMap.set(target, during(timing, cb))
}
const duringCancelTarget = (target: any) => {
  duringMap.get(target)?.destroy()
}

const wait = (duration: number) => during(duration).waitDestroy()!

const waitFrames = (frameCount: number) => loop(({ frame }) => {
  if (frame >= frameCount) return BREAK
}).waitDestroy()!

type EaseDeclaration = 
  | ((t: number) => number) 
  | (keyof typeof easings) 
  | `cubic-bezier(${number}, ${number}, ${number}, ${number})`
  | null
  | undefined 

type TweenParams<T> = {
  from?: T | Partial<Record<keyof T, any>>
  to?: T | Partial<Record<keyof T, any>>
  ease?: EaseDeclaration
  onChange?: AnimationCallback,
  /** Alias for "onChange" */
  onProgress?: AnimationCallback
  onComplete?: AnimationCallback,
}

const tween = <T>(target: T, timing: AnimationParam, {
  from,
  to,
  ease,
  onProgress,
  onChange = onProgress,
  onComplete,
}: TweenParams<T>) => {
  
  const keys = new Set([...Object.keys(from ?? {}), ...Object.keys(to ?? {})]) as Set<keyof T>
  
  const _from = Object.fromEntries([...keys].map(key => {
    const value = cloneValue(from?.[key] ?? target[key])
    return [key, value]
  })) as Record<keyof T, any>
  
  const _to = Object.fromEntries([...keys].map(key => {
    const value = cloneValue(to?.[key] ?? target[key])
    return [key, value]
  })) as Record<keyof T, any>

  const _ease = getEase(ease)

  const anim = duringWithTarget(target, timing, ({ progress }) => {
    const t = _ease(progress)
    for (const key of keys) {
      const propValue = target[key]
      const propType = typeof propValue
      if (propType === 'number') {
        // numeric
        target[key] = lerp(_from[key], _to[key], t) as unknown as T[keyof T]
      } else if (propType === 'object') {
        // object
        lerpObject(target[key], _from[key], _to[key], t)
      }
    }
  })

  if (onChange) {
    anim.onFrame(onChange)
  }

  if (onComplete) {
    anim.onComplete(onComplete)
  }

  return anim
}

// syntax sugar / short hand
const cancelTween = duringCancelTarget
const hasTween = (target: any) => {
  return !!duringMap.get(target)
}

const info = {
  get time() { return time },
  get timeOld() { return timeOld },
  get deltaTime() { return deltaTime },
  get frame() { return frame },
  get targetCount() { return loopMap.map.size + duringMap.map.size },
}

export {
  count,
  breakAutoUpdate,
  update,

  info,
  BREAK,
  loop,
  loopWithTarget,
  loopCancelTarget,
  during,
  duringWithTarget,
  duringCancelTarget,
  wait,
  waitFrames,
  tween,
  cancelTween,
  hasTween,
  getEase,
  getMemoizedEase,
}

export type {
  AnimationInstance,
}

export const Animation = {
  breakAutoUpdate,
  update,

  info,
  BREAK,
  loop,
  loopWithTarget,
  loopCancelTarget,
  during,
  duringWithTarget,
  duringCancelTarget,
  wait,
  waitFrames,
  tween,
  cancelTween,
  hasTween,
  getEase,
  getMemoizedEase,
  AnimationInstance,
}
