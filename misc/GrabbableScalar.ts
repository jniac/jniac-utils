type MinMaxParams1 = Partial<{
  min: number
  max: number
  margin: number
  minMargin: number
  maxMargin: number
  useInnerMargin: boolean
}>
type MinMaxParams2 = Partial<{
  outerMin: number
  innerMin: number
  innerMax: number
  outerMax: number
}>

/**
 * GrabbableScalar is for handling a clamped value that can be grabbed (by the user).
 * 
 * When the value is not grabbed, if the value is outside the bounds "update()" will
 * interpolate back the value to its nearest bounds.
 * 
 * If the value is grabbed, then the retrieved value is clamped throught the "limit" function:
 * - https://www.desmos.com/calculator/zq9kbt3xww
 * - https://www.desmos.com/calculator/zkjchucsqz
 * 
 * Usage:
 * ```
 * const position = new GrabbableScalar(0, { min: 0, max: 10, margin: 2, useInnerMargin: false })
 * const onDrag = (x: number) => {
 *   position.grab() // or position.grabbed = true
 *   position.valueGrab = x
 * }
 * const onDragStop = () => {
 *   position.release() // or position.grabbed = false
 * }
 * const onUpdate = () => {
 *   position.update()
 *   myComponent.x = position.value
 * }
 * ```
 */
export class GrabbableScalar {
  #grabbed = false
  rawGrabValue: number
  easeValue: number

  min = -Infinity
  max = Infinity
  minMargin = 1
  maxMargin = 1
  useInnerMargin = false

  easeDamping = .5

  get value() { return this.getValue() }
  set value(value) { this.setValue(value) }
  get grabbed() { return this.#grabbed }
  set grabbed(value) { this.setGrabbed(value) }

  get innerMax() { return this.max - (this.useInnerMargin ? this.maxMargin : 0) }
  get outerMax() { return this.max + (this.useInnerMargin ? 0 : this.maxMargin) }
  get innerMin() { return this.min + (this.useInnerMargin ? this.minMargin : 0) }
  get outerMin() { return this.min - (this.useInnerMargin ? 0 : this.maxMargin) }

  constructor(value?: number, minMaxParams?: MinMaxParams1)
  constructor(value?: number, minMaxParams?: MinMaxParams2)
  constructor(value = 0, minMaxParams: MinMaxParams1 & MinMaxParams2 = {}) {
    this.setMinMax(minMaxParams)
    this.rawGrabValue = value
    this.easeValue = value
  }

  getValue() {
    return this.#grabbed ? this.getLimitedGrabValue() : this.easeValue
  }

  setValue(value: number) {
    if (this.#grabbed) {
      this.rawGrabValue = value
    } else {
      this.easeValue = value
    }
  }

  setMinMax(params: MinMaxParams1): this
  setMinMax(params: MinMaxParams2): this
  setMinMax({
    min = this.min,
    max = this.max,
    margin = NaN,
    minMargin = Number.isNaN(margin) ? this.minMargin : margin,
    maxMargin = Number.isNaN(margin) ? this.maxMargin : margin,
    outerMin = NaN,
    innerMin = NaN,
    innerMax = NaN,
    outerMax = NaN,
    useInnerMargin = this.useInnerMargin,
  }: MinMaxParams1 & MinMaxParams2 = {}) {
    if (Number.isNaN(outerMin) === false && Number.isNaN(innerMin) === false) {
      minMargin = innerMin - outerMin
      min = useInnerMargin ? outerMin : innerMin
    }
    if (Number.isNaN(outerMax) === false && Number.isNaN(innerMax) === false) {
      maxMargin = outerMax - innerMax
      max = useInnerMargin ? outerMax : innerMax
    }
    this.useInnerMargin = useInnerMargin
    this.min = min
    this.max = max
    this.minMargin = minMargin
    this.maxMargin = maxMargin
    return this
  }

  getInnerMinMax() {
    const min = this.min + (this.useInnerMargin ? this.minMargin : 0)
    const max = this.max - (this.useInnerMargin ? this.maxMargin : 0)
    return { min, max }
  }

  /**
   * Returns the "limited grab value", according to the limit function decay:
   * - https://www.desmos.com/calculator/zq9kbt3xww
   * - https://www.desmos.com/calculator/zkjchucsqz
   */
  getLimitedGrabValue() {
    const { rawGrabValue, minMargin, maxMargin } = this
    const { min, max } = this.getInnerMinMax()
    if (rawGrabValue < min) {
      const delta = min - rawGrabValue
      return min - delta * minMargin / (delta + minMargin)
    }
    if (rawGrabValue > max) {
      const delta = rawGrabValue - max
      return max + delta * maxMargin / (delta + maxMargin)
    }
    return rawGrabValue
  }

  clampValueEase() {
    const { easeValue, easeDamping } = this
    const { min, max } = this.getInnerMinMax()
    if (easeValue < min) {
      this.easeValue += (min - easeValue) * easeDamping
    }
    else if (easeValue > max) {
      this.easeValue += (max - easeValue) * easeDamping
    }
    return this
  }

  setGrabbed(value: boolean) {
    if (this.#grabbed !== value) {
      this.#grabbed = value
      if (value) {
        this.rawGrabValue = this.easeValue
      } else {
        // NOTE: The tricks is here: when back to the "ease" mode (no grab) the 
        // ease value is copied from the limited current grab value.
        this.easeValue = this.getLimitedGrabValue()
      }
    }
    return this
  }

  grab() {
    return this.setGrabbed(true)
  }

  release() {
    return this.setGrabbed(false)
  }

  update() {
    if (this.#grabbed === false) {
      this.clampValueEase()
    }
    return this
  }
}
