
export const handleFrame = (callback: () => void, {
  immediate = false,
} = {}) => {
  let frameID = -1
  
  const loop = () => {
    frameID = window.requestAnimationFrame(loop)
    callback()
  }
  
  const destroy = () => {
    window.cancelAnimationFrame(frameID)
  }

  if (immediate) {
    loop()
  }
  else {
    frameID = window.requestAnimationFrame(loop)
  }

  return { destroy }
}