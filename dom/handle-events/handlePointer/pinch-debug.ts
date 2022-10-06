import { Point } from '../../../geom'

export const updateDebugDisplay = (point0: Point, point1: Point) => {
  const createPin = (id: string, html: string) => {
    const div = document.createElement('div')
    div.id = id
    document.body.append(div)
    div.style.position = 'fixed'
    div.style.width = '32px'
    div.style.height = '32px'
    div.style.border = 'solid 2px #0006'
    div.style.borderRadius = '50%'
    div.style.transform = 'translate(-50%, -50%)'
    div.style.backgroundColor = '#fff6'
    div.style.display = 'flex'
    div.style.justifyContent = 'center'
    div.style.alignItems = 'center'
    div.innerHTML = html
    return div
  }
  const createCenter = (id: string) => {
    const div = document.createElement('div')
    div.id = id
    document.body.append(div)
    div.style.position = 'fixed'
    div.style.width = '16px'
    div.style.height = '16px'
    div.style.borderRadius = '50%'
    div.style.transform = 'translate(-50%, -50%)'
    div.style.backgroundColor = '#0006'
    return div
  }
  const id0 = 'handlePinch-debug-pin-0'
  const id1 = 'handlePinch-debug-pin-1'
  const id2 = 'handlePinch-debug-center'
  const pin0 = document.querySelector(`#${id0}`) as HTMLDivElement ?? createPin(id0, '0')
  const pin1 = document.querySelector(`#${id1}`) as HTMLDivElement ?? createPin(id1, '1')
  const center = document.querySelector(`#${id2}`) as HTMLDivElement ?? createCenter(id2)
  pin0.style.left = `${point0.x}px`
  pin0.style.top = `${point0.y}px`
  pin1.style.left = `${point1.x}px`
  pin1.style.top = `${point1.y}px`
  center.style.left = `${(point0.x + point1.x) / 2}px`
  center.style.top = `${(point0.y + point1.y) / 2}px`
}

export const destroyDebugDisplay = () => {
  const id0 = 'handlePinch-debug-pin-0'
  const id1 = 'handlePinch-debug-pin-1'
  const id2 = 'handlePinch-debug-center'
  document.querySelector(`#${id0}`)?.remove()
  document.querySelector(`#${id1}`)?.remove()
  document.querySelector(`#${id2}`)?.remove()
}
