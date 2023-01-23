
type WindowSize = {
  width: number
  height: number
  aspect: number
}

type Options = Partial<{
  /** @obsolete @deprecated Not clear, prefer "executeOnResizeImmediately" instead. */
  executeOnResize: boolean
  executeOnResizeImmediately: boolean
  onResize: (size: WindowSize, sizeOld: WindowSize) => void
}>

const size: WindowSize = {
  width: window.innerWidth,
  height: window.innerHeight,
  aspect: window.innerWidth / window.innerHeight,
}

const sizeOld = { ...size }

export const getWindowSize = () => size

export const handleWindow = ({
  executeOnResize = true,
  executeOnResizeImmediately = executeOnResize, // Depends from the deprecated variable, but no other choice here. 
  onResize,
}: Options) => {
  
  const _onResize = () => {
    Object.assign(sizeOld, size)
    size.width = window.innerWidth
    size.height = window.innerHeight
    size.aspect = window.innerWidth / window.innerHeight
    onResize?.(size, sizeOld)
  }

  if (executeOnResizeImmediately) {
    onResize?.(size, sizeOld)
  }
  
  window.addEventListener('resize', _onResize)

  const destroy = () => {
    window.removeEventListener('resize', _onResize)
  }

  return { destroy }
}
