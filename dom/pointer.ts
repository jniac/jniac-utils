import { ObservableBoolean, ObservableObject } from '../observables'

export const pointerInfo = {
  position: new ObservableObject({ x: 0, y: 0, down: false }),
  get positionDelta() {
    const x = pointerInfo.position.value.x - pointerInfo.position.valueOld.x
    const y = pointerInfo.position.value.y - pointerInfo.position.valueOld.y
    return { x, y }
  },
  down: new ObservableObject({
    position: { x: 0, y: 0 },
    time: -1,
    target: document.body as HTMLElement,
  }),
  up: new ObservableObject({
    position: { x: 0, y: 0 },
    time: -1,    
    target: document.body as HTMLElement,
  }),
  isDown: new ObservableBoolean(false),
}

window.addEventListener('pointermove', event => {
  const { x, y } = event
  pointerInfo.position.updateValue({ x, y })
})

window.addEventListener('pointerdown', event => {
  const { x, y, timeStamp: time, target } = event
  pointerInfo.position.updateValue({ down: true, x, y })
  pointerInfo.down.updateValue({
    position: { x, y },
    time,
    target: target as HTMLElement,
  })
  pointerInfo.isDown.setValue(true)
})

window.addEventListener('pointerup', event => {
  const { x, y, timeStamp: time, target } = event
  pointerInfo.position.updateValue({ down: false })
  pointerInfo.up.updateValue({
    position: { x, y },
    time,
    target: target as HTMLElement,
  })
  pointerInfo.isDown.setValue(false)
})
