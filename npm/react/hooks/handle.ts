import React from 'react'
import { Options, handlePointer, getWindowSize, handleWindow } from '../../../dom/handle-events'

export function usePointerHandle(ref: React.RefObject<HTMLElement>, options: Options) {

  React.useEffect(() => {
    
    const { destroy } = handlePointer(ref.current!, options)
    return destroy

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}

export const useWindowHandle = () => {
  const [size, setSize] = React.useState(getWindowSize())
  React.useEffect(() => handleWindow({
    executeOnResize: false,
    onResize: size => setSize(size),
  }).destroy)
  return size
}
