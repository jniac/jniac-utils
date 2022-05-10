import { Observable, ObservableBoolean, ObservableObject } from '../observables'

export const pointerInfo = {
  position: new ObservableObject({ x: 0, y: 0, down: false }),
  get positionDelta() {
    const x = pointerInfo.position.value.x - pointerInfo.position.valueOld.x
    const y = pointerInfo.position.value.y - pointerInfo.position.valueOld.y
    return { x, y }
  },
  downTarget: new Observable(document.body),
  down: new ObservableObject({
    position: { x: 0, y: 0 },
    time: -1,
  }),
  upTarget: new Observable(document.body),
  up: new ObservableObject({
    position: { x: 0, y: 0 },
    time: -1,    
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
  })
  pointerInfo.downTarget.setValue(target as HTMLElement)
  pointerInfo.isDown.setValue(true)
})

window.addEventListener('pointerup', event => {
  const { x, y, timeStamp: time, target } = event
  pointerInfo.position.updateValue({ down: false })
  pointerInfo.up.updateValue({
    position: { x, y },
    time,
  })
  pointerInfo.upTarget.setValue(target as HTMLElement)
  pointerInfo.isDown.setValue(false)
})
